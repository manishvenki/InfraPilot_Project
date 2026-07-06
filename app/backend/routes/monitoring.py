from flask import Blueprint, jsonify
import random

monitoring_bp = Blueprint('monitoring', __name__)

@monitoring_bp.route('/monitoring', methods=['GET'])
def get_monitoring_data():
    """Retrieve simulated real-time infrastructure and application telemetries."""
    cpu_usage = round(random.uniform(30.0, 68.0), 1)
    memory_usage = round(random.uniform(60.0, 82.0), 1)
    disk_usage = 54.1 # relatively static
    
    network_in = round(random.uniform(15.4, 45.8), 1)
    network_out = round(random.uniform(35.2, 92.1), 1)
    
    requests_sec = random.randint(150, 480)
    response_time = random.randint(35, 120)
    error_rate = round(random.uniform(0.02, 1.25), 2)
    
    return jsonify({
        "cpu_usage": cpu_usage,
        "memory_usage": memory_usage,
        "disk_usage": disk_usage,
        "network": {
            "inbound_mbps": network_in,
            "outbound_mbps": network_out
        },
        "requests_per_sec": requests_sec,
        "response_time_ms": response_time,
        "error_rate_percent": error_rate
    }), 200
