from flask import Blueprint, jsonify

meta_bp = Blueprint('meta', __name__)

@meta_bp.route('/version', methods=['GET'])
def get_version():
    """Retrieve version metadata."""
    return jsonify({
        "version": "v1.2.0",
        "build_number": "#1024",
        "api_status": "Healthy",
        "environment": "Production"
    }), 200

@meta_bp.route('/about', methods=['GET'])
def get_about():
    """Retrieve system descriptions and engineering stack details."""
    return jsonify({
        "project_name": "InfraPilot",
        "version": "v1.2.0",
        "architecture": "Modular Full-Stack Architecture",
        "technology_stack": {
            "frontend": "React (Functional Components, Hooks, Router, Axios)",
            "backend": "Python Flask (Blueprints, RESTful API)",
            "database": "SQLite 3",
            "future_integrations": "Jenkins, Docker Compose, Kubernetes, Terraform, Nginx, Prometheus, Grafana"
        },
        "developer": "Senior DevOps Engineering Team",
        "description": "InfraPilot is an enterprise-grade DevOps Automation Suite designed to streamline deployment tracking, container lifecycle operations, Kubernetes object observability, and infrastructure performance telemetry."
    }), 200

@meta_bp.route('/settings', methods=['GET'])
def get_settings():
    """Retrieve current environment setting parameters."""
    return jsonify({
        "theme": "Dark Theme (Grafana Inspired)",
        "environment": "Production",
        "version": "v1.2.0",
        "log_level": "INFO",
        "auto_refresh_interval_ms": 5000,
        "features": {
            "docker_control": True,
            "kubernetes_observability": True,
            "deployment_actions": True,
            "telemetry_metrics": True
        }
    }), 200
