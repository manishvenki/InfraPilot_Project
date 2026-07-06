from flask import Blueprint, jsonify, request
import time

docker_bp = Blueprint('docker', __name__)

# InMemory storage for mock containers to keep state changes (e.g. restart increments, state changes)
mock_containers = [
    {
        "id": "c1",
        "name": "infrapilot-backend",
        "image": "infrapilot/backend:latest",
        "status": "running",
        "ports": "5000:5000",
        "restart_count": 0,
        "created_time": "2026-07-04 08:00:00"
    },
    {
        "id": "c2",
        "name": "infrapilot-frontend",
        "image": "infrapilot/frontend:latest",
        "status": "running",
        "ports": "80:3000",
        "restart_count": 1,
        "created_time": "2026-07-04 08:05:00"
    },
    {
        "id": "c3",
        "name": "infrapilot-db",
        "image": "sqlite3:3.45.0",
        "status": "running",
        "ports": "3306:3306",
        "restart_count": 0,
        "created_time": "2026-07-04 07:55:00"
    },
    {
        "id": "c4",
        "name": "nginx-ingress",
        "image": "nginx:alpine",
        "status": "running",
        "ports": "80:80, 443:443",
        "restart_count": 3,
        "created_time": "2026-07-03 12:00:00"
    },
    {
        "id": "c5",
        "name": "prometheus-server",
        "image": "prom/prometheus:latest",
        "status": "exited",
        "ports": "9090:9090",
        "restart_count": 5,
        "created_time": "2026-07-01 10:00:00"
    }
]

@docker_bp.route('/docker', methods=['GET'])
def get_containers():
    """Get the status of all Docker containers."""
    return jsonify(mock_containers), 200

@docker_bp.route('/docker/<container_id>/restart', methods=['POST'])
def restart_container(container_id):
    """Restart a specific container and increment its restart counter."""
    for container in mock_containers:
        if container["id"] == container_id:
            container["status"] = "running"
            container["restart_count"] += 1
            return jsonify({
                "success": True,
                "message": f"Container {container['name']} restarted successfully",
                "container": container
            }), 200
    return jsonify({"success": False, "error": f"Container with ID {container_id} not found"}), 404

@docker_bp.route('/docker/<container_id>/logs', methods=['GET'])
def get_container_logs(container_id):
    """Get stdout/stderr logs from the specific container."""
    for container in mock_containers:
        if container["id"] == container_id:
            host_port = container["ports"].split(":")[0] if ":" in container["ports"] else "80"
            logs = [
                f"2026-07-04T08:00:01.234Z [system] Starting container {container['name']}...",
                f"2026-07-04T08:00:02.102Z [runtime] Configuration loaded successfully.",
                f"2026-07-04T08:00:02.501Z [runtime] Database connection pooling initialized.",
                f"2026-07-04T08:00:03.012Z [network] Server listening on interface 0.0.0.0:{host_port}.",
                f"2026-07-04T08:00:15.892Z [app] GET /health - 200 OK - 5.2ms - user-agent: kube-probe"
            ]
            if container["status"] == "exited":
                logs.append("2026-07-04T12:00:00.000Z [system] SIGTERM received. Shutting down cleanly...")
                logs.append("2026-07-04T12:00:01.405Z [system] Connection pools drained.")
                logs.append("2026-07-04T12:00:02.000Z [system] Container exited with exit code 137")
            return jsonify({
                "container": container["name"],
                "logs": logs
            }), 200
    return jsonify({"error": "Container not found"}), 404

@docker_bp.route('/docker/<container_id>/inspect', methods=['GET'])
def inspect_container(container_id):
    """Inspect detailed configuration metadata of the specific container."""
    for container in mock_containers:
        if container["id"] == container_id:
            host_port = container["ports"].split(":")[0] if ":" in container["ports"] else "80"
            container_port = container["ports"].split(":")[1] if ":" in container["ports"] else "80"
            return jsonify({
                "Id": f"sha256:7f08c381c81ef45db00192e2{container['id']}fbbf8b31a2380f58dcf4a29a419266ad8564f",
                "Created": container["created_time"],
                "Path": "/entrypoint.sh",
                "Args": ["run-prod"],
                "State": {
                    "Status": container["status"],
                    "Running": container["status"] == "running",
                    "Paused": False,
                    "Restarting": False,
                    "OOMKilled": False,
                    "Dead": False,
                    "Pid": 4821 if container["status"] == "running" else 0,
                    "ExitCode": 0 if container["status"] == "running" else 137,
                    "Error": "",
                    "FinishedAt": "2026-07-04T12:00:02.000Z" if container["status"] == "exited" else "0001-01-01T00:00:00Z"
                },
                "Image": f"sha256:e682bb4d5b77c5c2d3a3d5{container['image']}",
                "Config": {
                    "Hostname": container["name"],
                    "Env": [
                        "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
                        "APP_ENV=production",
                        f"PORT={container_port}"
                    ],
                    "Cmd": ["/entrypoint.sh", "run-prod"]
                },
                "NetworkSettings": {
                    "Bridge": "bridge",
                    "Gateway": "172.18.0.1",
                    "IPAddress": "172.18.0.4",
                    "Ports": {
                        f"{container_port}/tcp": [
                            {
                                "HostIp": "0.0.0.0",
                                "HostPort": host_port
                            }
                        ]
                    }
                }
            }), 200
    return jsonify({"error": "Container not found"}), 404
