import requests
from typing import List, Dict, Any
from datetime import datetime, timedelta
from requests.auth import HTTPBasicAuth
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class JiraHelper:
    def __init__(self, domain: str, email: str, api_token: str):
        """
        Initialize JiraHelper with domain and credentials
        """
        # Clean up domain URL
        domain = domain.replace('https://', '').replace('http://', '')
        self.base_url = f"https://{domain}"
        self.auth = HTTPBasicAuth(email, api_token)
        self.headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
        logger.debug(f"Initialized JiraHelper with base URL: {self.base_url}")

    def create_sprint(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new sprint in Jira."""
        url = f"{self.base_url}/rest/agile/1.0/sprint"
        response = requests.post(url, json=payload, auth=self.auth, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def get_sprint_issues(self, sprint_id: int) -> list:
        """
        Get all issues in a sprint
        """
        try:
            url = f"{self.base_url}/rest/agile/1.0/sprint/{sprint_id}/issue"
            params = {
                'maxResults': 1000,
                'fields': 'status,summary,assignee,issuetype,priority,customfield_10016'
            }
            logger.debug(f"Getting sprint issues from: {url}")
            response = requests.get(url, auth=self.auth, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json().get('issues', [])
        except Exception as e:
            logger.error(f"Error getting sprint issues: {str(e)}")
            raise

    def add_issues_to_sprint(self, sprint_id: int, issue_keys: List[str]) -> None:
        """Add issues to a sprint."""
        url = f"{self.base_url}/rest/agile/1.0/sprint/{sprint_id}/issue"
        payload = {"issues": issue_keys}
        response = requests.post(url, json=payload, auth=self.auth, headers=self.headers)
        response.raise_for_status()

    def close_sprint(self, sprint_id: int) -> None:
        """Close a sprint."""
        url = f"{self.base_url}/rest/agile/1.0/sprint/{sprint_id}/complete"
        response = requests.post(url, auth=self.auth, headers=self.headers)
        response.raise_for_status()

    def list_backlog_items(self, project_key: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """List backlog items for a project."""
        url = f"{self.base_url}/rest/agile/1.0/backlog/{project_key}?maxResults={max_results}"
        response = requests.get(url, auth=self.auth, headers=self.headers)
        response.raise_for_status()
        return response.json()["issues"]

    def get_sprint_details(self, sprint_id: int) -> dict:
        """
        Get details of a specific sprint
        """
        try:
            url = f"{self.base_url}/rest/agile/1.0/sprint/{sprint_id}"
            logger.debug(f"Getting sprint details from: {url}")
            response = requests.get(url, auth=self.auth, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error getting sprint details: {str(e)}")
            raise

    def get_board_sprints(self, board_id: int) -> List[Dict[str, Any]]:
        """Get all sprints for a board."""
        url = f"{self.base_url}/rest/agile/1.0/board/{board_id}/sprint"
        response = requests.get(url, auth=self.auth, headers=self.headers)
        response.raise_for_status()
        return response.json()["values"]

    def get_active_sprint(self, board_id: int) -> dict:
        """
        Get the active sprint for a board
        """
        try:
            url = f"{self.base_url}/rest/agile/1.0/board/{board_id}/sprint"
            params = {
                'state': 'active'
            }
            logger.debug(f"Getting active sprint from: {url}")
            response = requests.get(url, auth=self.auth, headers=self.headers, params=params)
            response.raise_for_status()
            sprints = response.json().get('values', [])
            return sprints[0] if sprints else None
        except Exception as e:
            logger.error(f"Error getting active sprint: {str(e)}")
            raise 