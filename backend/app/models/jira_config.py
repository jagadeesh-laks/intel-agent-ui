from datetime import datetime
from mongoengine import Document, StringField, ReferenceField, DateTimeField, BooleanField, signals
from .user import User  # Import the User model
import logging

logger = logging.getLogger(__name__)

class JiraConfig(Document):
    user = ReferenceField(User, required=True)  # Use the imported User model
    email = StringField(required=True)
    domain = StringField(required=True)
    api_token = StringField(required=True)
    last_used = DateTimeField(default=datetime.utcnow)
    created_at = DateTimeField(default=datetime.utcnow)
    is_active = BooleanField(default=True)

    meta = {
        'collection': 'jira_configs',
        'db_alias': 'default',
        'indexes': [
            'user',
            'email',
            'domain',
            'last_used',
            {'fields': ['user', 'domain'], 'unique': True}
        ]
    }

    def clean_domain(self):
        """Clean up domain URL by removing protocol and trailing slashes"""
        if self.domain:
            self.domain = self.domain.replace('https://', '').replace('http://', '').rstrip('/')
            logger.debug(f"Cleaned domain URL: {self.domain}")

    def save(self, *args, **kwargs):
        """Override save to clean domain before saving"""
        self.clean_domain()
        return super().save(*args, **kwargs)

    def to_dict(self):
        return {
            'id': str(self.id),
            'email': self.email,
            'domain': self.domain,
            'last_used': self.last_used.isoformat() if self.last_used else None,
            'created_at': self.created_at.isoformat(),
            'is_active': self.is_active
        }

    @classmethod
    def pre_save(cls, sender, document, **kwargs):
        # Deactivate other configs for the same user and domain
        if document.is_active:
            cls.objects(
                user=document.user,
                domain=document.domain,
                id__ne=document.id
            ).update(set__is_active=False)

# Register the pre_save signal
signals.pre_save.connect(JiraConfig.pre_save, sender=JiraConfig) 