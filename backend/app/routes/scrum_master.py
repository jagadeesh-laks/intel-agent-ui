from flask import Blueprint, request, jsonify, current_app
from ..models.user import User
from ..models.scrum_master import ScrumMaster
from ..services.integrations import JiraService
import logging
from functools import wraps
import jwt
from datetime import datetime
from ..models.jira_config import JiraConfig
import requests
from requests.auth import HTTPBasicAuth
from mongoengine import get_db

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Create blueprint
scrum_master_bp = Blueprint('scrum_master', __name__, url_prefix='/api/scrum-master')

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

@scrum_master_bp.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'Scrum master routes are working'}), 200

@scrum_master_bp.route('/config', methods=['POST', 'OPTIONS'])
@token_required
def create_config(current_user):
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.get_json()
        logger.debug(f"Creating config with data: {data}")

        # Validate required fields for Jira
        if data.get('managementTool') == 'Jira':
            required_fields = ['managementEmail', 'managementCredentials', 'managementDomain']
            missing_fields = [field for field in required_fields if not data.get(field)]
            
            if missing_fields:
                logger.error(f"Missing required fields: {missing_fields}")
                return jsonify({
                    'error': 'Missing required fields',
                    'message': f'Required fields missing: {", ".join(missing_fields)}'
                }), 400

            try:
                # Try to find existing config for this user and domain
                jira_config = JiraConfig.objects(
                    user=current_user,
                    domain=data['managementDomain']
                ).first()

                if jira_config:
                    # Update existing config
                    jira_config.email = data['managementEmail']
                    jira_config.api_token = data['managementCredentials']
                    jira_config.last_used = datetime.utcnow()
                    jira_config.is_active = True
                else:
                    # Create new config
                    jira_config = JiraConfig(
                        user=current_user,
                        email=data['managementEmail'],
                        domain=data['managementDomain'],
                        api_token=data['managementCredentials']
                    )

                jira_config.save()
                logger.info(f"Jira configuration {'updated' if jira_config.id else 'created'} for user: {current_user.email}")

                # Get MongoDB client
                db = get_db()

                # Create or update user config
                user_config = {
                    'userId': str(current_user.id),
                    'managementTool': data.get('managementTool'),
                    'managementEmail': data.get('managementEmail'),
                    'managementDomain': data.get('managementDomain'),
                    'managementCredentials': data.get('managementCredentials'),
                    'communicationTool': data.get('communicationTool'),
                    'communicationCredentials': data.get('communicationCredentials'),
                    'emailTool': data.get('emailTool'),
                    'emailCredentials': data.get('emailCredentials'),
                    'aiEngine': data.get('aiEngine'),
                    'aiCredentials': data.get('aiCredentials'),
                    'selectedProject': data.get('selectedProject'),
                    'selectedBoard': data.get('selectedBoard'),
                    'updated_at': datetime.utcnow()
                }

                # Update or insert user config
                db.user_configs.update_one(
                    {'userId': str(current_user.id)},
                    {'$set': user_config},
                    upsert=True
                )

                return jsonify({
                    'message': 'Configuration created successfully',
                    'config': {
                        'managementTool': data.get('managementTool'),
                        'managementEmail': data.get('managementEmail'),
                        'managementDomain': data.get('managementDomain')
                    }
                }), 201

            except Exception as e:
                logger.error(f"Error saving Jira configuration: {str(e)}")
                return jsonify({
                    'error': 'Failed to save Jira configuration',
                    'message': str(e)
                }), 500

        return jsonify({
            'error': 'Invalid management tool',
            'message': 'Only Jira is supported at the moment'
        }), 400

    except Exception as e:
        logger.error(f"Error creating configuration: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@scrum_master_bp.route('/config', methods=['GET'])
@token_required
def get_config(current_user):
    try:
        scrum_master = ScrumMaster(current_user.db)
        config = scrum_master.get_config(current_user.id)
        if not config:
            return jsonify({'error': 'Configuration not found'}), 404
        return jsonify(config), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@scrum_master_bp.route('/config', methods=['PUT'])
@token_required
def update_config(current_user):
    try:
        data = request.get_json()
        logger.debug(f"Updating config with data: {data}")
        
        # If updating Jira credentials, update the JiraConfig
        if data.get('managementTool') == 'Jira':
            try:
                # Find the existing Jira config
                jira_config = JiraConfig.objects(
                    user=current_user,
                    domain=data.get('managementDomain')
                ).first()

                if jira_config:
                    # Update existing config
                    jira_config.email = data.get('managementEmail')
                    jira_config.api_token = data.get('managementCredentials')
                    jira_config.last_used = datetime.utcnow()
                    jira_config.is_active = True
                    jira_config.save()
                    logger.info(f"Updated Jira configuration for user: {current_user.email}")
                else:
                    logger.error("No existing Jira configuration found to update")
                    return jsonify({
                        'error': 'Configuration not found',
                        'message': 'No existing Jira configuration found to update'
                    }), 404

            except Exception as e:
                logger.error(f"Error updating Jira configuration: {str(e)}")
                return jsonify({
                    'error': 'Failed to update Jira configuration',
                    'message': str(e)
                }), 500

        return jsonify({
            'message': 'Configuration updated successfully',
            'config': {
                'managementTool': data.get('managementTool'),
                'managementEmail': data.get('managementEmail'),
                'managementDomain': data.get('managementDomain')
            }
        }), 200

    except Exception as e:
        logger.error(f"Error updating configuration: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@scrum_master_bp.route('/config', methods=['DELETE'])
@token_required
def delete_config(current_user):
    try:
        scrum_master = ScrumMaster(current_user.db)
        success = scrum_master.delete_config(current_user.id)
        if not success:
            return jsonify({'error': 'Failed to delete configuration'}), 400
        return jsonify({'message': 'Configuration deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@scrum_master_bp.route('/jira/configs', methods=['GET'])
@token_required
def get_jira_configs(current_user):
    try:
        configs = JiraConfig.objects(user=current_user, is_active=True)
        return jsonify({
            'configs': [{
                'id': str(config.id),
                'email': config.email,
                'domain': config.domain,
                'last_used': config.last_used.isoformat() if config.last_used else None,
                'managementCredentials': config.api_token
            } for config in configs]
        })
    except Exception as e:
        logger.error(f"Error fetching Jira configs: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@scrum_master_bp.route('/jira/status', methods=['GET'])
@token_required
def check_jira_status(current_user):
    try:
        logger.debug(f"Checking Jira status for user: {current_user.email}")
        
        # Get active Jira configuration
        jira_config = JiraConfig.objects(user=current_user, is_active=True).first()
        if not jira_config:
            logger.debug("No active Jira configuration found")
            return jsonify({
                'is_online': False,
                'message': 'No Jira configuration found'
            })

        # Test Jira API connection
        headers = {
            'Accept': 'application/json'
        }
        
        domain = jira_config.domain.replace('https://', '').replace('http://', '')
        url = f'https://{domain}/rest/api/3/myself'
        
        response = requests.get(
            url,
            headers=headers,
            auth=HTTPBasicAuth(jira_config.email, jira_config.api_token),
            timeout=5
        )
        
        if response.status_code == 200:
            logger.debug("Jira API connection successful")
            return jsonify({
                'is_online': True,
                'message': 'Connected to Jira'
            })
        else:
            logger.error(f"Jira API error: {response.status_code} - {response.text}")
            return jsonify({
                'is_online': False,
                'message': f'Jira API error: {response.status_code}'
            })

    except requests.exceptions.RequestException as e:
        logger.error(f"Jira connection error: {str(e)}")
        return jsonify({
            'is_online': False,
            'message': f'Connection error: {str(e)}'
        })
    except Exception as e:
        logger.error(f"Unexpected error checking Jira status: {str(e)}")
        return jsonify({
            'is_online': False,
            'message': 'Internal server error'
        }), 500

@scrum_master_bp.route('/jira/projects', methods=['GET'])
@token_required
def get_jira_projects(current_user):
    try:
        logger.debug(f"Fetching Jira projects for user: {current_user.email}")
        
        # Get active Jira configuration
        jira_config = JiraConfig.objects(user=current_user, is_active=True).first()
        if not jira_config:
            logger.error("No active Jira configuration found")
            return jsonify({
                'error': 'No Jira configuration found',
                'message': 'Please configure Jira first'
            }), 404

        # Make request to Jira API
        headers = {
            'Accept': 'application/json'
        }
        
        # Construct the URL properly
        domain = jira_config.domain.replace('https://', '').replace('http://', '')
        url = f'https://{domain}/rest/api/3/project'
        
        logger.debug(f"Making request to Jira API: {url}")
        
        response = requests.get(
            url,
            headers=headers,
            auth=HTTPBasicAuth(jira_config.email, jira_config.api_token),
            timeout=5
        )
        
        if response.status_code == 200:
            projects = response.json()
            logger.info(f"Successfully fetched {len(projects)} projects")
            # Return the projects array directly
            return jsonify(projects)
        else:
            logger.error(f"Jira API error: {response.status_code} - {response.text}")
            return jsonify({
                'error': 'Failed to fetch projects',
                'message': f'Jira API error: {response.status_code}'
            }), response.status_code

    except requests.exceptions.RequestException as e:
        logger.error(f"Jira connection error: {str(e)}")
        return jsonify({
            'error': 'Connection error',
            'message': str(e)
        }), 500
    except Exception as e:
        logger.error(f"Unexpected error fetching projects: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@scrum_master_bp.route('/jira/boards', methods=['GET'])
@token_required
def get_jira_boards(current_user):
    try:
        logger.debug(f"Fetching Jira boards for user: {current_user.email}")
        
        # Get active Jira configuration
        jira_config = JiraConfig.objects(user=current_user, is_active=True).first()
        if not jira_config:
            logger.error("No active Jira configuration found")
            return jsonify({
                'error': 'No Jira configuration found',
                'message': 'Please configure Jira first'
            }), 404

        # Make request to Jira API
        headers = {
            'Accept': 'application/json'
        }
        
        # Construct the URL properly
        domain = jira_config.domain.replace('https://', '').replace('http://', '')
        url = f'https://{domain}/rest/agile/1.0/board'
        
        logger.debug(f"Making request to Jira API: {url}")
        
        response = requests.get(
            url,
            headers=headers,
            auth=HTTPBasicAuth(jira_config.email, jira_config.api_token),
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            boards = data.get('values', [])
            logger.info(f"Successfully fetched {len(boards)} boards")
            return jsonify({
                'boards': boards
            })
        else:
            logger.error(f"Jira API error: {response.status_code} - {response.text}")
            return jsonify({
                'error': 'Failed to fetch boards',
                'message': f'Jira API error: {response.status_code}'
            }), response.status_code

    except requests.exceptions.RequestException as e:
        logger.error(f"Jira connection error: {str(e)}")
        return jsonify({
            'error': 'Connection error',
            'message': str(e)
        }), 500
    except Exception as e:
        logger.error(f"Unexpected error fetching boards: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500 