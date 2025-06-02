from datetime import datetime
from mongoengine import Document, StringField, DateTimeField, BooleanField
from werkzeug.security import generate_password_hash, check_password_hash
import logging

logger = logging.getLogger(__name__)

class User(Document):
    email = StringField(required=True, unique=True)
    password = StringField(required=True)
    name = StringField(required=True)
    role = StringField(default='user')
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    is_active = BooleanField(default=True)

    meta = {
        'collection': 'users',
        'indexes': [
            'email',
            'created_at'
        ],
        'strict': False
    }

    def to_dict(self):
        return {
            'id': str(self.id),
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'is_active': self.is_active
        }

    @classmethod
    def create_user(cls, email, password, name, role='user'):
        try:
            # Check if user already exists
            if cls.objects(email=email).first():
                return None, 'User already exists'

            # Create new user with hashed password
            user = cls(
                email=email,
                password=generate_password_hash(password),
                name=name,
                role=role
            )
            user.save()
            return user, None
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            return None, str(e)

    def verify_password(self, password):
        try:
            return check_password_hash(self.password, password)
        except Exception as e:
            logger.error(f"Error verifying password: {str(e)}")
            return False

    def get_user_by_email(self, email):
        try:
            logger.debug(f"Looking up user by email: {email}")
            user = self.collection.find_one({'email': email})
            if user:
                user['_id'] = str(user['_id'])
                logger.debug(f"User found: {email}")
            else:
                logger.debug(f"User not found: {email}")
            return user
        except Exception as e:
            logger.error(f"Error looking up user: {str(e)}", exc_info=True)
            return None

    def update_user(self, user_id, update_data):
        try:
            logger.debug(f"Updating user: {user_id}")
            update_data['updated_at'] = datetime.utcnow()
            result = self.collection.update_one(
                {'_id': ObjectId(user_id)},
                {'$set': update_data}
            )
            success = result.modified_count > 0
            logger.debug(f"User update {'successful' if success else 'failed'}: {user_id}")
            return success
        except Exception as e:
            logger.error(f"Error updating user: {str(e)}", exc_info=True)
            return False

    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs) 