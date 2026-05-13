// Test more CoinMarketCap API endpoints for Monad
const https = require('https');

const API_KEY = '12426ee8471941898435fd3d7ffc11b9';
const MONAD_ID = 30495;

function makeRequest(path, name) {
  return new Promise((resolve) => {
    console.log(`\n=== ${name} ===\n`);
    
    const options = {
      hostname: 'pro-api.coinmarketcap.com',
      path: path,
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
          if (res.statusCode === 200) {
            console.log('✅ Success!');
            console.log(JSON.stringify(json, null, 2));
          } else {
            console.log('❌ Error:', json.status?.error_message || 'Unknown error');
          }
        } catch (e) {
          console.error('Parse error:', e.message);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error('Request error:', e.message);
      resolve();
    });

    req.end();
  });
}

async function testAllEndpoints() {
  console.log('Testing CoinMarketCap API Endpoints for Monad...\n');
  
  // Test 1: OHLCV Historical (Price history for charts)
  await makeRequest(
    `/v2/cryptocurrency/ohlcv/historical?id=${MONAD_ID}&time_period=daily&count=30`,
    'Historical OHLCV Data (30 days)'
  );
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Test 2: Market Pairs (Trading pairs info)
  await makeRequest(
    `/v2/cryptocurrency/market-pairs/latest?id=${MONAD_ID}&limit=10`,
    'Market Pairs (Top 10 exchanges)'
  );
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Test 3: Info/Metadata (Description, logo, links)
  await makeRequest(
    `/v2/cryptocurrency/info?id=${MONAD_ID}`,
    'Cryptocurrency Info (Metadata)'
  );
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Test 4: Price Performance Stats
  await makeRequest(
    `/v2/cryptocurrency/price-performance-stats/latest?id=${MONAD_ID}`,
    'Price Performance Stats'
  );
  
  console.log('\n=== Test Complete ===\n');
}

testAllEndpoints();

// Made with Bob
