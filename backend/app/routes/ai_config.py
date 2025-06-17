from flask import Blueprint, request, jsonify, current_app
from ..models.user import User
from ..services.mongo_client import get_mongo_client
import logging
from functools import wraps
import jwt
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Create blueprint
ai_config_bp = Blueprint('ai_config', __name__, url_prefix='/api/ai-config')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        logger.debug("Checking token in request")
        logger.debug(f"Request headers: {dict(request.headers)}")
        
        # Allow OPTIONS requests without token validation
        if request.method == 'OPTIONS':
            logger.debug("Allowing OPTIONS request without token validation")
            return '', 200
        
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            try:
                token = auth_header.split(" ")[1]
                logger.debug("Token found in Authorization header")
            except IndexError:
                logger.error("Token not found in Authorization header")
                return jsonify({'message': 'Token is missing'}), 401
        else:
            logger.error("No Authorization header found")
            return jsonify({'message': 'Token is missing'}), 401

        try:
            logger.debug("Decoding token")
            data = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            current_user = User.objects(id=data['user_id']).first()
            if not current_user:
                logger.error("User not found for token")
                return jsonify({'message': 'Invalid token'}), 401
            logger.debug(f"Token validated for user: {current_user.email}")
        except Exception as e:
            logger.error(f"Token validation error: {str(e)}")
            return jsonify({'message': 'Invalid token'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

@ai_config_bp.route('/connect', methods=['POST', 'OPTIONS'])
@token_required
def connect_ai(current_user):
    """Connect to an AI engine."""
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        if not data or 'aiEngine' not in data or 'aiCredentials' not in data:
            logger.error("Missing required fields in request data")
            return jsonify({'error': 'AI engine and credentials are required'}), 400

        logger.debug(f"Connecting AI engine for user: {current_user.email}, engine: {data['aiEngine']}")
        client = get_mongo_client()
        db = client.scrum_master_db

        # Update or insert the AI configuration
        result = db.user_configs.update_one(
            {"userId": str(current_user.id)},
            {
                "$set": {
                    "aiEngine": data['aiEngine'],
                    "aiCredentials": data['aiCredentials'],
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )

        if result.modified_count > 0 or result.upserted_id:
            logger.info(f"Successfully connected AI engine for user: {current_user.email}")
            return jsonify({
                'message': f'Successfully connected to {data["aiEngine"]}',
                'aiEngine': data['aiEngine']
            })
        else:
            logger.error("Failed to update AI configuration")
            return jsonify({
                'error': 'Failed to connect AI engine',
                'message': 'Could not update configuration'
            }), 500

    except Exception as e:
        logger.error(f"Error connecting AI engine: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

@ai_config_bp.route('/status', methods=['GET', 'OPTIONS'])
@token_required
def check_ai_status(current_user):
    """Check the status of AI engine connection."""
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        logger.debug(f"Checking AI status for user: {current_user.email}")
        client = get_mongo_client()
        db = client.scrum_master_db
        config = db.user_configs.find_one({
            "userId": str(current_user.id)
        })

        if not config:
            logger.debug("No AI configuration found")
            return jsonify({
                'is_connected': False,
                'message': 'No AI configuration found'
            })

        logger.debug(f"Found AI configuration: {config.get('aiEngine')}")
        return jsonify({
            'is_connected': True,
            'aiEngine': config.get('aiEngine'),
            'message': f'Connected to {config.get("aiEngine")}'
        })

    except Exception as e:
        logger.error(f"Error checking AI status: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

@ai_config_bp.route('/configs', methods=['GET', 'OPTIONS'])
@token_required
def get_ai_configs(current_user):
    """Get all AI configurations for the user."""
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        logger.debug(f"Fetching AI configs for user: {current_user.email}")
        client = get_mongo_client()
        db = client.scrum_master_db
        configs = list(db.user_configs.find({
            "userId": str(current_user.id)
        }))

        # Remove sensitive information
        for config in configs:
            config['_id'] = str(config['_id'])
            if 'aiCredentials' in config:
                config['aiCredentials'] = '********'  # Mask the credentials

        logger.debug(f"Found {len(configs)} configurations")
        return jsonify({
            'configs': configs
        })

    except Exception as e:
        logger.error(f"Error fetching AI configs: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

@ai_config_bp.route('/config', methods=['DELETE', 'OPTIONS'])
@token_required
def delete_ai_config(current_user):
    """Delete AI configuration for the user."""
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        if not data or 'aiEngine' not in data:
            logger.error("Missing aiEngine in request data")
            return jsonify({'error': 'AI engine type is required'}), 400

        logger.debug(f"Deleting AI config for user: {current_user.email}, engine: {data['aiEngine']}")
        client = get_mongo_client()
        db = client.scrum_master_db
        result = db.user_configs.delete_one({
            "userId": str(current_user.id),
            "aiEngine": data['aiEngine']
        })

        if result.deleted_count == 0:
            logger.error(f"No configuration found for engine: {data['aiEngine']}")
            return jsonify({
                'error': 'Configuration not found',
                'message': f'No configuration found for {data["aiEngine"]}'
            }), 404

        logger.info(f"Deleted AI configuration for user: {current_user.email}, engine: {data['aiEngine']}")
        return jsonify({
            'message': f'Configuration for {data["aiEngine"]} deleted successfully'
        })

    except Exception as e:
        logger.error(f"Error deleting AI config: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500 