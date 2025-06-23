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
import requests
import re

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
        ai_engine = data.get("aiEngine")
        project_key = data.get("projectKey")
        board_id = data.get("boardId")
        user_message = data.get("userMessage", "").strip().lower()

        if not ai_engine or not project_key or not board_id or not user_message:
            return jsonify({
                "error": "Missing required fields",
                "message": "aiEngine, projectKey, boardId, and userMessage are required."
            }), 400

        # 1. Check for specific member status query
        member_status_match = re.search(r"status of ([a-zA-Z .,'-]+)", user_message)
        if member_status_match:
            # Extract member name(s)
            names_str = member_status_match.group(1)
            # Support multiple names separated by 'or', 'and', ','
            names = re.split(r"\s*or\s*|\s*and\s*|,", names_str)
            names = [n.strip().title() for n in names if n.strip()]
            return _handle_specific_member_status(current_user, project_key, board_id, names)

        # 2. Sprint status intent
        if any(kw in user_message for kw in ["sprint status", "status of the sprint", "current sprint status"]):
            return _handle_sprint_status(current_user, project_key, board_id)
        # 3. Individual status intent
        if any(kw in user_message for kw in ["individual status", "team status", "member status", "who is doing what"]):
            return _handle_individual_status(current_user, project_key, board_id)

        # Get MongoDB client
        db = get_mongo_client().scrum_master_db

        # Get the most recent AI configuration for the user
        ai_config = db.user_configs.find_one(
            {
                "userId": str(current_user.id),
                "aiEngine": ai_engine
            },
            sort=[("updated_at", -1)]
        )

        if not ai_config:
            logger.error(f"No AI configuration found for user {str(current_user.id)} and engine {ai_engine}")
            return jsonify({
                "error": "AI engine not configured",
                "message": f"Please configure {ai_engine} in your settings first"
            }), 400

        if "aiCredentials" not in ai_config:
            logger.error(f"Missing AI credentials for user {str(current_user.id)} and engine {ai_engine}")
            return jsonify({
                "error": "AI credentials missing",
                "message": f"Please update your {ai_engine} configuration with valid credentials"
            }), 400

        # Get existing conversation or create new one
        convo = db.conversations.find_one({
            "userId": str(current_user.id),
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
                    "userId": str(current_user.id),
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
                        "userId": str(current_user.id),
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
        logger.error(f"Error in chat endpoint: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500

def _handle_sprint_status(current_user, project_key, board_id):
    try:
        # Get active Jira configuration
        jira_config = JiraConfig.objects(user=current_user, is_active=True).first()
        if not jira_config:
            return jsonify({
                "response": "Jira is not configured for your account. Please configure Jira first."
            })
        jira_helper = JiraHelper(
            domain=jira_config.domain,
            email=jira_config.email,
            api_token=jira_config.api_token
        )
        active_sprint = jira_helper.get_active_sprint(board_id)
        if not active_sprint:
            return jsonify({"response": "No active sprint found for the selected board."})
        sprint_id = active_sprint["id"]
        sprint_details = jira_helper.get_sprint_details(sprint_id)
        issues = jira_helper.get_sprint_issues(sprint_id)
        # Compose bullet-point summary
        summary = _format_sprint_status(sprint_details, issues)
        return jsonify({"response": summary})
    except Exception as e:
        logger.error(f"Error in _handle_sprint_status: {str(e)}", exc_info=True)
        return jsonify({"response": f"Error fetching sprint status: {str(e)}"})

def _handle_individual_status(current_user, project_key, board_id):
    try:
        # Get active Jira configuration
        jira_config = JiraConfig.objects(user=current_user, is_active=True).first()
        if not jira_config:
            return jsonify({
                "response": "Jira is not configured for your account. Please configure Jira first."
            })
        jira_helper = JiraHelper(
            domain=jira_config.domain,
            email=jira_config.email,
            api_token=jira_config.api_token
        )
        active_sprint = jira_helper.get_active_sprint(board_id)
        if not active_sprint:
            return jsonify({"response": "No active sprint found for the selected board."})
        sprint_id = active_sprint["id"]
        issues = jira_helper.get_sprint_issues(sprint_id)
        # Compose bullet-point summary
        summary = _format_individual_status(issues)
        return jsonify({"response": summary})
    except Exception as e:
        logger.error(f"Error in _handle_individual_status: {str(e)}", exc_info=True)
        return jsonify({"response": f"Error fetching individual status: {str(e)}"})

def _format_sprint_status(sprint_details, issues):
    # Calculate story progress
    to_do = in_progress = done = total = 0
    for issue in issues:
        if issue.get("fields", {}).get("issuetype", {}).get("name", "").lower() == "story":
            status = issue.get("fields", {}).get("status", {}).get("name", "").lower()
            total += 1
            if status in ["done", "completed"]:
                done += 1
            elif status in ["in progress", "inprogress"]:
                in_progress += 1
            else:
                to_do += 1
    to_do_pct = (to_do / total * 100) if total else 0
    in_progress_pct = (in_progress / total * 100) if total else 0
    done_pct = (done / total * 100) if total else 0
    # Velocity (story points)
    planned_points = completed_points = 0
    for issue in issues:
        if issue.get("fields", {}).get("issuetype", {}).get("name", "").lower() == "story":
            points = issue.get("fields", {}).get("customfield_10016", 0) or 0
            planned_points += points
            status = issue.get("fields", {}).get("status", {}).get("name", "").lower()
            if status in ["done", "completed"]:
                completed_points += points
    completion_rate = (completed_points / planned_points * 100) if planned_points else 0
    # Dates
    start = sprint_details.get("startDate", "N/A")
    end = sprint_details.get("endDate", "N/A")
    goal = sprint_details.get("goal", "N/A")
    name = sprint_details.get("name", "N/A")
    state = sprint_details.get("state", "N/A")
    summary = f"""
• Sprint: {name} ({state})
• Start Date: {start}
• End Date: {end}
• Goal: {goal}
• Story Progress:
  - To Do: {to_do} ({to_do_pct:.1f}%)
  - In Progress: {in_progress} ({in_progress_pct:.1f}%)
  - Done: {done} ({done_pct:.1f}%)
  - Total Stories: {total}
• Velocity: {planned_points} planned points, {completed_points} completed points ({completion_rate:.1f}% completion)
"""
    return summary.strip()

def _format_individual_status(issues):
    # Group by assignee
    from collections import defaultdict
    status_map = defaultdict(list)
    for issue in issues:
        fields = issue.get("fields", {})
        assignee = fields.get("assignee", {}).get("displayName", "Unassigned")
        ticket_id = issue.get("key", "")
        title = fields.get("summary", "")
        status = fields.get("status", {}).get("name", "Unknown")
        issue_type = fields.get("issuetype", {}).get("name", "Unknown")
        priority = fields.get("priority", {}).get("name", "Not set")
        status_map[assignee].append(f"- {ticket_id}: {title} ({status}, {issue_type}, {priority})")
    if not status_map:
        return "No individual status found for this sprint."
    lines = []
    for assignee, tickets in status_map.items():
        lines.append(f"• {assignee}:")
        lines.extend(tickets)
    return "\n".join(lines)

def _handle_specific_member_status(current_user, project_key, board_id, member_names):
    try:
        jira_config = JiraConfig.objects(user=current_user, is_active=True).first()
        if not jira_config:
            return jsonify({
                "response": "Jira is not configured for your account. Please configure Jira first."
            })
        jira_helper = JiraHelper(
            domain=jira_config.domain,
            email=jira_config.email,
            api_token=jira_config.api_token
        )
        active_sprint = jira_helper.get_active_sprint(board_id)
        if not active_sprint:
            return jsonify({"response": "No active sprint found for the selected board."})
        sprint_id = active_sprint["id"]
        issues = jira_helper.get_sprint_issues(sprint_id)
        # Group by assignee
        from collections import defaultdict
        status_map = defaultdict(list)
        for issue in issues:
            fields = issue.get("fields", {})
            assignee = fields.get("assignee", {}).get("displayName", "Unassigned")
            ticket_id = issue.get("key", "")
            title = fields.get("summary", "")
            status = fields.get("status", {}).get("name", "Unknown")
            issue_type = fields.get("issuetype", {}).get("name", "Unknown")
            priority = fields.get("priority", {}).get("name", "Not set")
            status_map[assignee].append(f"- {ticket_id}: {title} ({status}, {issue_type}, {priority})")
        # Filter for requested member(s)
        found = False
        lines = []
        for name in member_names:
            for assignee in status_map:
                if name.lower() == assignee.lower():
                    found = True
                    lines.append(f"• {assignee}:")
                    lines.extend(status_map[assignee])
        if not found:
            return jsonify({"response": f"No status found for {', '.join(member_names)} in this sprint."})
        return jsonify({"response": "\n".join(lines)})
    except Exception as e:
        logger.error(f"Error in _handle_specific_member_status: {str(e)}", exc_info=True)
        return jsonify({"response": f"Error fetching status for {', '.join(member_names)}: {str(e)}"}) 