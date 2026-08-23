// Flight Stats - Backend API Server
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const AERODATABOX_API_KEY = process.env.AERODATABOX_API_KEY;
const AERODATABOX_HOST = 'aerodatabox.p.rapidapi.com';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// API endpoint för flight-historik
app.get('/api/flight/:flightNumber/history', async (req, res) => {
    try {
        const { flightNumber } = req.params;
        const { limit = 10 } = req.query;

        if (!AERODATABOX_API_KEY) {
            return res.status(500).json({ 
                error: 'API-nyckel inte konfigurerad. SÃ¤tt AERODATABOX_API_KEY i .env-filen.' 
            });
        }

        // Hämta data från AeroDataBox
        const url = `https://${AERODATABOX_HOST}/flights/number/${flightNumber.toUpperCase()}/history?limit=${limit}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': AERODATABOX_API_KEY,
                'X-RapidAPI-Host': AERODATABOX_HOST
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            if (response.status === 401) {
                return res.status(401).json({ 
                    error: 'Ogiltig API-nyckel',
                    details: errorData 
                });
            } else if (response.status === 429) {
                return res.status(429).json({ 
                    error: 'API-grä´´ns uppnÃ¥dd',
                    details: errorData 
                });
            } else if (response.status === 404) {
                return res.status(404).json({ 
                    error: `Ingen data hittades för flight ${flightNumber}`,
                    details: errorData 
                });
            } else {
                return res.status(response.status).json({ 
                    error: `Fel från AeroDataBox API`,
                    details: errorData 
                });
            }
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Error fetching flight data:', error);
        res.status(500).json({ 
            error: 'Internt serverfel',
            message: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        apiConfigured: !!AERODATABOX_API_KEY 
    });
});

// Serve index.html för alla andra routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Flight Stats server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoint: http://localhost:${PORT}/api/flight/LH2415/history`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
});
