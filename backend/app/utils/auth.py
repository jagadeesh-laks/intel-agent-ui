from functools import wraps
from flask import request, jsonify, current_app
from bson import ObjectId

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
            return jsonify({'error': 'Token is missing'}), 401

        try:
            # Get user from token
            user = current_app.db.users.find_one({'token': token})
            if not user:
                return jsonify({'error': 'Invalid token'}), 401

            # Add user and db to kwargs
            kwargs['current_user'] = type('User', (), {
                'id': str(user['_id']),
                'email': user['email'],
                'db': current_app.db
            })

            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': str(e)}), 401

    return decorated 