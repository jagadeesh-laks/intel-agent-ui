from flask import Blueprint, request, jsonify
from app.utils.auth import token_required
from app.services.jira_helper import JiraHelper
from app.models.jira_config import JiraConfig
from app.models.user import User
from datetime import datetime
from dateutil import parser
import logging
import requests

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

sprint_bp = Blueprint("sprint_timeline", __name__, url_prefix="/api/scrum-master")

def compute_progress_and_deviation(start_date_str, end_date_str, issues):
    """
    Compute sprint progress and deviation based on issues and dates
    """
    try:
        # Parse ISO datetime
        start_dt = parser.isoparse(start_date_str)
        end_dt = parser.isoparse(end_date_str)

        # Count issues done vs total
        total_issues = len(issues)
        done_count = sum(
            1 for issue in issues
            if issue.get("fields", {}).get("status", {}).get("name", "").lower() in ("done", "closed")
        )
        progress = round((done_count / total_issues) * 100) if total_issues > 0 else 0

        # Expected progress based on calendar
        now = datetime.utcnow()
        total_duration = (end_dt - start_dt).total_seconds()
        elapsed = (now - start_dt).total_seconds()
        
        if elapsed < 0:
            expected = 0
        elif elapsed > total_duration:
            expected = 100
        else:
            expected = round((elapsed / total_duration) * 100)

        deviation = progress - expected

        return progress, deviation, start_dt.date().isoformat(), end_dt.date().isoformat()
    except Exception as e:
        logger.error(f"Error computing progress: {str(e)}")
        raise

@sprint_bp.route("/sprint-timeline", methods=["GET"])
@token_required
def get_sprint_timeline(current_user):
    """Get sprint timeline data including progress and dates"""
    try:
        logger.debug(f"Getting sprint timeline for user: {current_user.email}")
        
        board_id = request.args.get("boardId")
        sprint_id = request.args.get("sprintId")
        
        if not board_id or not sprint_id:
            logger.error("Missing boardId or sprintId")
            return jsonify({"error": "Missing boardId or sprintId"}), 400

        # Get active Jira configuration
        jira_config = JiraConfig.objects(user=current_user, is_active=True).first()
        if not jira_config:
            logger.error(f"No Jira config found for user: {current_user.email}")
            return jsonify({"error": "Jira not configured for this user"}), 400

        # Initialize Jira helper
        jira_helper = JiraHelper(
            domain=jira_config.domain,
            email=jira_config.email,
            api_token=jira_config.api_token
        )

        # Get sprint details
        try:
            logger.debug(f"Getting sprint details for sprint ID: {sprint_id}")
            sprint_details = jira_helper.get_sprint_details(int(sprint_id))
            start_date_iso = sprint_details.get("startDate")
            end_date_iso = sprint_details.get("endDate")

            if not start_date_iso or not end_date_iso:
                logger.error(f"Sprint {sprint_id} does not have valid dates")
                return jsonify({"error": "Sprint does not have valid dates"}), 400

            # Get sprint issues
            logger.debug(f"Getting issues for sprint ID: {sprint_id}")
            issues = jira_helper.get_sprint_issues(int(sprint_id))

            # Compute progress and deviation
            progress, deviation, start_date, due_date = compute_progress_and_deviation(
                start_date_iso, end_date_iso, issues
            )

            logger.info(f"Successfully computed sprint timeline for sprint {sprint_id}")
            return jsonify({
                "progress": progress,
                "deviation": deviation,
                "startDate": start_date,
                "dueDate": due_date
            })
        except requests.exceptions.RequestException as e:
            logger.error(f"Jira API error: {str(e)}")
            return jsonify({"error": f"Jira API error: {str(e)}"}), 500

    except Exception as e:
        logger.error(f"Error fetching sprint timeline: {str(e)}")
        return jsonify({"error": f"Could not fetch sprint timeline: {str(e)}"}), 500 