from datetime import datetime, timedelta
from typing import Dict, Any
from app.services.jira_helper import JiraHelper

async def invoke_intent_function(name: str, args: Dict[str, Any], jira: JiraHelper) -> str:
    """Process different intent functions and return appropriate responses."""
    
    if name == "create_sprint":
        start_date = datetime.fromisoformat(args["startDate"])
        duration = args.get("durationDays", 14)
        end_date = (start_date + timedelta(days=duration)).strftime("%Y-%m-%dT%H:%M:%S.000Z")
        
        payload = {
            "name": args["sprintName"],
            "startDate": args["startDate"],
            "endDate": end_date,
            "originBoardId": args["boardId"]
        }
        
        sprint = jira.create_sprint(payload)
        return f"Created sprint '{sprint['name']}' (ID {sprint['id']})."

    elif name == "get_sprint_status":
        data = jira.get_sprint_issues(args["boardId"], args["sprintId"])
        issues = data["issues"]
        done = sum(1 for i in issues if i["fields"]["status"]["name"] in ["Done", "Closed"])
        total = len(issues)
        percent = round(done/total*100, 1) if total else 0
        return f"{done}/{total} done ({percent}%)."

    elif name == "add_issue_to_sprint":
        jira.add_issues_to_sprint(args["sprintId"], args["issueKeys"])
        return f"Added issues {args['issueKeys']} to sprint {args['sprintId']}."

    elif name == "close_sprint":
        jira.close_sprint(args["sprintId"])
        return f"Sprint {args['sprintId']} closed."

    elif name == "list_backlog_items":
        items = jira.list_backlog_items(args["projectKey"], args.get("maxResults", 10))
        lines = [
            f"{i['key']}: {i['fields']['summary']} ({i['fields'].get('customfield_10026', 0)} pts)"
            for i in items
        ]
        return "\n".join(lines)

    else:
        return "Sorry, I couldn't handle that request." 