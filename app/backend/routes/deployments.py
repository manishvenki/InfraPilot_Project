from flask import Blueprint, jsonify, request
from services.deployment_service import DeploymentService, DuplicateBuildNumberError, DeploymentNotFoundError

deployments_bp = Blueprint('deployments', __name__)
deployment_service = DeploymentService()

@deployments_bp.route('/deployments', methods=['GET'])
def get_deployments():
    """Retrieve all deployment history entries from SQLite, sorted by newest first."""
    try:
        deployments = deployment_service.get_history()
        return jsonify(deployments), 200
    except Exception as e:
        return jsonify({"success": False, "error": "Failed to query deployment history", "details": str(e)}), 500

@deployments_bp.route('/deployments/deploy', methods=['POST'])
def deploy_latest():
    """Trigger a new deployment simulation, generating version and build numbers automatically."""
    try:
        data = request.get_json() or {}
        branch = data.get('branch', 'main')
        triggered_by = data.get('triggered_by', 'Console Operator')
        
        result = deployment_service.deploy(branch=branch, triggered_by=triggered_by)
        return jsonify(result), 201
    except DuplicateBuildNumberError as e:
        return jsonify({"success": False, "error": "Conflict", "details": str(e)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": "Deployment failure", "details": str(e)}), 500

@deployments_bp.route('/deployments/rollback/<int:deployment_id>', methods=['POST'])
def rollback(deployment_id):
    """Trigger a rollback to an older deployment configuration, creating a new history item."""
    try:
        data = request.get_json() or {}
        triggered_by = data.get('triggered_by', 'Operator (Rollback)')
        
        result = deployment_service.rollback(deployment_id, triggered_by=triggered_by)
        return jsonify(result), 201
    except DeploymentNotFoundError as e:
        return jsonify({"success": False, "error": "Not Found", "details": str(e)}), 404
    except DuplicateBuildNumberError as e:
        return jsonify({"success": False, "error": "Conflict", "details": str(e)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": "Rollback failure", "details": str(e)}), 500

@deployments_bp.route('/deployments/redeploy/<int:deployment_id>', methods=['POST'])
def redeploy(deployment_id):
    """Trigger a redeployment of an existing build configuration, creating a new history item."""
    try:
        data = request.get_json() or {}
        triggered_by = data.get('triggered_by', 'Operator (Redeploy)')
        
        result = deployment_service.redeploy(deployment_id, triggered_by=triggered_by)
        return jsonify(result), 201
    except DeploymentNotFoundError as e:
        return jsonify({"success": False, "error": "Not Found", "details": str(e)}), 404
    except DuplicateBuildNumberError as e:
        return jsonify({"success": False, "error": "Conflict", "details": str(e)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": "Redeployment failure", "details": str(e)}), 500

