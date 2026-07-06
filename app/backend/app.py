from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from utils.db import init_db

# Import Blueprints
from routes.dashboard import dashboard_bp
from routes.docker import docker_bp
from routes.kubernetes import kubernetes_bp
from routes.deployments import deployments_bp
from routes.monitoring import monitoring_bp
from routes.meta import meta_bp

def create_app():
    """Application factory for Flask backend."""
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable Cross-Origin Resource Sharing (CORS) for local React development
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize the database (creates sqlite file and table if missing)
    with app.app_context():
        init_db()
        
    # Register blueprints under the /api prefix
    app.register_blueprint(dashboard_bp, url_prefix='/api')
    app.register_blueprint(docker_bp, url_prefix='/api')
    app.register_blueprint(kubernetes_bp, url_prefix='/api')
    app.register_blueprint(deployments_bp, url_prefix='/api')
    app.register_blueprint(monitoring_bp, url_prefix='/api')
    app.register_blueprint(meta_bp, url_prefix='/api')
    
    # Root status endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "healthy", "service": "infrapilot-api"}), 200

    # Error Handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({"error": "Resource not found", "code": 404}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Internal server error", "code": 500}), 500

    return app

if __name__ == '__main__':
    app = create_app()
    print(f"Starting InfraPilot API Backend on port {Config.PORT}...")
    app.run(host='0.0.0.0', port=Config.PORT, debug=Config.DEBUG)
