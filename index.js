const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT | 3000;

app.use(cors());
app.use(express.json());

// Serve the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));
// ✅ NEW: Serve the 'images' folder
app.use('/images', express.static(path.join(__dirname, 'images')));

const API_KEY = '1901d89dd6b309b74f66b3e45f0f8b65836b93bba4b19eda4326d8a9e1bc7ce3';
const API_URL = 'https://api.oxfd.re/v1/server/players';
let cachedPlayers = [];
let lastFetch = 0;

app.get('/api/players', async (req, res) => {
    const now = Date.now();
    if (now - lastFetch > 2000) {
        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: { 'server-key': `${API_KEY}` }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            cachedPlayers = data;
            lastFetch = now;
            console.log(`[${new Date().toLocaleTimeString()}] Fetched ${data.length} players`);
        } catch (error) {
            console.error("API Fetch failed:", error.message);
        }
    }
    res.json(cachedPlayers);
});

// Fallback route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
