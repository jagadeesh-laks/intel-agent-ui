"""
Services package for the application.
Contains various service modules for database, integrations, and other functionality.
"""

from .mongo_client import get_mongo_client, close_mongo_client
from .jira_helper import JiraHelper
from .integrations import JiraService

__all__ = [
    'get_mongo_client',
    'close_mongo_client',
    'JiraHelper',
    'JiraService'
] 