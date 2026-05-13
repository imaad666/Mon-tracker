const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const CMC_API_KEY = '12426ee8471941898435fd3d7ffc11b9';
const PORT = 3000;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Serve HTML files
  if (req.url === '/' || req.url === '/index.html') {
    fs.readFile('index.html', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading index.html');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  if (req.url === '/test-chart.html') {
    fs.readFile('test-chart.html', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading test-chart.html');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  // Proxy CoinMarketCap API
  if (req.url === '/api/cmc') {
    const options = {
      hostname: 'pro-api.coinmarketcap.com',
      path: '/v1/cryptocurrency/quotes/latest?symbol=MON&convert=USD',
      method: 'GET',
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
        'Accept': 'application/json'
      }
    };

    const apiReq = https.request(options, (apiRes) => {
      let data = '';
      
      apiRes.on('data', (chunk) => {
        data += chunk;
      });
      
      apiRes.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
      });
    });

    apiReq.on('error', (e) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    });

    apiReq.end();
    return;
  }

  // 404
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`\n🚀 Monad Tracker Server Running!`);
  console.log(`\n📊 Open your browser to: http://localhost:${PORT}`);
  console.log(`\n✨ Dashboard is ready!\n`);
});
