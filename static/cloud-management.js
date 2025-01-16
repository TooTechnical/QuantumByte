document.getElementById('cloud-config-form').addEventListener('submit', function(e) {
    e.preventDefault();
    fetch('/manage_clouds', {
        method: 'POST',
        body: new FormData(this)
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('config-result').textContent = data.status;
    });
});
