// TradingAI Signals — Local Proxy Server
// Run with:  node server.js
// Then open: http://localhost:3001

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const PORT    = process.env.PORT || 3001;
const API_URL = 'https://tradingai-production-f08f.up.railway.app/v1/signals';
const API_KEY = 'tsk_live_7e3a918f69e59fd255fee1e9d0b0fc45dca335c7';

const server = http.createServer((req, res) => {

  // ── CORS headers on every response ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── Serve the dashboard HTML ──
  if (req.url === '/' || req.url === '/index.html') {
    const file = path.join(__dirname, 'trading-signals.html');
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end('trading-signals.html not found'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  // ── Proxy /signals → real API ──
  if (req.url === '/signals') {
    const apiReq = https.request(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json',
        'User-Agent': 'TradingAI-Dashboard/1.0'
      }
    }, (apiRes) => {
      let body = '';
      apiRes.on('data', chunk => body += chunk);
      apiRes.on('end', () => {
        res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json' });
        res.end(body);
      });
    });

    apiReq.on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });

    apiReq.end();
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ✅  TradingAI Signals server running!');
  console.log('');
  console.log(`  👉  Open this in your browser:`);
  console.log(`      http://localhost:${PORT}`);
  console.log('');
  console.log('  Press Ctrl+C to stop.');
  console.log('');
});
