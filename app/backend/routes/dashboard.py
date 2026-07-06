from flask import Blueprint, jsonify
from utils.db import query_db

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard', methods=['GET'])
def get_dashboard_data():
    """Retrieve combined system dashboard metrics and recent deployment logs."""
    try:
        # Fetch the latest 5 deployment records from the SQLite database
        recent_deployments = query_db("SELECT * FROM deployment_history ORDER BY id DESC LIMIT 5")
        latest_deployment = recent_deployments[0] if recent_deployments else None
        
        # Calculate summary deployment stats from DB
        total_count_res = query_db("SELECT COUNT(*) as count FROM deployment_history", one=True)
        success_count_res = query_db("SELECT COUNT(*) as count FROM deployment_history WHERE status='SUCCESS'", one=True)
        
        total_builds = total_count_res['count'] if total_count_res else 0
        success_builds = success_count_res['count'] if success_count_res else 0
        
        success_rate = "0.0%"
        if total_builds > 0:
            success_rate = f"{(success_builds / total_builds) * 100:.1f}%"
            
        data = {
            "system": {
                "cpu_usage": 42.5,
                "memory_usage": 68.2,
                "disk_usage": 54.1,
                "network_status": "Optimal",
                "app_health": "Healthy",
                "running_containers": 14,
                "pods_running": 28,
                "current_version": "v1.2.0",
                "build_number": f"#{1000 + total_builds}",
                "environment": "Production"
            },
            "latest_deployment": latest_deployment,
            "recent_history": recent_deployments,
            "metrics": {
                "success_rate": success_rate,
                "total_builds": total_builds,
                "active_alerts": 0
            }
        }
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": "Failed to load dashboard metrics", "details": str(e)}), 500
