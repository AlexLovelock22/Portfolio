document.addEventListener('DOMContentLoaded', function () {
    fetch('https://script.google.com/macros/s/AKfycbyZk7D_cXgGvt43hPCVPSPCS6KFul_KC8QqDGfFU3EZpbs6MXazaYDN-i13w9choM8/exec')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log(data); // Output the incoming data in the console
            const eventsContainer = document.getElementById('eventsContainer');
            data.forEach(event => {
                const date = new Date(event['Date']).toLocaleDateString();
                const eventDiv = document.createElement('div');
                eventDiv.classList.add('event');
                eventDiv.innerHTML = `
                <h3>${event['Event Name']}</h3>
                <p><strong>Date:</strong> ${date}</p>
                <p>${event['Description']}</p>
              `;
                eventsContainer.appendChild(eventDiv);
            });
        })
        .catch(error => console.error('Error fetching events:', error));
});
