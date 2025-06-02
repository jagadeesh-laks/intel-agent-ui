import requests
from typing import List, Dict, Any
from datetime import datetime, timedelta

class JiraHelper:
    def __init__(self, domain: str, email: str, token: str):
        self.base = f"https://{domain}"
        self.auth = (email, token)
        self.headers = {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }

    def create_sprint(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new sprint in Jira."""
        url = f"{self.base}/rest/agile/1.0/sprint"
        response = requests.post(url, json=payload, auth=self.auth, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def get_sprint_issues(self, board_id: int, sprint_id: int) -> Dict[str, Any]:
        """Get all issues in a sprint."""
        url = f"{self.base}/rest/agile/1.0/board/{board_id}/sprint/{sprint_id}/issue"
        response = requests.get(url, auth=self.auth, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def add_issues_to_sprint(self, sprint_id: int, issue_keys: List[str]) -> None:
        """Add issues to a sprint."""
        url = f"{self.base}/rest/agile/1.0/sprint/{sprint_id}/issue"
        payload = {"issues": issue_keys}
        response = requests.post(url, json=payload, auth=self.auth, headers=self.headers)
        response.raise_for_status()

    def close_sprint(self, sprint_id: int) -> None:
        """Close a sprint."""
        url = f"{self.base}/rest/agile/1.0/sprint/{sprint_id}/complete"
        response = requests.post(url, auth=self.auth, headers=self.headers)
        response.raise_for_status()

    def list_backlog_items(self, project_key: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """List backlog items for a project."""
        url = f"{self.base}/rest/agile/1.0/backlog/{project_key}?maxResults={max_results}"
        response = requests.get(url, auth=self.auth, headers=self.headers)
        response.raise_for_status()
        return response.json()["issues"]

    def get_sprint_details(self, sprint_id: int) -> Dict[str, Any]:
        """Get details of a specific sprint."""
        url = f"{self.base}/rest/agile/1.0/sprint/{sprint_id}"
        response = requests.get(url, auth=self.auth, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def get_board_sprints(self, board_id: int) -> List[Dict[str, Any]]:
        """Get all sprints for a board."""
        url = f"{self.base}/rest/agile/1.0/board/{board_id}/sprint"
        response = requests.get(url, auth=self.auth, headers=self.headers)
        response.raise_for_status()
        return response.json()["values"] 