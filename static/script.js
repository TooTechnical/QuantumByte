function predictIssues() {
    fetch('/predict_issues', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            document.getElementById('prediction-result').textContent = data.prediction;
        });
}

function optimizePerformance() {
    fetch('/optimize_performance', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            document.getElementById('optimization-result').textContent = data.optimization;
        });
}

function simulateNetwork() {
    fetch('/simulate_network', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            document.getElementById('simulation-result').textContent = data.simulation_result;
        });
}
