INTENT_SCHEMAS = [
    {
        "name": "create_sprint",
        "description": "Create a Jira sprint",
        "parameters": {
            "type": "object",
            "properties": {
                "sprintName": {"type": "string"},
                "startDate": {"type": "string", "format": "date"},
                "durationDays": {"type": "integer"}
            },
            "required": ["sprintName", "startDate"]
        }
    },
    {
        "name": "get_sprint_status",
        "description": "Get sprint status",
        "parameters": {
            "type": "object",
            "properties": {
                "boardId": {"type": "integer"},
                "sprintId": {"type": "integer"}
            },
            "required": ["boardId", "sprintId"]
        }
    },
    {
        "name": "add_issue_to_sprint",
        "description": "Add issues to sprint",
        "parameters": {
            "type": "object",
            "properties": {
                "boardId": {"type": "integer"},
                "sprintId": {"type": "integer"},
                "issueKeys": {
                    "type": "array",
                    "items": {"type": "string"}
                }
            },
            "required": ["boardId", "sprintId", "issueKeys"]
        }
    },
    {
        "name": "close_sprint",
        "description": "Close a Jira sprint",
        "parameters": {
            "type": "object",
            "properties": {
                "sprintId": {"type": "integer"}
            },
            "required": ["sprintId"]
        }
    },
    {
        "name": "list_backlog_items",
        "description": "List backlog items",
        "parameters": {
            "type": "object",
            "properties": {
                "projectKey": {"type": "string"},
                "maxResults": {"type": "integer", "default": 10}
            },
            "required": ["projectKey"]
        }
    }
] 