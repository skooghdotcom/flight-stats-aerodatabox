// Flight Stats - Cloudflare Worker with Workers Sites
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
      return new Response(
        JSON.stringify({ 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          apiConfigured: !!env.AERODATABOX_API_KEY 
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
      const limit = url.searchParams.get('limit') || '10';

      if (!env.AERODATABOX_API_KEY) {
        return new Response(
          JSON.stringify({ 
            error: 'API-nyckel inte konfigurerad. SÃ¤tt AERODATABOX_API_KEY secret.' 
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
              headers: { 
                ...corsHeaders, 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
              } 
            }
          );
        }

        const data = await response.json();
        return new Response(
          JSON.stringify(data),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Cache-Control': 'max-age=60, stale-while-revalidate=300' // 1 min cache, 5 min stale
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

    // Serve static files from Workers Sites
    if (env.__STATIC_CONTENT) {
      try {
        const assetName = url.pathname === '/' ? 'index.html' : url.pathname.replace(/^\//, '');
        const asset = await env.__STATIC_CONTENT.get(assetName);
        
        if (asset) {
          const contentType = getContentType(assetName);
          const cacheHeaders = {
            'Content-Type': contentType,
            ...corsHeaders
          };
          
          // Cache strategy: HTML = no cache, Assets = 1 year
          if (assetName.endsWith('.html')) {
            cacheHeaders['Cache-Control'] = 'public, max-age=0, must-revalidate';
          } else {
            cacheHeaders['Cache-Control'] = 'public, max-age=31536000, immutable'; // 1 year
          }
          
          return new Response(asset, {
            headers: cacheHeaders
          });
        }
      } catch (e) {
        console.error('Error serving static file:', e);
      }
    }

    // Fallback: return 404
    return new Response('Not Found', { 
      status: 404,
      headers: corsHeaders
    });
  }
};

// Helper function to determine content type
function getContentType(path) {
  const ext = path.split('.').pop().toLowerCase();
  const contentTypes = {
    'html': 'text/html; charset=utf-8',
    'css': 'text/css; charset=utf-8',
    'js': 'application/javascript; charset=utf-8',
    'json': 'application/json; charset=utf-8',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'txt': 'text/plain',
    'xml': 'application/xml',
    'pdf': 'application/pdf'
  };
  return contentTypes[ext] || 'text/plain';
}
