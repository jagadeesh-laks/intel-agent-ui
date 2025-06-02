from pymongo import MongoClient
from datetime import datetime
import bcrypt
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def setup_database():
    # Connect to MongoDB
    client = MongoClient('mongodb://localhost:27017')
    db = client.scrum_master_db

    # Create collections
    collections = ['users', 'scrum_master_configs', 'chats']
    for collection in collections:
        if collection not in db.list_collection_names():
            db.create_collection(collection)
            print(f"Created collection: {collection}")

    # Create test user
    test_user = {
        'email': 'test@example.com',
        'password': bcrypt.hashpw('test123'.encode('utf-8'), bcrypt.gensalt()),
        'name': 'Test User',
        'role': 'scrum_master',
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }

    # Insert test user if not exists
    if not db.users.find_one({'email': test_user['email']}):
        user_result = db.users.insert_one(test_user)
        user_id = str(user_result.inserted_id)
        print(f"Created test user: {test_user['email']}")

        # Create test configuration
        test_config = {
            'user_id': user_id,
            'management_tool': 'Jira',
            'management_tool_url': 'https://your-jira-instance.atlassian.net',
            'management_credentials': 'your-jira-api-token',
            'ai_engine': 'Ollama',
            'ai_credentials': 'llama2',
            'selected_project': 'Test Project',
            'selected_board': 'Test Board',
            'selected_sprint': 'Sprint 1',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }

        # Insert test configuration
        db.scrum_master_configs.insert_one(test_config)
        print("Created test configuration")

        # Create sample chat messages
        sample_chats = [
            {
                'user_id': user_id,
                'message': 'What is the current sprint status?',
                'intent': 'sprint_status',
                'response': 'Current sprint is 68% complete with 12 tasks completed.',
                'created_at': datetime.utcnow()
            },
            {
                'user_id': user_id,
                'message': 'Show me the team velocity',
                'intent': 'team_velocity',
                'response': 'Team velocity for the last 3 sprints: 25, 28, 30 points.',
                'created_at': datetime.utcnow()
            }
        ]

        # Insert sample chats
        db.chats.insert_many(sample_chats)
        print("Created sample chat messages")

    print("\nDatabase setup completed!")
    print("Test user credentials:")
    print("Email: test@example.com")
    print("Password: test123")

if __name__ == "__main__":
    setup_database() 