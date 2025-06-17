from flask import Blueprint, request, jsonify
from app.utils.auth import token_required
from app.services.jira_helper import JiraHelper
from app.models.jira_config import JiraConfig
from datetime import datetime, timezone
from collections import defaultdict
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

sprint_details_bp = Blueprint("sprint_details", __name__, url_prefix="/api/sprint-details")

@sprint_details_bp.route("/status", methods=["GET"])
@token_required
def get_sprint_status(current_user):
    """Get comprehensive sprint status including story progress, individual status, and bug status."""
    try:
        # Get query parameters
        project_key = request.args.get("projectKey")
        board_id = request.args.get("boardId")

        if not project_key or not board_id:
            return jsonify({
                "error": "Missing required parameters",
                "message": "Please provide projectKey and boardId"
            }), 400

        # Get active Jira configuration
        jira_config = JiraConfig.objects(user=current_user, is_active=True).first()
        if not jira_config:
            logger.error("No active Jira configuration found")
            return jsonify({
                "error": "No Jira configuration found",
                "message": "Please configure Jira first"
            }), 404

        # Initialize Jira helper with configuration
        jira_helper = JiraHelper(
            domain=jira_config.domain,
            email=jira_config.email,
            api_token=jira_config.api_token
        )

        # Get active sprint
        active_sprint = jira_helper.get_active_sprint(board_id)
        if not active_sprint:
            return jsonify({
                "error": "No active sprint",
                "message": "No active sprint found for the selected board"
            }), 404

        sprint_id = active_sprint["id"]
        
        # Get sprint details
        sprint_details = jira_helper.get_sprint_details(sprint_id)
        if not sprint_details:
            return jsonify({
                "error": "Sprint details not found",
                "message": "Could not fetch sprint details"
            }), 404

        # Get issues from sprint
        issues = jira_helper.get_sprint_issues(sprint_id)
        if not issues:
            return jsonify({
                "error": "No issues found",
                "message": "No issues found in the active sprint"
            }), 404

        # Calculate story progress
        story_progress = get_story_progress(issues)
        
        # Get individual status
        individual_status = get_individual_status(issues)
        
        # Get bug status
        bug_status = get_bug_status(issues)

        # Calculate sprint metrics
        sprint_metrics = calculate_sprint_metrics(sprint_details, issues)

        return jsonify({
            "sprint": {
                "id": sprint_details.get("id"),
                "name": sprint_details.get("name"),
                "state": sprint_details.get("state"),
                "startDate": sprint_details.get("startDate"),
                "endDate": sprint_details.get("endDate"),
                "goal": sprint_details.get("goal")
            },
            "storyProgress": story_progress,
            "individualStatus": individual_status,
            "bugStatus": bug_status,
            "sprintMetrics": sprint_metrics
        })

    except Exception as e:
        logger.error(f"Error getting sprint status: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500

def get_story_progress(issues):
    """Calculate story progress by status."""
    # Initialize counters
    to_do = 0
    in_progress = 0
    done = 0
    total_stories = 0
    
    for issue in issues:
        # Check if issuetype exists and is a story
        if not issue.get("fields", {}).get("issuetype", {}).get("name", "").lower() == "story":
            continue
            
        status = issue.get("fields", {}).get("status", {}).get("name", "").lower()
        total_stories += 1
        
        if status in ["done", "completed"]:
            done += 1
        elif status in ["in progress", "inprogress"]:
            in_progress += 1
        else:
            to_do += 1

    # Calculate percentages
    to_do_percentage = (to_do / total_stories * 100) if total_stories > 0 else 0
    in_progress_percentage = (in_progress / total_stories * 100) if total_stories > 0 else 0
    done_percentage = (done / total_stories * 100) if total_stories > 0 else 0

    return {
        "toDo": {
            "count": to_do,
            "percentage": round(to_do_percentage, 2)
        },
        "inProgress": {
            "count": in_progress,
            "percentage": round(in_progress_percentage, 2)
        },
        "done": {
            "count": done,
            "percentage": round(done_percentage, 2)
        },
        "total": total_stories
    }

def get_individual_status(issues):
    """Get individual status for each assignee."""
    individual_status = defaultdict(list)
    
    for issue in issues:
        fields = issue.get("fields", {})
        assignee = fields.get("assignee", {}).get("displayName", "Unassigned")
        ticket_id = issue.get("key", "")
        title = fields.get("summary", "")
        status = fields.get("status", {}).get("name", "Unknown")
        issue_type = fields.get("issuetype", {}).get("name", "Unknown")
        priority = fields.get("priority", {}).get("name", "Not set")
        
        individual_status[assignee].append({
            "ticketId": ticket_id,
            "title": title,
            "status": status,
            "type": issue_type,
            "priority": priority
        })

    return dict(individual_status)

def get_bug_status(issues):
    """Get status of all bugs in the sprint."""
    bugs = []
    
    for issue in issues:
        fields = issue.get("fields", {})
        if not fields.get("issuetype", {}).get("name", "").lower() == "bug":
            continue
            
        key = issue.get("key", "")
        summary = fields.get("summary", "")
        assignee = fields.get("assignee", {}).get("displayName", "Unassigned")
        status = fields.get("status", {}).get("name", "Unknown")
        priority = fields.get("priority", {}).get("name", "Not set")
        
        bugs.append({
            "key": key,
            "summary": summary,
            "assignee": assignee,
            "status": status,
            "priority": priority
        })

    return bugs

def calculate_sprint_metrics(sprint_details, issues):
    """Calculate sprint metrics including velocity and time remaining."""
    # Calculate story points
    planned_points = 0
    completed_points = 0
    
    for issue in issues:
        fields = issue.get("fields", {})
        story_points = fields.get("customfield_10016", 0) or 0
        planned_points += story_points
        if fields.get("status", {}).get("name", "").lower() in ["done", "completed"]:
            completed_points += story_points

    # Calculate time remaining
    now_utc = datetime.now(timezone.utc)
    start_date = parse_jira_date(sprint_details.get("startDate"))
    end_date = parse_jira_date(sprint_details.get("endDate"))
    
    time_remaining = {
        "totalDays": None,
        "elapsedDays": None,
        "remainingDays": None
    }
    
    if start_date and end_date:
        total_duration = end_date - start_date
        elapsed_duration = now_utc - start_date
        
        if elapsed_duration.total_seconds() < 0:
            elapsed_duration = total_duration.__class__(0)
            
        remaining_duration = end_date - now_utc
        if remaining_duration.total_seconds() < 0:
            remaining_duration = total_duration.__class__(0)
            
        time_remaining = {
            "totalDays": total_duration.days,
            "elapsedDays": elapsed_duration.days,
            "remainingDays": remaining_duration.days
        }

    return {
        "velocity": {
            "plannedPoints": planned_points,
            "completedPoints": completed_points,
            "completionRate": round((completed_points / planned_points * 100) if planned_points > 0 else 0, 2)
        },
        "timeRemaining": time_remaining
    }

def parse_jira_date(jira_date_str):
    """Parse Jira date string to datetime object."""
    if not jira_date_str:
        return None
        
    try:
        # Handle ISO format with timezone
        return datetime.fromisoformat(jira_date_str.replace("Z", "+00:00"))
    except ValueError:
        try:
            # Handle format with milliseconds
            return datetime.strptime(jira_date_str, "%Y-%m-%dT%H:%M:%S.%f%z")
        except ValueError:
            return None 