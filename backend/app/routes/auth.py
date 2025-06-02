from flask import Blueprint, request, jsonify, current_app
from ..models.user import User
import jwt
from datetime import datetime, timedelta
from functools import wraps
import logging
from werkzeug.security import generate_password_hash, check_password_hash

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Create blueprint with explicit name and URL prefix
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            token = token.split(' ')[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            current_user = User.objects(id=data['user_id']).first()
            if not current_user:
                return jsonify({'message': 'Invalid token'}), 401
        except Exception as e:
            logger.error(f"Token validation error: {str(e)}")
            return jsonify({'message': 'Invalid token'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        role = data.get('role', 'user')  # Default role to 'user'

        if not all([email, password, name]):
            return jsonify({'error': 'All fields are required'}), 400

        # Create new user using the User model's create_user method
        user, error = User.create_user(email, password, name, role)
        if error:
            return jsonify({'error': error}), 400

        # Generate JWT token
        token = jwt.encode({
            'user_id': str(user.id),
            'email': user.email,
            'role': user.role,
            'exp': datetime.utcnow() + timedelta(days=1)
        }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')

        return jsonify({
            'token': token,
            'user': user.to_dict()
        }), 201

    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        logger.debug(f"Login attempt for email: {email}")

        if not email or not password:
            logger.warning("Login attempt with missing email or password")
            return jsonify({'error': 'Email and password are required'}), 400

        # Find user by email
        user = User.objects(email=email).first()
        if not user:
            logger.warning(f"Login attempt failed: User not found for email {email}")
            return jsonify({'error': 'Invalid email or password'}), 401

        logger.debug(f"User found: {user.to_dict()}")

        # Verify password using the User model's verify_password method
        if not user.verify_password(password):
            logger.warning(f"Login attempt failed: Invalid password for user {email}")
            return jsonify({'error': 'Invalid email or password'}), 401

        # Generate JWT token
        token = jwt.encode({
            'user_id': str(user.id),
            'email': user.email,
            'role': user.role,
            'exp': datetime.utcnow() + timedelta(days=1)
        }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')

        logger.info(f"User logged in successfully: {email}")
        return jsonify({
            'token': token,
            'user': user.to_dict()
        })

    except Exception as e:
        logger.error(f"Login error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/create-test-user', methods=['POST'])
def create_test_user():
    try:
        # Check if test user already exists
        test_user = User.objects(email='test@example.com').first()
        if test_user:
            return jsonify({
                'message': 'Test user already exists',
                'user': test_user.to_dict()
            })

        # Create test user using the User model's create_user method
        user, error = User.create_user('test@example.com', 'test123', 'Test User', role='scrum_master')
        if error:
            return jsonify({'error': error}), 500

        return jsonify({
            'message': 'Test user created successfully',
            'user': user.to_dict()
        }), 201

    except Exception as e:
        logger.error(f"Error creating test user: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500 