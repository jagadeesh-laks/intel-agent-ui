from flask import Flask, jsonify, request
from flask_cors import CORS
from .config import Config
import logging
from mongoengine import connect
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime, timedelta
from flask_jwt_extended import JWTManager
from .db import get_mongo_client
from app.routes.auth import auth_bp
from app.routes.chat import chat_bp
from app.routes.ai_config import ai_config_bp
from app.routes.sprint_timeline import sprint_bp

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize CORS with proper configuration
    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:8080", "http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
            "expose_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Initialize JWT
    jwt = JWTManager(app)
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
    
    # Initialize MongoDB with MongoEngine
    mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/scrum_master_db')
    connect(host=mongo_uri)
    
    # Initialize PyMongo client for direct database access
    client = get_mongo_client()
    app.db = client.scrum_master_db
    
    # Import blueprints
    from .routes.auth import auth_bp
    from .routes.scrum_master import scrum_master_bp
    from .routes.chat import chat_bp
    from .routes.ai_config import ai_config_bp
    from .routes.sprint_timeline import sprint_bp

    # Register blueprints
    logger.debug("Registering auth blueprint with prefix /api/auth")
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    logger.debug("Registering scrum master blueprint with prefix /api/scrum-master")
    app.register_blueprint(scrum_master_bp, url_prefix='/api/scrum-master')

    logger.debug("Registering chat blueprint with prefix /api")
    app.register_blueprint(chat_bp)

    logger.debug("Registering AI config blueprint with prefix /api/ai-config")
    app.register_blueprint(ai_config_bp)

    logger.debug("Registering sprint timeline blueprint with prefix /api/sprint-timeline")
    app.register_blueprint(sprint_bp)

    # Health check route
    @app.route('/api/health', methods=['GET', 'OPTIONS'])
    def health_check():
        if request.method == 'OPTIONS':
            return '', 200
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat()
        })

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        logger.error(f"404 error: {request.path}")
        return jsonify({
            'error': 'Not found',
            'message': f'The requested URL {request.path} was not found on the server'
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        logger.error(f"405 error: {request.method} {request.path}")
        return jsonify({
            'error': 'Method not allowed',
            'message': f'The method {request.method} is not allowed for the requested URL'
        }), 405

    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"500 error: {str(error)}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'An unexpected error occurred'
        }), 500

    @app.errorhandler(Exception)
    def handle_exception(e):
        logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

    # Log all requests
    @app.before_request
    def log_request_info():
        logger.debug('Headers: %s', request.headers)
        logger.debug('Body: %s', request.get_data())
        logger.debug('Method: %s', request.method)
        logger.debug('Path: %s', request.path)

    return app 