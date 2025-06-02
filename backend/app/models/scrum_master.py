from datetime import datetime
from bson import ObjectId

class ScrumMaster:
    def __init__(self, db):
        self.db = db
        self.collection = db.scrum_master_configs

    def create_config(self, user_id, config_data):
        config = {
            'user_id': user_id,
            'management_tool': config_data.get('managementTool'),
            'management_credentials': config_data.get('managementCredentials'),
            'management_email': config_data.get('managementEmail'),
            'management_domain': config_data.get('managementDomain'),
            'communication_tool': config_data.get('communicationTool'),
            'communication_credentials': config_data.get('communicationCredentials'),
            'email_tool': config_data.get('emailTool'),
            'email_credentials': config_data.get('emailCredentials'),
            'ai_engine': config_data.get('aiEngine'),
            'ai_credentials': config_data.get('aiCredentials'),
            'selected_project': config_data.get('selectedProject'),
            'selected_board': config_data.get('selectedBoard'),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }

        result = self.collection.insert_one(config)
        config['_id'] = str(result.inserted_id)
        return config

    def get_config(self, user_id):
        config = self.collection.find_one({'user_id': user_id})
        if config:
            config['_id'] = str(config['_id'])
        return config

    def update_config(self, user_id, update_data):
        update_data['updated_at'] = datetime.utcnow()
        result = self.collection.update_one(
            {'user_id': user_id},
            {'$set': update_data},
            upsert=True
        )
        return result.modified_count > 0 or result.upserted_id is not None

    def delete_config(self, user_id):
        result = self.collection.delete_one({'user_id': user_id})
        return result.deleted_count > 0 