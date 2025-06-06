from flask import Blueprint, request, jsonify, current_app
from app.utils.auth import token_required
from app.db import get_mongo_client
from app.ai_clients.base import AIClientFactory
from app.intent_schemas import INTENT_SCHEMAS
from app.services.jira_helper import JiraHelper
from app.intent_handlers import invoke_intent_function
from app.models.jira_config import JiraConfig
from app.models.user import User
import json
from datetime import datetime
import logging
import jwt

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

chat_bp = Blueprint("chat", __name__, url_prefix="/api")

def validate_token(token):
    """Validate JWT token and return user."""
    try:
        data = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        user = User.objects(id=data['user_id']).first()
        if not user:
            logger.error("User not found for token")
            return None
        return user
    except Exception as e:
        logger.error(f"Token validation error: {str(e)}")
        return None

def create_default_user_config(user_id: str, db) -> None:
    """Create default user configuration if it doesn't exist."""
    default_config = {
        "userId": user_id,
        "aiEngine": "ChatGPT",
        "aiCredentials": "your-openai-api-key-here",  # Replace with actual API key
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    db.user_configs.insert_one(default_config)
    logger.info(f"Created default user configuration for user {user_id}")

@chat_bp.route("/debug/config", methods=["GET"])
def debug_config():
    """Debug endpoint to check user configurations."""
    try:
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "No token provided"}), 401

        token = auth_header.split(" ")[1]
        current_user = validate_token(token)
        if not current_user:
            return jsonify({"error": "Invalid token"}), 401

        user_id = str(current_user.id)
        db = get_mongo_client().mydb

        # Get all configs for the user
        all_configs = list(db.user_configs.find({"userId": user_id}))
        
        # Format the configs for display (masking sensitive data)
        formatted_configs = []
        for config in all_configs:
            formatted_config = {
                "userId": config.get("userId"),
                "aiEngine": config.get("aiEngine"),
                "aiCredentials": config.get("aiCredentials"),  # Show actual credentials for debugging
                "createdAt": config.get("createdAt"),
                "updatedAt": config.get("updatedAt")
            }
            formatted_configs.append(formatted_config)

        return jsonify({
            "user_id": user_id,
            "configs": formatted_configs,
            "count": len(formatted_configs)
        })

    except Exception as e:
        logger.error(f"Error in debug endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@chat_bp.route("/chat", methods=["POST"])
def chat():
    """Handle chat requests and process intents."""
    try:
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            logger.error("No valid Authorization header found")
            return jsonify({"error": "No token provided"}), 401

        token = auth_header.split(" ")[1]
        current_user = validate_token(token)
        if not current_user:
            logger.error("Invalid token")
            return jsonify({"error": "Invalid token"}), 401

        data = request.get_json()
        logger.debug(f"Received chat request data: {data}")
        
        ai_engine = data.get("aiEngine", "").lower()  # Convert to lowercase
        project_key = data.get("projectKey")
        board_id = data.get("boardId")
        user_message = data.get("userMessage")
        user_id = str(current_user.id)

        if not all([ai_engine, project_key, board_id, user_message]):
            logger.error("Missing required fields in request")
            return jsonify({"error": "Missing required fields"}), 400

        # Get MongoDB client
        db = get_mongo_client().scrum_master_db

        # Debug: Show all configs in the database
        all_configs = list(db.user_configs.find())
        logger.debug(f"All configs in database: {all_configs}")

        # Get AI configuration for the requested engine
        ai_config = db.user_configs.find_one({
            "userId": user_id,
            "aiEngine": ai_engine
        })
        logger.debug(f"Found AI config for {ai_engine}: {ai_config}")
        
        if not ai_config:
            logger.error(f"No {ai_engine} configuration found")
            return jsonify({
                "error": f"{ai_engine} configuration not found",
                "debug": {
                    "allConfigs": all_configs
                }
            }), 400

        # Get Jira configuration
        jira_config = JiraConfig.objects(user=current_user, is_active=True).first()
        if not jira_config:
            logger.error("No active Jira configuration found")
            return jsonify({"error": "Jira not configured"}), 400

        # Initialize Jira helper
        jira_helper = JiraHelper(
            domain=jira_config.domain,
            email=jira_config.email,
            api_token=jira_config.api_token
        )

        # Fetch last 5 messages from conversations
        convo = db.conversations.find_one({
            "userId": user_id,
            "projectKey": project_key,
            "boardId": board_id
        })

        # Build messages list
        messages = []
        if convo and "messages" in convo:
            # Convert messages to AI format, removing timestamps
            messages = [{
                "role": msg["role"],
                "content": msg["content"]
            } for msg in convo["messages"][-5:]]

        # Add system message
        system_msg = {
            "role": "system",
            "content": f"You are a Scrum Master assistant for project {project_key}. "
                      f"Use Jira to create sprints, fetch sprint status, add issues, "
                      f"close sprints, and list backlog items."
        }
        messages = [system_msg] + messages

        # Add new user message
        messages.append({
            "role": "user",
            "content": user_message
        })

        # Initialize AI client with the credentials from the config
        try:
            logger.debug(f"Creating AI client with engine: {ai_engine}")
            ai_client = AIClientFactory.create_client(ai_engine, ai_config["aiCredentials"])
        except Exception as e:
            logger.error(f"Error creating AI client: {str(e)}")
            return jsonify({"error": f"Error initializing AI client: {str(e)}"}), 500

        # Get AI response
        try:
            logger.debug("Getting AI response...")
            ai_response = ai_client.chat(messages)
            logger.debug("Got AI response successfully")
        except Exception as e:
            logger.error(f"Error getting AI response: {str(e)}")
            return jsonify({"error": f"Error getting AI response: {str(e)}"}), 500

        # Save conversation
        if not convo:
            convo = {
                "userId": user_id,
                "projectKey": project_key,
                "boardId": board_id,
                "messages": []
            }
            db.conversations.insert_one(convo)

        # Add messages to conversation with timestamps
        current_time = datetime.utcnow()
        db.conversations.update_one(
            {"_id": convo["_id"]},
            {
                "$push": {
                    "messages": {
                        "role": "user",
                        "content": user_message,
                        "timestamp": current_time
                    },
                    "messages": {
                        "role": "assistant",
                        "content": ai_response,
                        "timestamp": current_time
                    }
                }
            }
        )

        return jsonify({
            "response": ai_response,
            "projectKey": project_key,
            "boardId": board_id
        })

    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500 