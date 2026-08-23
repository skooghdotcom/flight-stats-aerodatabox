// Flight Stats - Cloudflare Worker
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check endpoint
    if (url.pathname === '/api/health') {
      return new Response(
        JSON.stringify({ 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          apiConfigured: !!env.AERODATABOX_API_KEY 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Flight history endpoint
    const flightMatch = url.pathname.match(/^\/api\/flight\/([A-Za-z0-9]+)\/history$/);
    if (flightMatch) {
      const flightNumber = flightMatch[1].toUpperCase();
      const limit = url.searchParams.get('limit') || '10';

      if (!env.AERODATABOX_API_KEY) {
        return new Response(
          JSON.stringify({ 
            error: 'API-nyckel inte konfigurerad. SÃ¤tt AERODATABOX_API_KEY secret.' 
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      try {
        const apiUrl = `https://${env.AERODATABOX_HOST}/flights/number/${flightNumber}/history?limit=${limit}`;
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': env.AERODATABOX_API_KEY,
            'X-RapidAPI-Host': env.AERODATABOX_HOST
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          return new Response(
            JSON.stringify({ 
              error: `Fel frÃ¥n AeroDataBox API: ${response.status}`,
              details: errorData 
            }),
            { 
              status: response.status,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const data = await response.json();
        return new Response(
          JSON.stringify(data),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
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
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Serve static files from public directory
    // (Du behÃ¶ver ladda upp statiska filer separat eller anvÃ¤nda Workers Sites)
    // För enkelhet, redirecta till index.html
    if (url.pathname === '/' || url.pathname === '/index.html') {
      // I produktion, serve actual HTML file
      return new Response(
        '<h1>Flight Stats</h1><p>Deployera statiska filer separat eller anvÃ¤nd Workers Sites.</p>',
        { 
          headers: { 'Content-Type': 'text/html' } 
        }
      );
    }

    // 404 for unknown routes
    return new Response('Not Found', { status: 404 });
  }
};
