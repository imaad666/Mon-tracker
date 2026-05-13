// Test other crypto API providers for Monad
const https = require('https');

function makeRequest(hostname, path, name, headers = {}) {
  return new Promise((resolve) => {
    console.log(`\n=== ${name} ===`);
    console.log(`URL: https://${hostname}${path}\n`);
    
    const options = {
      hostname: hostname,
      path: path,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
        ...headers
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
            console.log(JSON.stringify(json, null, 2).substring(0, 500) + '...');
          } else {
            console.log('❌ Error:', json.error || json.message || 'Unknown error');
          }
        } catch (e) {
          console.log('Status:', res.statusCode);
          console.log('Response:', data.substring(0, 200));
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error('❌ Request error:', e.message);
      resolve();
    });

    req.setTimeout(5000, () => {
      console.log('❌ Timeout');
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function testAllProviders() {
  console.log('Testing Alternative Crypto API Providers for Monad...\n');
  
  // 1. CryptoCompare
  await makeRequest(
    'min-api.cryptocompare.com',
    '/data/price?fsym=MON&tsyms=USD',
    '1. CryptoCompare - Current Price'
  );
  await new Promise(r => setTimeout(r, 1500));
  
  await makeRequest(
    'min-api.cryptocompare.com',
    '/data/v2/histoday?fsym=MON&tsym=USD&limit=30',
    '2. CryptoCompare - Historical Data'
  );
  await new Promise(r => setTimeout(r, 1500));
  
  // 2. Coinpaprika
  await makeRequest(
    'api.coinpaprika.com',
    '/v1/coins/mon-monad',
    '3. Coinpaprika - Coin Info'
  );
  await new Promise(r => setTimeout(r, 1500));
  
  await makeRequest(
    'api.coinpaprika.com',
    '/v1/tickers/mon-monad',
    '4. Coinpaprika - Price Data'
  );
  await new Promise(r => setTimeout(r, 1500));
  
  await makeRequest(
    'api.coinpaprika.com',
    '/v1/coins/mon-monad/ohlcv/latest',
    '5. Coinpaprika - OHLCV Data'
  );
  await new Promise(r => setTimeout(r, 1500));
  
  // 3. Messari
  await makeRequest(
    'data.messari.io',
    '/api/v1/assets/monad/metrics',
    '6. Messari - Metrics'
  );
  await new Promise(r => setTimeout(r, 1500));
  
  // 4. CoinCap
  await makeRequest(
    'api.coincap.io',
    '/v2/assets/monad',
    '7. CoinCap - Asset Data'
  );
  await new Promise(r => setTimeout(r, 1500));
  
  // 5. Nomics
  await makeRequest(
    'api.nomics.com',
    '/v1/currencies/ticker?key=demo&ids=MON',
    '8. Nomics - Ticker'
  );
  await new Promise(r => setTimeout(r, 1500));
  
  // 6. CoinLore
  await makeRequest(
    'api.coinlore.net',
    '/api/ticker/?id=90',
    '9. CoinLore - Ticker'
  );
  
  console.log('\n=== Test Complete ===\n');
  console.log('Summary: Check which APIs returned 200 status ✅');
}

testAllProviders();

// Made with Bob
