#!/usr/bin/env node
// Probe every public Monad data source we care about and print what we get.
// Goal: figure out which metrics are reliably available before designing the UI.

const NETWORK = (process.env.NETWORK || 'mainnet').toLowerCase();

const RPC_URLS = {
  mainnet: [
    'https://rpc.monad.xyz',
    'https://rpc1.monad.xyz',
    'https://rpc2.monad.xyz',
    'https://rpc3.monad.xyz',
    'https://rpc-mainnet.monadinfra.com',
  ],
  testnet: [
    'https://testnet-rpc.monad.xyz',
    'https://rpc.ankr.com/monad_testnet',
    'https://rpc-testnet.monadinfra.com',
  ],
};

const GMONADS_BASE = 'https://www.gmonads.com/api/v1/public';
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// ---------- pretty printing ----------
const C = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  purple: (s) => `\x1b[35m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
};

const banner = (label) => {
  console.log('\n' + C.purple('━'.repeat(72)));
  console.log(C.bold(C.purple(`  ${label}`)));
  console.log(C.purple('━'.repeat(72)));
};

const ok = (label, value) =>
  console.log(`  ${C.green('✓')} ${C.bold(label.padEnd(28))} ${value}`);
const fail = (label, err) =>
  console.log(`  ${C.red('✗')} ${C.bold(label.padEnd(28))} ${C.red(err)}`);

// ---------- helpers ----------
const fetchJson = async (url, opts = {}, timeoutMs = 8000) => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
};

const rpcCall = async (url, method, params = []) => {
  const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method, params });
  const data = await fetchJson(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  });
  if (data.error) throw new Error(data.error.message || 'RPC error');
  return data.result;
};

const hexToInt = (h) => (h == null ? null : parseInt(h, 16));
const fmtNum = (n, digits = 0) =>
  n == null
    ? '—'
    : Number(n).toLocaleString('en-US', { maximumFractionDigits: digits });
const fmtUsd = (n) =>
  n == null
    ? '—'
    : `$${Number(n).toLocaleString('en-US', { maximumFractionDigits: 4 })}`;
const gwei = (weiHex) => {
  const n = hexToInt(weiHex);
  return n == null ? null : n / 1e9;
};

// ---------- 1. RPC probes ----------
async function probeRpc() {
  banner(`RPC  ·  ${NETWORK}`);
  const urls = RPC_URLS[NETWORK];

  // Pick the first RPC that responds to chainId.
  let live = null;
  for (const url of urls) {
    try {
      const cid = await rpcCall(url, 'eth_chainId');
      live = url;
      ok(`endpoint`, `${url}  ${C.dim(`(chainId=${hexToInt(cid)})`)}`);
      break;
    } catch (e) {
      fail(`endpoint ${url}`, e.message);
    }
  }
  if (!live) return null;

  // A sweep of endpoints we'd want for a tracker.
  // net_peerCount is intentionally omitted — public RPCs don't expose it.
  const probes = [
    ['eth_blockNumber', [], (r) => fmtNum(hexToInt(r))],
    ['eth_gasPrice', [], (r) => `${gwei(r)?.toFixed(4)} gwei`],
    ['eth_chainId', [], (r) => hexToInt(r)],
    ['net_version', [], (r) => r],
    ['eth_syncing', [], (r) => JSON.stringify(r)],
    ['eth_maxPriorityFeePerGas', [], (r) => `${gwei(r)?.toFixed(4)} gwei`],
  ];

  for (const [method, params, fmt] of probes) {
    try {
      const r = await rpcCall(live, method, params);
      ok(method, fmt(r));
    } catch (e) {
      fail(method, e.message);
    }
  }

  // Latest block — counts, gas usage, base fee, txs.
  try {
    const block = await rpcCall(live, 'eth_getBlockByNumber', ['latest', false]);
    if (block) {
      const txCount = block.transactions?.length ?? 0;
      const gasUsed = hexToInt(block.gasUsed);
      const gasLimit = hexToInt(block.gasLimit);
      const baseFee = block.baseFeePerGas ? gwei(block.baseFeePerGas) : null;
      const ts = hexToInt(block.timestamp);
      const ageS = Math.max(0, Math.floor(Date.now() / 1000) - ts);
      ok('latest block #', fmtNum(hexToInt(block.number)));
      ok('  txs in block', fmtNum(txCount));
      ok('  gas used / limit', `${fmtNum(gasUsed)} / ${fmtNum(gasLimit)}  ${C.dim(`(${((gasUsed / gasLimit) * 100).toFixed(1)}%)`)}`);
      ok('  base fee', baseFee != null ? `${baseFee.toFixed(4)} gwei` : '—');
      ok('  age', `${ageS}s ago`);
    }
  } catch (e) {
    fail('eth_getBlockByNumber(latest)', e.message);
  }

  // Average block time across the last N blocks (simple sample).
  try {
    const head = hexToInt(await rpcCall(live, 'eth_blockNumber'));
    const N = 20;
    const samples = await Promise.all(
      Array.from({ length: N }, (_, i) =>
        rpcCall(live, 'eth_getBlockByNumber', [
          '0x' + (head - i).toString(16),
          false,
        ]).then((b) => ({
          ts: hexToInt(b.timestamp),
          txs: b.transactions?.length ?? 0,
          gasUsed: hexToInt(b.gasUsed),
        })),
      ),
    );
    samples.sort((a, b) => a.ts - b.ts);
    const deltas = [];
    for (let i = 1; i < samples.length; i++)
      deltas.push(samples[i].ts - samples[i - 1].ts);
    const avgDelta =
      deltas.reduce((a, b) => a + b, 0) / Math.max(1, deltas.length);
    const totalTxs = samples.reduce((a, s) => a + s.txs, 0);
    const totalSpan = samples[samples.length - 1].ts - samples[0].ts || 1;
    const tps = totalTxs / totalSpan;
    ok(`avg block time (${N} blks)`, `${avgDelta.toFixed(2)}s`);
    ok(`approx TPS (${N} blks)`, tps.toFixed(2));
    ok(`avg txs / block`, (totalTxs / N).toFixed(1));
  } catch (e) {
    fail('block-time sample', e.message);
  }

  // Fee history — useful for gas charts.
  try {
    const fh = await rpcCall(live, 'eth_feeHistory', ['0xa', 'latest', [25, 50, 75]]);
    const last = fh.baseFeePerGas?.[fh.baseFeePerGas.length - 1];
    ok('eth_feeHistory(10 blks)', `baseFee[last]=${gwei(last)?.toFixed(4)} gwei, rewards p25/50/75 ✓`);
  } catch (e) {
    fail('eth_feeHistory', e.message);
  }

  return live;
}

// ---------- 2. gmonads probes ----------
async function probeGmonads() {
  banner(`gmonads.com  ·  ${NETWORK}`);
  // /blocks/1m-60m is in their docs but returns 404 — skipped.
  const endpoints = [
    ['blocks/1m', `block stats (1-min resolution)`],
    ['blocks/aggregated-hourly', `block stats (hourly)`],
    ['validators/epoch', `validator + epoch info`],
    ['validators/geolocations', `validator geolocation`],
    ['validators/metadata', `validator metadata`],
  ];

  const summaries = {};
  for (const [path, label] of endpoints) {
    const url = `${GMONADS_BASE}/${path}?network=${NETWORK}`;
    try {
      const json = await fetchJson(url);
      const d = json.data;
      const count = Array.isArray(d) ? d.length : d ? Object.keys(d).length : 0;
      ok(label, `${count} ${Array.isArray(d) ? 'rows' : 'fields'}  ${C.dim(`/${path}`)}`);
      summaries[path] = d;
    } catch (e) {
      fail(label, e.message);
    }
  }

  // Show a quick preview of the most useful payloads.
  if (summaries['blocks/1m']?.length) {
    const last = summaries['blocks/1m'].at(-1);
    console.log(C.dim('\n    blocks/1m sample (latest minute):'));
    console.log(C.dim('    ' + JSON.stringify(last)));
  }
  if (summaries['validators/epoch']) {
    console.log(C.dim('\n    validators/epoch keys:'));
    const v = summaries['validators/epoch'];
    const keys = Array.isArray(v) ? Object.keys(v[0] || {}) : Object.keys(v);
    console.log(C.dim('    ' + keys.join(', ')));
  }
  if (Array.isArray(summaries['validators/geolocations'])) {
    const countries = new Set(
      summaries['validators/geolocations'].map(
        (v) => v.country || v.countryCode || v.location || '?',
      ),
    );
    console.log(C.dim(`\n    validator countries: ${[...countries].join(', ')}`));
  }
}

// ---------- 3. CoinGecko probes ----------
async function probeCoinGecko() {
  banner('CoinGecko  ·  MON');

  // simple/price — most important for the headline ticker.
  try {
    const url =
      `${COINGECKO_BASE}/simple/price` +
      `?ids=monad&vs_currencies=usd` +
      `&include_market_cap=true&include_24hr_vol=true` +
      `&include_24hr_change=true&include_last_updated_at=true`;
    const j = await fetchJson(url);
    const m = j.monad;
    if (!m) {
      fail('simple/price', 'id "monad" returned no data');
    } else {
      ok('price (USD)', fmtUsd(m.usd));
      ok('market cap', fmtUsd(m.usd_market_cap));
      ok('24h volume', fmtUsd(m.usd_24h_vol));
      ok('24h change', m.usd_24h_change != null ? `${m.usd_24h_change.toFixed(3)}%` : '—');
      ok('last updated', new Date((m.last_updated_at ?? 0) * 1000).toISOString());
    }
  } catch (e) {
    fail('simple/price', e.message);
  }

  // /coins/monad — supply, ATH, descriptions, links.
  try {
    const url =
      `${COINGECKO_BASE}/coins/monad` +
      `?localization=false&tickers=false&community_data=false&developer_data=false`;
    const j = await fetchJson(url);
    const md = j.market_data || {};
    ok('rank', `#${j.market_cap_rank ?? '—'}`);
    ok('circulating supply', fmtNum(md.circulating_supply));
    ok('total supply', fmtNum(md.total_supply));
    ok('max supply', md.max_supply == null ? '—' : fmtNum(md.max_supply));
    ok('ATH', `${fmtUsd(md.ath?.usd)}  ${C.dim(`(${md.ath_date?.usd?.slice(0, 10)})`)}`);
    ok('ATL', `${fmtUsd(md.atl?.usd)}  ${C.dim(`(${md.atl_date?.usd?.slice(0, 10)})`)}`);
    ok('price change 7d', md.price_change_percentage_7d != null ? `${md.price_change_percentage_7d.toFixed(2)}%` : '—');
    ok('price change 30d', md.price_change_percentage_30d != null ? `${md.price_change_percentage_30d.toFixed(2)}%` : '—');
    ok('homepage', j.links?.homepage?.[0] ?? '—');
  } catch (e) {
    fail('/coins/monad', e.message);
  }

  // Historical chart — what we'd plot.
  try {
    const j = await fetchJson(
      `${COINGECKO_BASE}/coins/monad/market_chart?vs_currency=usd&days=7`,
    );
    ok('market_chart 7d', `prices=${j.prices?.length}, vols=${j.total_volumes?.length}`);
  } catch (e) {
    fail('market_chart', e.message);
  }
}

// ---------- main ----------
(async () => {
  const t0 = Date.now();
  console.log(
    C.bold(C.purple('\n  ◆ Monad Tracker  ')) +
      C.dim(`probe · network=${NETWORK} · ${new Date().toISOString()}`),
  );

  await probeRpc();
  await probeGmonads();
  await probeCoinGecko();

  banner('done');
  console.log(C.dim(`  finished in ${((Date.now() - t0) / 1000).toFixed(2)}s\n`));
})().catch((e) => {
  console.error(C.red('\n  fatal: '), e);
  process.exit(1);
});
