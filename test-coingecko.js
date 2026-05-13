// Test CoinGecko API for Monad chart data
const https = require('https');

function makeRequest(path, name) {
  return new Promise((resolve) => {
    console.log(`\n=== ${name} ===\n`);
    
    const options = {
      hostname: 'api.coingecko.com',
      path: path,
      method: 'GET',
      headers: {
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
            // Show first few data points
            if (json.prices) {
              console.log(`Got ${json.prices.length} price points`);
              console.log('First 3 points:', json.prices.slice(0, 3));
              console.log('Last 3 points:', json.prices.slice(-3));
            } else {
              console.log(JSON.stringify(json, null, 2));
            }
          } else {
            console.log('❌ Error:', json.error || 'Unknown error');
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

async function testCoinGecko() {
  console.log('Testing CoinGecko API for Monad...\n');
  
  // Test 1: Search for Monad
  await makeRequest(
    '/api/v3/search?query=monad',
    'Search for Monad'
  );
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Test 2: Get coin data by ID (try 'monad')
  await makeRequest(
    '/api/v3/coins/monad',
    'Get Monad coin data'
  );
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Test 3: Market chart data (7 days)
  await makeRequest(
    '/api/v3/coins/monad/market_chart?vs_currency=usd&days=7',
    'Market Chart (7 days)'
  );
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Test 4: Market chart data (1 day)
  await makeRequest(
    '/api/v3/coins/monad/market_chart?vs_currency=usd&days=1',
    'Market Chart (24 hours)'
  );
  
  console.log('\n=== Test Complete ===\n');
}

testCoinGecko();

// Made with Bob
