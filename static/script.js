function updateSystemStats() {
    fetch('/system_stats')
        .then(response => response.json())
        .then(data => {
            const ctx = document.getElementById('system-chart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['CPU Usage', 'Memory Usage', 'Disk Usage'],
                    datasets: [{
                        label: 'System Resources',
                        data: [data.cpu_percent, data.memory.percent, data.disk_usage.percent],
                        backgroundColor: ['red', 'blue', 'green']
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        });
}

function pingServer() {
    const server = document.getElementById('ping-server').value;
    fetch('/ping', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({server: server})
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('ping-result').textContent = JSON.stringify(data);
    });
}

function dnsLookup() {
    const domain = document.getElementById('dns-domain').value;
    fetch('/dns_lookup', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({domain: domain})
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('dns-result').textContent = JSON.stringify(data);
    });
}

function portScan() {
    const host = document.getElementById('scan-host').value;
    const ports = document.getElementById('scan-ports').value.split(',').map(Number);
    fetch('/port_scan', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({host: host, ports: ports})
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('scan-result').textContent = JSON.stringify(data);
    });
}

function predictIssue() {
    const latency = document.getElementById('latency').value;
    const packetLoss = document.getElementById('packet-loss').value;
    const jitter = document.getElementById('jitter').value;
    fetch('/predict', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({latency: latency, packet_loss: packetLoss, jitter: jitter})
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('prediction-result').textContent = data.prediction;
    });
}

function createNetworkGraph() {
    fetch('/network_graph')
        .then(response => response.json())
        .then(data => {
            const width = 400;
            const height = 300;
            const svg = d3.select("#graph")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

            const simulation = d3.forceSimulation(data.nodes)
                .force("link", d3.forceLink(data.links).id(d => d.id))
                .force("charge", d3.forceManyBody())
                .force("center", d3.forceCenter(width / 2, height / 2));

            const link = svg.append("g")
                .selectAll("line")
                .data(data.links)
                .enter().append("line")
                .attr("stroke", "#999")
                .attr("stroke-opacity", 0.6);

            const node = svg.append("g")
                .selectAll("circle")
                .data(data.nodes)
                .enter().append("circle")
                .attr("r", 5)
                .attr("fill", "#69b3a2");

            node.append("title")
                .text(d => d.id);

            simulation.on("tick", () => {
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);

                node
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
            });
        });
}

document.addEventListener('DOMContentLoaded', (event) => {
    updateSystemStats();
    createNetworkGraph();
    setInterval(updateSystemStats, 5000);  // Update every 5 seconds
});
