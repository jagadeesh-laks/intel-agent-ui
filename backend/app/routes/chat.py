from flask import Blueprint, request, jsonify, current_app
from app.utils.auth import token_required
from app.services.mongo_client import get_mongo_client
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
@token_required
def chat(current_user):
    """Handle chat requests and process intents."""
    try:
        data = request.get_json()
        logger.debug(f"Received chat request data: {data}")
        
        ai_engine = data.get("aiEngine", "").lower()  # Convert to lowercase
        project_key = data.get("projectKey")
        board_id = data.get("boardId")
        user_message = data.get("userMessage")
        user_id = str(current_user.id)

        if not all([ai_engine, project_key, board_id, user_message]):
            logger.error("Missing required fields in request")
            return jsonify({
                "error": "Missing required fields",
                "message": "Please provide aiEngine, projectKey, boardId, and userMessage"
            }), 400

        # Get MongoDB client
        db = get_mongo_client().scrum_master_db

        # Get the most recent AI configuration for the user
        ai_config = db.user_configs.find_one(
            {
                "userId": user_id,
                "aiEngine": ai_engine
            },
            sort=[("updated_at", -1)]
        )

        if not ai_config:
            logger.error(f"No AI configuration found for user {user_id} and engine {ai_engine}")
            return jsonify({
                "error": "AI engine not configured",
                "message": f"Please configure {ai_engine} in your settings first"
            }), 400

        if "aiCredentials" not in ai_config:
            logger.error(f"Missing AI credentials for user {user_id} and engine {ai_engine}")
            return jsonify({
                "error": "AI credentials missing",
                "message": f"Please update your {ai_engine} configuration with valid credentials"
            }), 400

        # Get existing conversation or create new one
        convo = db.conversations.find_one({
            "userId": user_id,
            "projectKey": project_key,
            "boardId": board_id
        })

        # Prepare messages for AI
        messages = []
        if convo and "messages" in convo:
            # Get last 10 messages for context
            recent_messages = convo["messages"][-10:]
            # Flatten any nested lists and ensure proper message format
            for msg in recent_messages:
                if isinstance(msg, list):
                    # If it's a list, process each message in the list
                    for sub_msg in msg:
                        if isinstance(sub_msg, dict) and 'role' in sub_msg and 'content' in sub_msg:
                            messages.append({
                                "role": sub_msg["role"],
                                "content": sub_msg["content"]
                            })
                elif isinstance(msg, dict) and 'role' in msg and 'content' in msg:
                    # If it's a single message, add it directly
                    messages.append({
                        "role": msg["role"],
                        "content": msg["content"]
                    })

        # Add system message
        system_msg = {
            "role": "system",
            "content": f"You are a Scrum Master AI assistant helping with project {project_key} and board {board_id}. "
                      f"Your role is to help manage sprints, track issues, and coordinate with the team. "
                      f"Be concise and professional in your responses."
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
            return jsonify({
                "error": "AI client error",
                "message": f"Failed to initialize {ai_engine} client. Please check your configuration."
            }), 500

        # Get AI response
        try:
            logger.debug("Getting AI response...")
            ai_response = ai_client.chat(messages)
            logger.debug("Got AI response successfully")

            # Save conversation
            if not convo:
                # Create new conversation
                db.conversations.insert_one({
                    "userId": user_id,
                    "projectKey": project_key,
                    "boardId": board_id,
                    "messages": [
                        {
                            "role": "user",
                            "content": user_message,
                            "timestamp": datetime.utcnow()
                        },
                        {
                            "role": "assistant",
                            "content": ai_response,
                            "timestamp": datetime.utcnow()
                        }
                    ],
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                })
            else:
                # Update existing conversation - push each message individually
                db.conversations.update_one(
                    {
                        "userId": user_id,
                        "projectKey": project_key,
                        "boardId": board_id
                    },
                    {
                        "$push": {
                            "messages": {
                                "$each": [
                                    {
                                        "role": "user",
                                        "content": user_message,
                                        "timestamp": datetime.utcnow()
                                    },
                                    {
                                        "role": "assistant",
                                        "content": ai_response,
                                        "timestamp": datetime.utcnow()
                                    }
                                ]
                            }
                        },
                        "$set": {
                            "updated_at": datetime.utcnow()
                        }
                    }
                )

            return jsonify({"response": ai_response})

        except Exception as e:
            logger.error(f"Error getting AI response: {str(e)}")
            return jsonify({
                "error": "AI response error",
                "message": f"Failed to get response from {ai_engine}. Please try again."
            }), 500

    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Internal server error",
            "message": "An unexpected error occurred. Please try again."
        }), 500 