// Test script for CoinMarketCap API
const https = require('https');

const API_KEY = '12426ee8471941898435fd3d7ffc11b9';

// Test 1: Get Monad price by symbol
function testMonadBySymbol() {
  console.log('\n=== Testing Monad by Symbol (MON) ===\n');
  
  const options = {
    hostname: 'pro-api.coinmarketcap.com',
    path: '/v1/cryptocurrency/quotes/latest?symbol=MON&convert=USD',
    method: 'GET',
    headers: {
      'X-CMC_PRO_API_KEY': API_KEY,
      'Accept': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('Status:', res.statusCode);
        console.log('Response:', JSON.stringify(json, null, 2));
      } catch (e) {
        console.error('Parse error:', e.message);
        console.log('Raw data:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e.message);
  });

  req.end();
}

// Test 2: Search for Monad in cryptocurrency map
function testMonadSearch() {
  console.log('\n=== Searching for Monad in CMC Map ===\n');
  
  const options = {
    hostname: 'pro-api.coinmarketcap.com',
    path: '/v1/cryptocurrency/map?symbol=MON',
    method: 'GET',
    headers: {
      'X-CMC_PRO_API_KEY': API_KEY,
      'Accept': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('Status:', res.statusCode);
        console.log('Response:', JSON.stringify(json, null, 2));
      } catch (e) {
        console.error('Parse error:', e.message);
        console.log('Raw data:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e.message);
  });

  req.end();
}

// Run tests
console.log('Testing CoinMarketCap API for Monad...');
console.log('API Key:', API_KEY.substring(0, 8) + '...');

testMonadBySymbol();

setTimeout(() => {
  testMonadSearch();
}, 2000);

// Made with Bob
