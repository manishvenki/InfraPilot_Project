from flask import Blueprint, jsonify

kubernetes_bp = Blueprint('kubernetes', __name__)

# Mock data reflecting a typical small-medium enterprise K8s cluster
mock_namespaces = [
    {"name": "default", "status": "Active", "age": "45d"},
    {"name": "kube-system", "status": "Active", "age": "45d"},
    {"name": "infrapilot-prod", "status": "Active", "age": "12d"},
    {"name": "monitoring", "status": "Active", "age": "20d"}
]

mock_pods = [
    {"name": "infrapilot-backend-7fd6b88989-2klm8", "namespace": "infrapilot-prod", "status": "Running", "restarts": 0, "ip": "10.244.1.42", "node": "node-worker-1", "age": "5d"},
    {"name": "infrapilot-backend-7fd6b88989-pxz9q", "namespace": "infrapilot-prod", "status": "Running", "restarts": 1, "ip": "10.244.2.19", "node": "node-worker-2", "age": "5d"},
    {"name": "infrapilot-frontend-6b44ccdf96-jhd78", "namespace": "infrapilot-prod", "status": "Running", "restarts": 0, "ip": "10.244.1.43", "node": "node-worker-1", "age": "5d"},
    {"name": "prometheus-server-85dfc4c79d-q8w2r", "namespace": "monitoring", "status": "Running", "restarts": 2, "ip": "10.244.2.20", "node": "node-worker-2", "age": "10d"},
    {"name": "grafana-7bb5df756b-pqr72", "namespace": "monitoring", "status": "Running", "restarts": 0, "ip": "10.244.1.44", "node": "node-worker-1", "age": "10d"},
    {"name": "postgres-db-0", "namespace": "default", "status": "Running", "restarts": 0, "ip": "10.244.2.21", "node": "node-worker-2", "age": "30d"}
]

mock_deployments = [
    {"name": "infrapilot-backend", "namespace": "infrapilot-prod", "ready": "2/2", "up_to_date": 2, "available": 2, "age": "12d"},
    {"name": "infrapilot-frontend", "namespace": "infrapilot-prod", "ready": "1/1", "up_to_date": 1, "available": 1, "age": "12d"},
    {"name": "prometheus-server", "namespace": "monitoring", "ready": "1/1", "up_to_date": 1, "available": 1, "age": "20d"},
    {"name": "grafana", "namespace": "monitoring", "ready": "1/1", "up_to_date": 1, "available": 1, "age": "20d"}
]

mock_replica_sets = [
    {"name": "infrapilot-backend-7fd6b88989", "namespace": "infrapilot-prod", "desired": 2, "current": 2, "ready": 2, "age": "5d"},
    {"name": "infrapilot-frontend-6b44ccdf96", "namespace": "infrapilot-prod", "desired": 1, "current": 1, "ready": 1, "age": "5d"},
    {"name": "prometheus-server-85dfc4c79d", "namespace": "monitoring", "desired": 1, "current": 1, "ready": 1, "age": "10d"},
    {"name": "grafana-7bb5df756b", "namespace": "monitoring", "desired": 1, "current": 1, "ready": 1, "age": "10d"}
]

mock_services = [
    {"name": "infrapilot-backend-svc", "namespace": "infrapilot-prod", "type": "ClusterIP", "cluster_ip": "10.96.42.11", "external_ip": "None", "ports": "5000/TCP", "age": "12d"},
    {"name": "infrapilot-frontend-svc", "namespace": "infrapilot-prod", "type": "LoadBalancer", "cluster_ip": "10.96.85.220", "external_ip": "192.168.1.150", "ports": "80:32080/TCP", "age": "12d"},
    {"name": "prometheus-service", "namespace": "monitoring", "type": "ClusterIP", "cluster_ip": "10.96.112.56", "external_ip": "None", "ports": "9090/TCP", "age": "20d"},
    {"name": "grafana-service", "namespace": "monitoring", "type": "NodePort", "cluster_ip": "10.96.201.89", "external_ip": "None", "ports": "80:31200/TCP", "age": "20d"}
]

mock_nodes = [
    {"name": "node-master", "status": "Ready", "roles": "control-plane", "age": "45d", "version": "v1.28.2", "internal_ip": "192.168.1.50"},
    {"name": "node-worker-1", "status": "Ready", "roles": "worker", "age": "45d", "version": "v1.28.2", "internal_ip": "192.168.1.51"},
    {"name": "node-worker-2", "status": "Ready", "roles": "worker", "age": "45d", "version": "v1.28.2", "internal_ip": "192.168.1.52"}
]

@kubernetes_bp.route('/kubernetes', methods=['GET'])
def get_kubernetes_data():
    """Retrieve all Kubernetes cluster object data and statuses."""
    cluster_status = {
        "status": "Healthy",
        "api_server": "Healthy",
        "scheduler": "Healthy",
        "controller_manager": "Healthy",
        "node_count": len(mock_nodes),
        "total_namespaces": len(mock_namespaces),
        "total_pods": len(mock_pods),
        "total_deployments": len(mock_deployments)
    }
    
    return jsonify({
        "namespaces": mock_namespaces,
        "pods": mock_pods,
        "deployments": mock_deployments,
        "replica_sets": mock_replica_sets,
        "services": mock_services,
        "nodes": mock_nodes,
        "cluster_status": cluster_status
    }), 200
