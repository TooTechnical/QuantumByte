from flask import Flask, render_template, request, jsonify
import os
import psutil
import socket
import subprocess
import platform
from sklearn.ensemble import RandomForestClassifier
import numpy as np
import pickle
import networkx as nx
import json
import boto3

app = Flask(__name__)

def get_system_stats():
    stats = {
        'cpu_percent': psutil.cpu_percent(interval=1),
        'memory': dict(psutil.virtual_memory()._asdict()),
        'disk_usage': dict(psutil.disk_usage('/')._asdict()),
        'network_io': dict(psutil.net_io_counters()._asdict())
    }
    return stats

def ping_server(server):
    param = '-n' if platform.system().lower() == 'windows' else '-c'
    command = ['ping', param, '1', server]
    try:
        output = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if output.returncode == 0:
            return {'server': server, 'status': 'reachable', 'output': output.stdout}
        else:
            return {'server': server, 'status': 'unreachable', 'output': output.stderr}
    except Exception as e:
        return {'server': server, 'status': 'error', 'output': str(e)}

def dns_lookup(domain):
    try:
        ip_address = socket.gethostbyname(domain)
        return {'domain': domain, 'ip_address': ip_address}
    except socket.gaierror as e:
        return {'domain': domain, 'error': str(e)}

def port_scan(host, ports):
    open_ports = []
    for port in ports:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(1)
            result = s.connect_ex((host, port))
            if result == 0:
                open_ports.append(port)
    return {'host': host, 'open_ports': open_ports}

def predict_network_issue(latency, packet_loss, jitter):
    model_file = 'network_issue_model.pkl'
    if not os.path.exists(model_file):
        # Train a simple model if it doesn't exist
        X = np.array([[10, 0, 5], [50, 5, 20], [30, 2, 10], [5, 0, 2], [70, 10, 30]])
        y = np.array([0, 1, 1, 0, 1])
        model = RandomForestClassifier()
        model.fit(X, y)
        with open(model_file, 'wb') as f:
            pickle.dump(model, f)
    else:
        with open(model_file, 'rb') as f:
            model = pickle.load(f)
    
    prediction = model.predict([[latency, packet_loss, jitter]])
    return "Network issue detected" if prediction[0] == 1 else "No network issue detected"

def create_network_graph():
    G = nx.Graph()
    G.add_edge("Router", "Switch1")
    G.add_edge("Switch1", "Server1")
    G.add_edge("Switch1", "Server2")
    G.add_edge("Router", "Switch2")
    G.add_edge("Switch2", "Server3")
    G.add_edge("Switch2", "Server4")
    return json.dumps(nx.node_link_data(G))

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/system_stats')
def system_stats():
    return jsonify(get_system_stats())

@app.route('/ping', methods=['POST'])
def ping():
    server = request.json['server']
    return jsonify(ping_server(server))

@app.route('/dns_lookup', methods=['POST'])
def lookup():
    domain = request.json['domain']
    return jsonify(dns_lookup(domain))

@app.route('/port_scan', methods=['POST'])
def scan():
    host = request.json['host']
    ports = request.json['ports']
    return jsonify(port_scan(host, ports))

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    result = predict_network_issue(data['latency'], data['packet_loss'], data['jitter'])
    return jsonify({'prediction': result})

@app.route('/network_graph')
def network_graph():
    return create_network_graph()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
