from flask import Blueprint, jsonify, request
from utils.db import query_db, execute_db
import random

deployments_bp = Blueprint('deployments', __name__)

@deployments_bp.route('/deployments', methods=['GET'])
def get_deployments():
    """Retrieve all deployment history entries from SQLite, sorted by newest first."""
    try:
        deployments = query_db("SELECT * FROM deployment_history ORDER BY id DESC")
        return jsonify(deployments), 200
    except Exception as e:
        return jsonify({"error": "Failed to query deployment history", "details": str(e)}), 500

@deployments_bp.route('/deployments/deploy', methods=['POST'])
def deploy_latest():
    """Trigger a new mock deployment, inserting a new build row into the database."""
    try:
        # Determine next build number
        last_build = query_db("SELECT build_number FROM deployment_history ORDER BY id DESC LIMIT 1", one=True)
        if last_build:
            try:
                last_num = int(last_build['build_number'].replace('#', ''))
                next_build_num = f"#{last_num + 1}"
            except ValueError:
                next_build_num = "#1025"
        else:
            next_build_num = "#1001"
            
        data = request.get_json() or {}
        version = data.get('version', 'v1.2.1')
        branch = data.get('branch', 'main')
        triggered_by = data.get('triggered_by', 'Operator Console')
        status = data.get('status', 'SUCCESS')
        
        # Generate a random commit hash
        commit_id = ''.join(random.choices('0123456789abcdef', k=7))
        
        # Random duration
        duration = f"{random.randint(1, 3)}m {random.randint(10, 59)}s"
        
        query = """
            INSERT INTO deployment_history (build_number, version, commit_id, branch, status, duration, triggered_by, deployment_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
        """
        new_id = execute_db(query, (next_build_num, version, commit_id, branch, status, duration, triggered_by))
        new_deployment = query_db("SELECT * FROM deployment_history WHERE id = ?", (new_id,), one=True)
        
        return jsonify({
            "success": True,
            "message": f"Deployment {next_build_num} started successfully.",
            "deployment": new_deployment
        }), 201
    except Exception as e:
        return jsonify({"success": False, "error": "Deployment failure", "details": str(e)}), 500

@deployments_bp.route('/deployments/rollback/<int:deployment_id>', methods=['POST'])
def rollback(deployment_id):
    """Trigger a rollback to an older deployment ID, creating a new history item."""
    try:
        target = query_db("SELECT * FROM deployment_history WHERE id = ?", (deployment_id,), one=True)
        if not target:
            return jsonify({"success": False, "error": "Target deployment not found"}), 404
            
        # Determine next build number
        last_build = query_db("SELECT build_number FROM deployment_history ORDER BY id DESC LIMIT 1", one=True)
        if last_build:
            try:
                last_num = int(last_build['build_number'].replace('#', ''))
                next_build_num = f"#{last_num + 1}"
            except ValueError:
                next_build_num = "#1025"
        else:
            next_build_num = "#1001"
            
        data = request.get_json() or {}
        triggered_by = data.get('triggered_by', 'Operator (Rollback)')
        
        query = """
            INSERT INTO deployment_history (build_number, version, commit_id, branch, status, duration, triggered_by, deployment_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
        """
        version = f"{target['version']}-rb"
        new_id = execute_db(query, (next_build_num, version, target['commit_id'], target['branch'], 'SUCCESS', '1m 20s', triggered_by))
        new_deployment = query_db("SELECT * FROM deployment_history WHERE id = ?", (new_id,), one=True)
        
        return jsonify({
            "success": True,
            "message": f"Successfully rolled back to Build {target['build_number']} (Version {target['version']})",
            "deployment": new_deployment
        }), 201
    except Exception as e:
        return jsonify({"success": False, "error": "Rollback failure", "details": str(e)}), 500

@deployments_bp.route('/deployments/redeploy/<int:deployment_id>', methods=['POST'])
def redeploy(deployment_id):
    """Trigger a redeployment of an existing build configurations, creating a new history item."""
    try:
        target = query_db("SELECT * FROM deployment_history WHERE id = ?", (deployment_id,), one=True)
        if not target:
            return jsonify({"success": False, "error": "Target deployment not found"}), 404
            
        # Determine next build number
        last_build = query_db("SELECT build_number FROM deployment_history ORDER BY id DESC LIMIT 1", one=True)
        if last_build:
            try:
                last_num = int(last_build['build_number'].replace('#', ''))
                next_build_num = f"#{last_num + 1}"
            except ValueError:
                next_build_num = "#1025"
        else:
            next_build_num = "#1001"
            
        data = request.get_json() or {}
        triggered_by = data.get('triggered_by', 'Operator (Redeploy)')
        
        query = """
            INSERT INTO deployment_history (build_number, version, commit_id, branch, status, duration, triggered_by, deployment_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
        """
        new_id = execute_db(query, (next_build_num, target['version'], target['commit_id'], target['branch'], 'SUCCESS', target['duration'], triggered_by))
        new_deployment = query_db("SELECT * FROM deployment_history WHERE id = ?", (new_id,), one=True)
        
        return jsonify({
            "success": True,
            "message": f"Successfully redeployed Build {target['build_number']}",
            "deployment": new_deployment
        }), 201
    except Exception as e:
        return jsonify({"success": False, "error": "Redeployment failure", "details": str(e)}), 500
