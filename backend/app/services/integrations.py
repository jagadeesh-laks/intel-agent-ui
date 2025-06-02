import requests
import json
from datetime import datetime
from typing import Dict, List, Optional
from requests.auth import HTTPBasicAuth
import logging

logger = logging.getLogger(__name__)

class JiraService:
    def __init__(self, email: str, api_token: str, domain: str):
        self.email = email
        self.api_token = api_token
        self.domain = domain
        self.base_url = f"https://{domain}/rest/api/3"
        self.auth = HTTPBasicAuth(email, api_token)
        self.headers = {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        logger.debug(f"Initialized JiraService with domain: {domain}")

    def test_connection(self) -> bool:
        """Test the connection to Jira"""
        try:
            logger.debug(f"Testing connection to {self.base_url}/myself")
            response = requests.get(
                f"{self.base_url}/myself",
                auth=self.auth,
                headers=self.headers,
                timeout=10  # Add timeout
            )
            logger.debug(f"Response status: {response.status_code}")
            logger.debug(f"Response content: {response.text[:200]}...")  # Log first 200 chars
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException as e:
            logger.error(f"Error testing Jira connection: {str(e)}")
            return False

    def get_projects(self) -> List[Dict]:
        """Get all projects from Jira"""
        try:
            logger.debug(f"Fetching projects from {self.base_url}/project")
            response = requests.get(
                f"{self.base_url}/project",
                auth=self.auth,
                headers=self.headers,
                timeout=10  # Add timeout
            )
            logger.debug(f"Response status: {response.status_code}")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching Jira projects: {str(e)}")
            return []

    def get_boards(self, project_key: str) -> List[Dict]:
        """Get all boards for a project"""
        try:
            response = requests.get(
                f"{self.base_url}/board",
                auth=self.auth,
                headers={"Accept": "application/json"},
                params={"projectKeyOrId": project_key}
            )
            response.raise_for_status()
            return response.json().get("values", [])
        except requests.exceptions.RequestException as e:
            print(f"Error fetching Jira boards: {str(e)}")
            return []

    def get_sprints(self, board_id: int) -> List[Dict]:
        """Get all sprints for a board"""
        try:
            response = requests.get(
                f"{self.base_url}/board/{board_id}/sprint",
                auth=self.auth,
                headers={"Accept": "application/json"}
            )
            response.raise_for_status()
            return response.json().get("values", [])
        except requests.exceptions.RequestException as e:
            print(f"Error fetching Jira sprints: {str(e)}")
            return []

    def get_issues(self, sprint_id: int) -> List[Dict]:
        """Get all issues in a sprint"""
        try:
            response = requests.get(
                f"{self.base_url}/sprint/{sprint_id}/issue",
                auth=self.auth,
                headers={"Accept": "application/json"}
            )
            response.raise_for_status()
            return response.json().get("issues", [])
        except requests.exceptions.RequestException as e:
            print(f"Error fetching Jira issues: {str(e)}")
            return []

    def create_issue(self, project_key: str, summary: str, description: str, issue_type: str = "Task") -> Optional[Dict]:
        """Create a new issue in Jira"""
        try:
            data = {
                "fields": {
                    "project": {"key": project_key},
                    "summary": summary,
                    "description": description,
                    "issuetype": {"name": issue_type}
                }
            }
            response = requests.post(
                f"{self.base_url}/issue",
                auth=self.auth,
                headers={"Content-Type": "application/json"},
                json=data
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error creating Jira issue: {str(e)}")
            return None

    def update_issue(self, issue_key: str, updates: Dict) -> bool:
        """Update an existing issue in Jira"""
        try:
            response = requests.put(
                f"{self.base_url}/issue/{issue_key}",
                auth=self.auth,
                headers={"Content-Type": "application/json"},
                json={"fields": updates}
            )
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException as e:
            print(f"Error updating Jira issue: {str(e)}")
            return False

    def add_comment(self, issue_key: str, comment: str) -> bool:
        """Add a comment to an issue"""
        try:
            data = {"body": {"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": comment}]}]}}
            response = requests.post(
                f"{self.base_url}/issue/{issue_key}/comment",
                auth=self.auth,
                headers={"Content-Type": "application/json"},
                json=data
            )
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException as e:
            print(f"Error adding Jira comment: {str(e)}")
            return False

    def get_sprint_status(self, board_id):
        try:
            response = requests.get(
                f'{self.base_url}/rest/agile/1.0/board/{board_id}/sprint',
                auth=self.auth,
                headers={"Accept": "application/json"}
            )
            return response.json()
        except Exception as e:
            return {'error': str(e)}

    def get_team_velocity(self, board_id):
        try:
            response = requests.get(
                f'{self.base_url}/rest/agile/1.0/board/{board_id}/velocity',
                auth=self.auth,
                headers={"Accept": "application/json"}
            )
            return response.json()
        except Exception as e:
            return {'error': str(e)}

    def get_burndown(self, sprint_id):
        try:
            response = requests.get(
                f'{self.base_url}/rest/agile/1.0/sprint/{sprint_id}/burndown',
                auth=self.auth,
                headers={"Accept": "application/json"}
            )
            return response.json()
        except Exception as e:
            return {'error': str(e)}

class OllamaService:
    def __init__(self, base_url="http://localhost:11434"):
        self.base_url = base_url

    def query(self, prompt, model="llama2"):
        try:
            response = requests.post(
                f'{self.base_url}/api/generate',
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": False
                }
            )
            return response.json()
        except Exception as e:
            return {'error': str(e)}

    def get_sprint_insights(self, sprint_data):
        prompt = f"""
        Analyze the following sprint data and provide insights:
        {json.dumps(sprint_data, indent=2)}
        
        Please provide:
        1. Key achievements
        2. Areas of concern
        3. Recommendations for improvement
        """
        return self.query(prompt) 