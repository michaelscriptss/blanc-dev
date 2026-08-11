const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

// Allow all CORS requests (so your browser can talk to this server)
app.use(cors());
app.use(express.json());

// Serve your HTML frontend
app.use(express.static('public'));

// Config
const API_KEY = '1901d89dd6b309b74f66b3e45f0f8b65836b93bba4b19eda4326d8a9e1bc7ce3';
const API_URL = 'https://api.oxfd.re/v1/server/players';
let cachedPlayers = [];
let lastFetch = 0;

// Endpoint that the frontend will call
app.get('/api/players', async (req, res) => {
    const now = Date.now();
    
    // Only fetch from Oxford API every 2 seconds to avoid bans
    if (now - lastFetch > 2000) {
        try {
            const response = await fetch(API_URL, {
                headers: { 'Authorization': `Bearer ${API_KEY}` }
            });
            
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            
            const data = await response.json();
            cachedPlayers = data;
            lastFetch = now;
            console.log(`[${new Date().toLocaleTimeString()}] Fetched ${data.length} players`);
        } catch (error) {
            console.error("API Fetch failed:", error.message);
            // Return old cache if API fails
        }
    }
    
    res.json(cachedPlayers);
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
