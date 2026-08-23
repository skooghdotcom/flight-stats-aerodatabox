// Flight Stats - Frontend JavaScript

const API_BASE_URL = '/api'; // Cloudflare Workers backend

document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    const resultsSection = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const tableContainer = document.getElementById('tableContainer');
    const flightTitle = document.getElementById('flightTitle');

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const flightNumber = document.getElementById('flightNumber').value.trim().toUpperCase();
        const limit = document.getElementById('limit').value || '10';

        if (!flightNumber) {
            showError('Ange ett flight-nummer');
            return;
        }

        // Visa results section och loading
        resultsSection.style.display = 'block';
        loadingDiv.style.display = 'block';
        errorDiv.style.display = 'none';
        tableContainer.innerHTML = '';
        flightTitle.textContent = `Flight ${flightNumber} - Historik`;

        try {
            const data = await fetchFlightHistory(flightNumber, limit);
            loadingDiv.style.display = 'none';
            displayResults(data);
        } catch (error) {
            loadingDiv.style.display = 'none';
            showError(error.message);
        }
    });
});

async function fetchFlightHistory(flightNumber, limit) {
    // AnvÃ¤nd Cloudflare Workers backend
    const response = await fetch(`${API_BASE_URL}/flight/${flightNumber}/history?limit=${limit}`);

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Ogiltig API-nyckel. Kontrollera din AeroDataBox API-nyckel.');
        } else if (response.status === 429) {
            throw new Error('API-grÃ¤ns uppnÃ¥dd. VÃ¤nta eller uppgradera din plan.');
        } else if (response.status === 404) {
            throw new Error(`Ingen data hittades fÃ¶r flight ${flightNumber}`);
        } else {
            throw new Error(`Fel vid hÃ¤mtning av data: ${response.status}`);
        }
    }

    return await response.json();
}

function displayResults(data) {
    const tableContainer = document.getElementById('tableContainer');
    
    if (!data || !data.history || data.history.length === 0) {
        tableContainer.innerHTML = '<p>Ingen flight-historik hittades.</p>';
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Datum</th>
                <th>FrÃ¥n</th>
                <th>Till</th>
                <th>Scheduled AvgÃ¥ng</th>
                <th>Actual AvgÃ¥ng</th>
                <th>Scheduled Ankomst</th>
                <th>Actual Ankomst</th>
                <th>Gate</th>
                <th>Terminal</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            ${data.history.map(flight => `
                <tr>
                    <td>${formatDate(flight.date)}</td>
                    <td>${flight.departureAirport || '-'}</td>
                    <td>${flight.arrivalAirport || '-'}</td>
                    <td>${flight.scheduledDeparture || '-'}</td>
                    <td>${flight.actualDeparture || '-'}</td>
                    <td>${flight.scheduledArrival || '-'}</td>
                    <td>${flight.actualArrival || '-'}</td>
                    <td>${flight.gate || '-'}</td>
                    <td>${flight.terminal || '-'}</td>
                    <td class="status-${getStatusClass(flight.status)}">${flight.status || '-'}</td>
                </tr>
            `).join('')}
        </tbody>
    `;

    tableContainer.appendChild(table);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    });
}

function getStatusClass(status) {
    if (!status) return '';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('landed') || lowerStatus.includes('arrived')) return 'landed';
    if (lowerStatus.includes('delayed')) return 'delayed';
    if (lowerStatus.includes('cancelled')) return 'cancelled';
    return '';
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}
