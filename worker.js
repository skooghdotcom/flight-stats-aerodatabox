// Flight Stats - Cloudflare Worker with embedded static files

function validateApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') return false;
  return apiKey.length >= 32;
}

function getDateRange(daysBack = 7) {
  const safeDays = Math.min(parseInt(daysBack) || 7, 7);
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - safeDays);
  
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  };
  
  return { startDate: formatDate(startDate), endDate: formatDate(endDate) };
}

const INDEX_HTML = `<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flight Stats - AeroDataBox</title>
    <style>
:root{--primary-color:#2563eb;--primary-hover:#1d4ed8;--bg-color:#f5f5dc;--card-bg:#ffffff;--text-color:#1e293b;--text-muted:#64748b;--border-color:#e2e8f0;--success-color:#10b981;--error-color:#ef4444;--warning-color:#f59e0b;--button-color:#22c55e;--button-hover:#16a34a}*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;background-color:var(--bg-color);color:var(--text-color);line-height:1.6}.container{max-width:1400px;margin:0 auto;padding:1rem}header{text-align:center;margin-bottom:2rem}header h1{font-size:2rem;color:var(--primary-color);margin-bottom:.5rem}.subtitle{color:var(--text-muted);font-size:1rem}.search-section{background:var(--card-bg);padding:1.5rem;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,.1);margin-bottom:1.5rem}.search-form{display:flex;gap:.75rem;flex-wrap:wrap;align-items:flex-end}.input-group{flex:1;min-width:150px}.input-group label{display:block;margin-bottom:.375rem;font-weight:600;color:var(--text-color);font-size:.875rem}.input-group input{width:100%;padding:.625rem;border:2px solid var(--border-color);border-radius:6px;font-size:.875rem;transition:border-color .2s}.input-group input:focus{outline:none;border-color:var(--primary-color)}.search-btn{background-color:var(--button-color);color:#fff;border:none;padding:.625rem 1.5rem;border-radius:6px;font-size:.875rem;font-weight:600;cursor:pointer;transition:background-color .2s}.search-btn:hover{background-color:var(--button-hover)}.search-btn:focus{outline:3px solid var(--primary-color);outline-offset:2px}.results-section{background:var(--card-bg);padding:1.5rem;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,.1);margin-bottom:1.5rem}.results-section h2{margin-bottom:1rem;color:var(--primary-color);font-size:1.25rem}.loading{text-align:center;padding:2rem}.spinner{border:3px solid var(--border-color);border-top-color:var(--primary-color);border-radius:50%;width:32px;height:32px;animation:spin 1s linear infinite;margin:0 auto .75rem}@keyframes spin{to{transform:rotate(360deg)}}.error{background-color:#fef2f2;color:var(--error-color);padding:.75rem;border-radius:6px;border-left:3px solid var(--error-color);margin-bottom:.75rem;font-size:.875rem}.table-container{overflow-x:auto;-webkit-overflow-scrolling:touch}table{width:100%;border-collapse:collapse;font-size:.75rem}thead{background-color:var(--primary-color);color:#fff}th,td{padding:.5rem .375rem;text-align:left;border-bottom:1px solid var(--border-color);white-space:nowrap}th{font-weight:600}tr:hover{background-color:var(--bg-color)}.status-landed{color:var(--success-color);font-weight:600}.status-delayed{color:var(--warning-color);font-weight:600}.status-cancelled{color:var(--error-color);font-weight:600}.info-section{background:var(--card-bg);padding:1.5rem;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,.1)}.info-section h3{margin-bottom:.75rem;color:var(--primary-color);font-size:1rem}.info-section p{margin-bottom:.75rem;color:var(--text-muted);font-size:.875rem}.info-section a{color:var(--primary-color);text-decoration:none}.info-section a:hover{text-decoration:underline}footer{text-align:center;margin-top:2rem;padding-top:1rem;border-top:1px solid var(--border-color);color:var(--text-muted);font-size:.875rem}footer a{color:var(--primary-color);text-decoration:none}footer a:hover{text-decoration:underline}@media(max-width:1024px){.container{padding:.75rem}table{font-size:.7rem}th,td{padding:.375rem .25rem}}@media(max-width:768px){.container{padding:.5rem}header h1{font-size:1.5rem}.search-form{flex-direction:column}.input-group{width:100%}.search-btn{width:100%}table{font-size:.65rem}th,td{padding:.25rem .1875rem}}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Flight Stats</h1>
            <p class="subtitle">Hitta gate-statistik for dina flighter</p>
        </header>
        <main>
            <section class="search-section">
                <form id="searchForm" class="search-form" onsubmit="handleSearch(event)">
                    <div class="input-group">
                        <label for="flightNumber">Flight-nummer</label>
                        <input type="text" id="flightNumber" name="flightNumber" placeholder="LH2415" required pattern="[A-Za-z]{2}[0-9]{1,4}" title="Ange flight-nummer (t.ex. LH2415)">
                    </div>
                    <div class="input-group">
                        <label for="days">Dagar bakat (max 7)</label>
                        <input type="number" id="days" name="days" value="7" min="1" max="7">
                    </div>
                    <button type="submit" class="search-btn" tabindex="0">SKICKA</button>
                </form>
            </section>
            <section id="results" class="results-section" style="display: none;">
                <h2 id="flightTitle">Flight Resultat</h2>
                <div id="loading" class="loading" style="display: none;"><div class="spinner"></div><p>Laddar flight-data...</p></div>
                <div id="error" class="error" style="display: none;"></div>
                <div id="tableContainer" class="table-container"></div>
            </section>
            <section class="info-section">
                <h3>Om denna app</h3>
                <p>Denna webbapp anvander <a href="https://rapidapi.com/aerodatabox/api/aerodatabox" target="_blank">AeroDataBox API</a> for att hamta flight-historik. Gratis-tier ger 600 API-enheter per manad.</p>
                <p>Gate-data ar "ibland tillganglig" enligt AeroDataBox dokumentation.</p>
            </section>
        </main>
        <footer>
            <p>Skapad med AeroDataBox API | <a href="https://github.com/skooghdotcom/flight-stats-aerodatabox">GitHub</a></p>
        </footer>
    </div>
    <script>
var API_BASE_URL = "/api";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  var date = new Date(dateStr);
  return date.toLocaleDateString("sv-SE", { year: "2-digit", month: "2-digit", day: "2-digit" });
}

function getStatusClass(status) {
  if (!status) return "";
  var s = status.toLowerCase();
  if (s.indexOf("landed") >= 0 || s.indexOf("arrived") >= 0) return "landed";
  if (s.indexOf("delayed") >= 0) return "delayed";
  if (s.indexOf("cancelled") >= 0) return "cancelled";
  return "";
}

function showError(message) {
  var errorEl = document.getElementById("error");
  errorEl.textContent = message;
  errorEl.style.display = "block";
}

function displayResults(flights) {
  var container = document.getElementById("tableContainer");
  if (!flights || flights.length === 0) {
    container.innerHTML = "<p>Ingen flight-historik hittades.</p>";
    return;
  }
  
  var table = document.createElement("table");
  var html = "<thead><tr><th>Datum</th><th>Fr</th><th>Till</th><th>Plan Avg</th><th>Fakt Avg</th><th>Plan Ank</th><th>Fakt Ank</th><th>Gate</th><th>Term</th><th>Status</th></tr></thead><tbody>";
  
  for (var i = 0; i < flights.length; i++) {
    var flight = flights[i];
    var depTime = (flight.departure && flight.departure.scheduledTime) ? flight.departure.scheduledTime.local : "-";
    var actDepTime = (flight.departure && flight.departure.revisedTime) ? flight.departure.revisedTime.local : "-";
    var arrTime = (flight.arrival && flight.arrival.scheduledTime) ? flight.arrival.scheduledTime.local : "-";
    var actArrTime = (flight.arrival && flight.arrival.revisedTime) ? flight.arrival.revisedTime.local : "-";
    var depAirport = (flight.departure && flight.departure.airport) ? flight.departure.airport.iata : "-";
    var arrAirport = (flight.arrival && flight.arrival.airport) ? flight.arrival.airport.iata : "-";
    var gate = (flight.arrival && flight.arrival.gate) ? flight.arrival.gate : "-";
    var terminal = (flight.arrival && flight.arrival.terminal) ? flight.arrival.terminal : "-";
    var dateStr = (arrTime !== "-") ? arrTime.split(" ")[0] : "-";
    
    html += "<tr>";
    html += "<td>" + formatDate(dateStr) + "</td>";
    html += "<td>" + depAirport + "</td>";
    html += "<td>" + arrAirport + "</td>";
    html += "<td>" + depTime + "</td>";
    html += "<td>" + actDepTime + "</td>";
    html += "<td>" + arrTime + "</td>";
    html += "<td>" + actArrTime + "</td>";
    html += "<td>" + gate + "</td>";
    html += "<td>" + terminal + "</td>";
    html += "<td class=\"status-" + getStatusClass(flight.status) + "\">" + (flight.status || "-") + "</td>";
    html += "</tr>";
  }
  
  html += "</tbody>";
  table.innerHTML = html;
  container.appendChild(table);
}

function handleSearch(event) {
  event.preventDefault();
  
  var flightNumber = document.getElementById("flightNumber").value.trim().toUpperCase();
  var days = document.getElementById("days").value || "7";
  
  if (!flightNumber) {
    showError("Ange ett flight-nummer");
    return;
  }
  
  document.getElementById("results").style.display = "block";
  document.getElementById("loading").style.display = "block";
  document.getElementById("error").style.display = "none";
  document.getElementById("tableContainer").innerHTML = "";
  document.getElementById("flightTitle").textContent = "Flight " + flightNumber + " - Historik";
  
  fetch(API_BASE_URL + "/flight/" + flightNumber + "/history?days=" + days)
    .then(function(response) {
      if (!response.ok) {
        throw new Error("Fel vid hamtning: " + response.status);
      }
      return response.json();
    })
    .then(function(data) {
      document.getElementById("loading").style.display = "none";
      displayResults(data);
    })
    .catch(function(error) {
      document.getElementById("loading").style.display = "none";
      showError(error.message);
    });
}
    </script>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-RapidAPI-Key, X-RapidAPI-Host',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/api/health') {
      const apiKeyValid = env.AERODATABOX_API_KEY && validateApiKey(env.AERODATABOX_API_KEY);
      return new Response(
        JSON.stringify({ 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          apiConfigured: !!env.AERODATABOX_API_KEY,
          apiKeyValid: apiKeyValid,
          apiKeyLength: env.AERODATABOX_API_KEY ? env.AERODATABOX_API_KEY.length : 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const flightMatch = url.pathname.match(/^\/api\/flight\/([A-Za-z0-9]+)\/history$/);
    if (flightMatch) {
      const flightNumber = flightMatch[1].toUpperCase();
      const daysBack = url.searchParams.get('days') || '7';

      if (!env.AERODATABOX_API_KEY) {
        return new Response(
          JSON.stringify({ error: 'API-nyckel inte konfigurerad' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!validateApiKey(env.AERODATABOX_API_KEY)) {
        return new Response(
          JSON.stringify({ error: 'Ogiltig API-nyckel', keyLength: env.AERODATABOX_API_KEY.length }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        const { startDate, endDate } = getDateRange(parseInt(daysBack));
        const apiUrl = 'https://' + env.AERODATABOX_HOST + '/flights/number/' + flightNumber + '/' + startDate + '/' + endDate + '?dateLocalRole=Both';
        
        console.log('Fetching:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': env.AERODATABOX_API_KEY,
            'X-RapidAPI-Host': env.AERODATABOX_HOST,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('AeroDataBox error:', response.status, errorData);
          
          return new Response(
            JSON.stringify({ error: 'Fel fran AeroDataBox API: ' + response.status, details: errorData }),
            { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const data = await response.json();
        console.log('Response:', data.length, 'flights');
        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (error) {
        console.error('Error fetching flight data:', error);
        return new Response(
          JSON.stringify({ error: 'Internt serverfel', message: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(INDEX_HTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        ...corsHeaders
      }
    });
  }
};
