// Flight Stats - Cloudflare Worker with embedded static files

// API Key validation
function validateApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  // RapidAPI-nycklar är vanligtvis 32+ tecken
  return apiKey.length >= 32;
}

// Helper to calculate date range
function getDateRange(daysBack = 7) {
  // AeroDataBox max is 7 days
  const safeDays = Math.min(parseInt(daysBack) || 7, 7);
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - safeDays);
  
  // Format as YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
}

// Embedded HTML
const INDEX_HTML = `<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flight Stats - AeroDataBox</title>
    <style>
:root{--primary-color:#2563eb;--primary-hover:#1d4ed8;--bg-color:#f8fafc;--card-bg:#ffffff;--text-color:#1e293b;--text-muted:#64748b;--border-color:#e2e8f0;--success-color:#10b981;--error-color:#ef4444;--warning-color:#f59e0b;--button-color:#f97316;--button-hover:#ea580c}*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;background-color:var(--bg-color);color:var(--text-color);line-height:1.6}.container{max-width:1200px;margin:0 auto;padding:2rem}header{text-align:center;margin-bottom:3rem}header h1{font-size:2.5rem;color:var(--primary-color);margin-bottom:.5rem}.subtitle{color:var(--text-muted);font-size:1.1rem}.search-section{background:var(--card-bg);padding:2rem;border-radius:12px;box-shadow:0 4px 6px -1px rgba(0,0,0,.1);margin-bottom:2rem}.search-form{display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-end}.input-group{flex:1;min-width:200px}.input-group label{display:block;margin-bottom:.5rem;font-weight:600;color:var(--text-color)}.input-group input{width:100%;padding:.75rem;border:2px solid var(--border-color);border-radius:8px;font-size:1rem;transition:border-color .2s}.input-group input:focus{outline:none;border-color:var(--primary-color)}.search-btn{background-color:var(--button-color);color:#fff;border:none;padding:.75rem 2rem;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;transition:background-color .2s}.search-btn:hover{background-color:var(--button-hover)}.results-section{background:var(--card-bg);padding:2rem;border-radius:12px;box-shadow:0 4px 6px -1px rgba(0,0,0,.1);margin-bottom:2rem}.results-section h2{margin-bottom:1.5rem;color:var(--primary-color)}.loading{text-align:center;padding:3rem}.spinner{border:4px solid var(--border-color);border-top-color:var(--primary-color);border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite;margin:0 auto 1rem}@keyframes spin{to{transform:rotate(360deg)}}.error{background-color:#fef2f2;color:var(--error-color);padding:1rem;border-radius:8px;border-left:4px solid var(--error-color);margin-bottom:1rem}.table-container{overflow-x:auto}table{width:100%;border-collapse:collapse;margin-top:1rem}thead{background-color:var(--primary-color);color:#fff}th,td{padding:1rem;text-align:left;border-bottom:1px solid var(--border-color)}th{font-weight:600;white-space:nowrap}tr:hover{background-color:var(--bg-color)}.status-landed{color:var(--success-color);font-weight:600}.status-delayed{color:var(--warning-color);font-weight:600}.status-cancelled{color:var(--error-color);font-weight:600}.info-section{background:var(--card-bg);padding:2rem;border-radius:12px;box-shadow:0 4px 6px -1px rgba(0,0,0,.1)}.info-section h3{margin-bottom:1rem;color:var(--primary-color)}.info-section p{margin-bottom:1rem;color:var(--text-muted)}.info-section a{color:var(--primary-color);text-decoration:none}.info-section a:hover{text-decoration:underline}footer{text-align:center;margin-top:3rem;padding-top:2rem;border-top:1px solid var(--border-color);color:var(--text-muted)}footer a{color:var(--primary-color);text-decoration:none}footer a:hover{text-decoration:underline}@media(max-width:768px){.container{padding:1rem}header h1{font-size:2rem}.search-form{flex-direction:column}.input-group{width:100%}.search-btn{width:100%}th,td{padding:.75rem .5rem;font-size:.875rem}}
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
                <form id="searchForm" class="search-form">
                    <div class="input-group">
                        <label for="flightNumber">Flight-nummer</label>
                        <input type="text" id="flightNumber" name="flightNumber" placeholder="LH2415" required pattern="[A-Za-z]{2}[0-9]{1,4}" title="Ange flight-nummer (t.ex. LH2415)">
                    </div>
                    <div class="input-group">
                        <label for="days">Dagar bakat (max 7)</label>
                        <input type="number" id="days" name="days" value="7" min="1" max="7">
                    </div>
                    <button type="submit" class="search-btn">Sok</button>
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
(function(){
  const API_BASE_URL="/api";
  
  function formatDate(e){
    if(!e)return"-";
    const t=new Date(e);
    return t.toLocaleDateString("sv-SE",{year:"numeric",month:"2-digit",day:"2-digit"});
  }
  
  function getStatusClass(e){
    if(!e)return"";
    const t=e.toLowerCase();
    return t.includes("landed")||t.includes("arrived")?"landed":t.includes("delayed")?"delayed":t.includes("cancelled")?"cancelled":"";
  }
  
  function showError(e){
    const t=document.getElementById("error");
    t.textContent=e;
    t.style.display="block";
  }
  
  function displayResults(e){
    const t=document.getElementById("tableContainer");
    if(!e||!e.flights||0===e.flights.length){
      t.innerHTML="<p>Ingen flight-historik hittades.</p>";
      return;
    }
    const n=document.createElement("table");
    n.innerHTML="<thead><tr><th>Datum</th><th>Fran</th><th>Till</th><th>Scheduled Avgang</th><th>Actual Avgang</th><th>Scheduled Ankomst</th><th>Actual Ankomst</th><th>Gate</th><th>Terminal</th><th>Status</th></tr></thead><tbody>"+e.flights.map(function(o){
      return"<tr><td>"+formatDate(o.date)+"</td><td>"+(o.departureAirport||"-")+"</td><td>"+(o.arrivalAirport||"-")+"</td><td>"+(o.scheduledDeparture||"-")+"</td><td>"+(o.actualDeparture||"-")+"</td><td>"+(o.scheduledArrival||"-")+"</td><td>"+(o.actualArrival||"-")+"</td><td>"+(o.arrivalGate||"-")+"</td><td>"+(o.arrivalTerminal||"-")+"</td><td class=\"status-"+getStatusClass(o.status)+"\">"+(o.status||"-")+"</td></tr>";
    }).join("")+"</tbody>";
    t.appendChild(n);
  }
  
  async function fetchFlightHistory(e,t){
    const n=await fetch(API_BASE_URL+"/flight/"+e+"/history?days="+t);
    if(!n.ok){
      const errText=await n.text();
      throw new Error("Fel vid hamtning av data: "+n.status+" - "+errText);
    }
    return await n.json();
  }
  
  document.addEventListener("DOMContentLoaded",function(){
    const e=document.getElementById("searchForm");
    const t=document.getElementById("results");
    const n=document.getElementById("loading");
    const o=document.getElementById("error");
    const r=document.getElementById("tableContainer");
    const i=document.getElementById("flightTitle");
    
    e.addEventListener("submit",async function(s){
      s.preventDefault();
      s.stopPropagation();
      
      const l=document.getElementById("flightNumber").value.trim().toUpperCase();
      const a=document.getElementById("days").value||"7";
      
      if(!l){
        showError("Ange ett flight-nummer");
        return;
      }
      
      t.style.display="block";
      n.style.display="block";
      o.style.display="none";
      r.innerHTML="";
      i.textContent="Flight "+l+" - Historik";
      
      try{
        const d=await fetchFlightHistory(l,a);
        n.style.display="none";
        displayResults(d);
      }catch(d){
        n.style.display="none";
        showError(d.message);
      }
    });
  });
})();
    </script>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-RapidAPI-Key, X-RapidAPI-Host',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API endpoint: Health check
    if (url.pathname === '/api/health') {
      const apiKeyValid = env.AERODATABOX_API_KEY && validateApiKey(env.AERODATABOX_API_KEY);
      
      return new Response(
        JSON.stringify({ 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          apiConfigured: !!env.AERODATABOX_API_KEY,
          apiKeyValid: apiKeyValid,
          apiKeyLength: env.AERODATABOX_API_KEY ? env.AERODATABOX_API_KEY.length : 0,
          hint: apiKeyValid ? 'API-nyckel ser giltig ut' : 'API-nyckel saknas eller ar ogiltig (maste vara ≥32 tecken)'
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          } 
        }
      );
    }

    // API endpoint: Flight history
    const flightMatch = url.pathname.match(/^\/api\/flight\/([A-Za-z0-9]+)\/history$/);
    if (flightMatch) {
      const flightNumber = flightMatch[1].toUpperCase();
      const daysBack = url.searchParams.get('days') || '7';

      // Validera API-nyckel
      if (!env.AERODATABOX_API_KEY) {
        return new Response(
          JSON.stringify({ 
            error: 'API-nyckel inte konfigurerad',
            hint: 'Satt AERODATABOX_API_KEY secret med: wrangler secret put AERODATABOX_API_KEY'
          }),
          { 
            status: 500,
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            } 
          }
        );
      }

      if (!validateApiKey(env.AERODATABOX_API_KEY)) {
        return new Response(
          JSON.stringify({ 
            error: 'Ogiltig API-nyckel',
            hint: 'API-nyckeln maste vara minst 32 tecken lang. Kontrollera att du kopierat hela nyckeln fran RapidAPI.',
            keyLength: env.AERODATABOX_API_KEY.length,
            requiredLength: 32
          }),
          { 
            status: 500,
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            } 
          }
        );
      }

      try {
        // Calculate date range (max 7 days)
        const { startDate, endDate } = getDateRange(parseInt(daysBack));
        
        // Correct AeroDataBox API endpoint
        const apiUrl = `https://${env.AERODATABOX_HOST}/flights/number/${flightNumber}/${startDate}/${endDate}?dateLocalRole=Both`;
        
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
            JSON.stringify({ 
              error: `Fel fran AeroDataBox API: ${response.status}`,
              details: errorData,
              hint: `Endpoint: ${apiUrl}`
            }),
            { 
              status: response.status,
              headers: { 
                ...corsHeaders, 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
              } 
            }
          );
        }

        const data = await response.json();
        console.log('Response:', data);
        return new Response(
          JSON.stringify(data),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Cache-Control': 'max-age=60, stale-while-revalidate=300'
            } 
          }
        );

      } catch (error) {
        console.error('Error fetching flight data:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Internt serverfel',
            message: error.message 
          }),
          { 
            status: 500,
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            } 
          }
        );
      }
    }

    // Serve embedded HTML for root and unknown paths
    return new Response(INDEX_HTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        ...corsHeaders,
        'Cache-Control': 'public, max-age=0, must-revalidate'
      }
    });
  }
};
