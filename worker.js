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

const INDEX_HTML = '<!DOCTYPE html>\n<html lang="sv">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Flight Stats - AeroDataBox</title>\n    <style>\n:root{--primary-color:#2563eb;--primary-hover:#1d4ed8;--bg-color:#f8fafc;--card-bg:#ffffff;--text-color:#1e293b;--text-muted:#64748b;--border-color:#e2e8f0;--success-color:#10b981;--error-color:#ef4444;--warning-color:#f59e0b;--button-color:#ef4444;--button-hover:#dc2626}*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;background-color:var(--bg-color);color:var(--text-color);line-height:1.6}.container{max-width:1400px;margin:0 auto;padding:1rem}header{text-align:center;margin-bottom:2rem}header h1{font-size:2rem;color:var(--primary-color);margin-bottom:.5rem}.subtitle{color:var(--text-muted);font-size:1rem}.search-section{background:var(--card-bg);padding:1.5rem;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,.1);margin-bottom:1.5rem}.search-form{display:flex;gap:.75rem;flex-wrap:wrap;align-items:flex-end}.input-group{flex:1;min-width:150px}.input-group label{display:block;margin-bottom:.375rem;font-weight:600;color:var(--text-color);font-size:.875rem}.input-group input{width:100%;padding:.625rem;border:2px solid var(--border-color);border-radius:6px;font-size:.875rem;transition:border-color .2s}.input-group input:focus{outline:none;border-color:var(--primary-color)}.search-btn{background-color:var(--button-color);color:#fff;border:none;padding:.625rem 1.5rem;border-radius:6px;font-size:.875rem;font-weight:600;cursor:pointer;transition:background-color .2s}.search-btn:hover{background-color:var(--button-hover)}.results-section{background:var(--card-bg);padding:1.5rem;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,.1);margin-bottom:1.5rem}.results-section h2{margin-bottom:1rem;color:var(--primary-color);font-size:1.25rem}.loading{text-align:center;padding:2rem}.spinner{border:3px solid var(--border-color);border-top-color:var(--primary-color);border-radius:50%;width:32px;height:32px;animation:spin 1s linear infinite;margin:0 auto .75rem}@keyframes spin{to{transform:rotate(360deg)}}.error{background-color:#fef2f2;color:var(--error-color);padding:.75rem;border-radius:6px;border-left:3px solid var(--error-color);margin-bottom:.75rem;font-size:.875rem}.table-container{overflow-x:auto;-webkit-overflow-scrolling:touch}table{width:100%;border-collapse:collapse;font-size:.75rem}thead{background-color:var(--primary-color);color:#fff}th,td{padding:.5rem .375rem;text-align:left;border-bottom:1px solid var(--border-color);white-space:nowrap}th{font-weight:600}tr:hover{background-color:var(--bg-color)}.status-landed{color:var(--success-color);font-weight:600}.status-delayed{color:var(--warning-color);font-weight:600}.status-cancelled{color:var(--error-color);font-weight:600}.info-section{background:var(--card-bg);padding:1.5rem;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,.1)}.info-section h3{margin-bottom:.75rem;color:var(--primary-color);font-size:1rem}.info-section p{margin-bottom:.75rem;color:var(--text-muted);font-size:.875rem}.info-section a{color:var(--primary-color);text-decoration:none}.info-section a:hover{text-decoration:underline}footer{text-align:center;margin-top:2rem;padding-top:1rem;border-top:1px solid var(--border-color);color:var(--text-muted);font-size:.875rem}footer a{color:var(--primary-color);text-decoration:none}footer a:hover{text-decoration:underline}@media(max-width:1024px){.container{padding:.75rem}table{font-size:.7rem}th,td{padding:.375rem .25rem}}@media(max-width:768px){.container{padding:.5rem}header h1{font-size:1.5rem}.search-form{flex-direction:column}.input-group{width:100%}.search-btn{width:100%}table{font-size:.65rem}th,td{padding:.25rem .1875rem}}\n    </style>\n</head>\n<body>\n    <div class="container">\n        <header>\n            <h1>Flight Stats</h1>\n            <p class="subtitle">Hitta gate-statistik for dina flighter</p>\n        </header>\n        <main>\n            <section class="search-section">\n                <form id="searchForm" class="search-form" onsubmit="return false;">\n                    <div class="input-group">\n                        <label for="flightNumber">Flight-nummer</label>\n                        <input type="text" id="flightNumber" name="flightNumber" placeholder="LH2415" required pattern="[A-Za-z]{2}[0-9]{1,4}" title="Ange flight-nummer (t.ex. LH2415)">\n                    </div>\n                    <div class="input-group">\n                        <label for="days">Dagar bakat (max 7)</label>\n                        <input type="number" id="days" name="days" value="7" min="1" max="7">\n                    </div>\n                    <button type="button" class="search-btn" onclick="doSearch()">Sok</button>\n                </form>\n            </section>\n            <section id="results" class="results-section" style="display: none;">\n                <h2 id="flightTitle">Flight Resultat</h2>\n                <div id="loading" class="loading" style="display: none;"><div class="spinner"></div><p>Laddar flight-data...</p></div>\n                <div id="error" class="error" style="display: none;"></div>\n                <div id="tableContainer" class="table-container"></div>\n            </section>\n            <section class="info-section">\n                <h3>Om denna app</h3>\n                <p>Denna webbapp anvander <a href="https://rapidapi.com/aerodatabox/api/aerodatabox" target="_blank">AeroDataBox API</a> for att hamta flight-historik. Gratis-tier ger 600 API-enheter per manad.</p>\n                <p>Gate-data ar "ibland tillganglig" enligt AeroDataBox dokumentation.</p>\n            </section>\n        </main>\n        <footer>\n            <p>Skapad med AeroDataBox API | <a href="https://github.com/skooghdotcom/flight-stats-aerodatabox">GitHub</a></p>\n        </footer>\n    </div>\n    <script>\nvar API_BASE_URL="/api";\nfunction formatDate(e){if(!e)return"-";var t=new Date(e);return t.toLocaleDateString("sv-SE",{year:"2-digit",month:"2-digit",day:"2-digit"})}\nfunction getStatusClass(e){if(!e)return"";var t=e.toLowerCase();return t.indexOf("landed")>=0||t.indexOf("arrived")>=0?"landed":t.indexOf("delayed")>=0?"delayed":t.indexOf("cancelled")>=0?"cancelled":""}\nfunction showError(e){var t=document.getElementById("error");t.textContent=e;t.style.display="block"}\nfunction displayResults(e){var t=document.getElementById("tableContainer");if(!e||e.length===0){t.innerHTML="<p>Ingen flight-historik hittades.</p>";return}var n=document.createElement("table");var html="<thead><tr><th>Datum</th><th>Fr</th><th>Till</th><th>Plan Avg</th><th>Fakt Avg</th><th>Plan Ank</th><th>Fakt Ank</th><th>Gate</th><th>Term</th><th>Status</th></tr></thead><tbody>";for(var i=0;i<e.length;i++){var o=e[i];var depTime=o.departure&&o.departure.scheduledTime?o.departure.scheduledTime.local:"-";var actDepTime=o.departure&&o.departure.revisedTime?o.departure.revisedTime.local:"-";var arrTime=o.arrival&&o.arrival.scheduledTime?o.arrival.scheduledTime.local:"-";var actArrTime=o.arrival&&o.arrival.revisedTime?o.arrival.revisedTime.local:"-";var depAirport=o.departure&&o.departure.airport?o.departure.airport.iata:"-";var arrAirport=o.arrival&&o.arrival.airport?o.arrival.airport.iata:"-";var gate=o.arrival&&o.arrival.gate?o.arrival.gate:"-";var terminal=o.arrival&&o.arrival.terminal?o.arrival.terminal:"-";var dateStr=arrTime!=="-"?arrTime.split(" ")[0]:"-";html+="<tr><td>"+formatDate(dateStr)+"</td><td>"+depAirport+"</td><td>"+arrAirport+"</td><td>"+depTime+"</td><td>"+actDepTime+"</td><td>"+arrTime+"</td><td>"+actArrTime+"</td><td>"+gate+"</td><td>"+terminal+"</td><td class=\\"status-"+getStatusClass(o.status)+"\\">"+(o.status||"-")+"</td></tr>"}html+="</tbody>";n.innerHTML=html;t.appendChild(n)}\nfunction doSearch(){var flightNumber=document.getElementById("flightNumber").value.trim().toUpperCase();var days=document.getElementById("days").value||"7";if(!flightNumber){showError("Ange ett flight-nummer");return}document.getElementById("results").style.display="block";document.getElementById("loading").style.display="block";document.getElementById("error").style.display="none";document.getElementById("tableContainer").innerHTML="";document.getElementById("flightTitle").textContent="Flight "+flightNumber+" - Historik";fetch(API_BASE_URL+"/flight/"+flightNumber+"/history?days="+days).then(function(r){if(!r.ok){throw new Error("Fel vid hamtning: "+r.status)}return r.json()}).then(function(d){document.getElementById("loading").style.display="none";displayResults(d)}).catch(function(e){document.getElementById("loading").style.display="none";showError(e.message)})}\n    </script>\n</body>\n</html>';

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
