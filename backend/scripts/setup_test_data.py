from pymongo import MongoClient
from datetime import datetime
import bcrypt
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def setup_test_data():
    # Connect to MongoDB
    mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
    client = MongoClient(mongo_uri)
    db = client.scrum_master_db

    # Create test user
    test_user = {
        'email': 'test@example.com',
        'password': bcrypt.hashpw('test123'.encode('utf-8'), bcrypt.gensalt()),
        'name': 'Test User',
        'role': 'scrum_master',
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }

    # Insert test user
    user_result = db.users.insert_one(test_user)
    user_id = str(user_result.inserted_id)

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

    print("Test data setup completed!")
    print(f"Test user email: test@example.com")
    print(f"Test user password: test123")

if __name__ == "__main__":
    setup_test_data() 