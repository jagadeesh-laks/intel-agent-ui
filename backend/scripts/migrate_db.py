from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

def migrate_database():
    # Connect to MongoDB
    client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017'))
    
    # Get source and target databases
    source_db = client.intel_agent
    target_db = client.scrum_master_db
    
    # Collections to migrate
    collections = ['users', 'user_configs']
    
    print("Starting database migration...")
    
    for collection_name in collections:
        try:
            # Get all documents from source collection
            source_collection = source_db[collection_name]
            target_collection = target_db[collection_name]
            
            # Count documents in source
            count = source_collection.count_documents({})
            print(f"\nMigrating {count} documents from {collection_name}...")
            
            if count > 0:
                # Get all documents
                documents = list(source_collection.find())
                
                # Insert into target collection
                if documents:
                    target_collection.insert_many(documents)
                    print(f"Successfully migrated {len(documents)} documents to {collection_name}")
                
                # Drop source collection after successful migration
                source_collection.drop()
                print(f"Dropped source collection {collection_name}")
            else:
                print(f"No documents to migrate in {collection_name}")
                
        except Exception as e:
            print(f"Error migrating {collection_name}: {str(e)}")
    
    print("\nMigration completed!")
    
    # Drop the source database if it's empty
    if not any(source_db.list_collection_names()):
        client.drop_database('intel_agent')
        print("Dropped empty source database 'intel_agent'")

if __name__ == "__main__":
    migrate_database() 