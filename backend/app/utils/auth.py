from functools import wraps
from flask import request, jsonify, current_app
from ..models.user import User
import jwt
import logging

logger = logging.getLogger(__name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Get token from header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]

        if not token:
            logger.error("Token is missing")
            return jsonify({'error': 'Token is missing'}), 401

        try:
            # Decode JWT token
            data = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            
            # Get user from database
            current_user = User.objects(id=data['user_id']).first()
            if not current_user:
                logger.error(f"User not found for token: {data['user_id']}")
                return jsonify({'error': 'Invalid token'}), 401

            # Add user to kwargs
            kwargs['current_user'] = current_user

            return f(*args, **kwargs)
        except jwt.ExpiredSignatureError:
            logger.error("Token has expired")
            return jsonify({'error': 'Token has expired. Please login again.'}), 401
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid token: {str(e)}")
            return jsonify({'error': 'Invalid token. Please login again.'}), 401
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return jsonify({'error': str(e)}), 401

    return decorated 