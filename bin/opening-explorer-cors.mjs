#!/usr/bin/env node

// CORS shim in front of a local lila-openingexplorer. Started for you by
// `bin/opening-explorer serve`; you should not need to run it by hand.
//
// The analysis board fetches the explorer straight from the browser with
// `credentials: 'include'` (ui/analyse/src/explorer/explorerXhr.ts). Browsers
// reject a wildcard `Access-Control-Allow-Origin` on a credentialed request,
// and a wildcard is all the explorer's own `--cors` flag can emit. lichess.org
// echoes the real origin from nginx instead; this does the same locally.
//
// It stays a Node script rather than folding into the Python entry point
// because `/player` streams ndjson while it indexes, and piping a chunked
// response through untouched is one line here and bespoke framing code there.
//
// Usage: opening-explorer-cors.mjs --listen 9002 --upstream 9012 --origin http://localhost:9663

import http from 'node:http';

const flag = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};

const listen = Number(flag('listen', 9002));
const upstream = Number(flag('upstream', 9012));
const origins = flag('origin', 'http://localhost:9663')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const corsHeaders = origin => ({
  'access-control-allow-origin': origin,
  'access-control-allow-credentials': 'true',
  'access-control-allow-methods': 'GET,OPTIONS',
  'access-control-allow-headers': 'Accept,Authorization,Cache-Control,If-Modified-Since,X-Requested-With',
  // Responses differ per origin, so they must not be cached across origins.
  vary: 'Origin',
});

http
  .createServer((req, res) => {
    const requested = req.headers.origin;
    const allowed = requested && origins.includes(requested) ? requested : origins[0];

    if (req.method === 'OPTIONS') {
      res.writeHead(204, corsHeaders(allowed));
      return res.end();
    }

    const proxied = http.request(
      {
        host: '127.0.0.1',
        port: upstream,
        path: req.url,
        method: req.method,
        headers: { ...req.headers, host: `127.0.0.1:${upstream}` },
      },
      up => {
        res.writeHead(up.statusCode ?? 502, { ...up.headers, ...corsHeaders(allowed) });
        up.pipe(res);
      },
    );

    proxied.on('error', err => {
      res.writeHead(502, { 'content-type': 'text/plain', ...corsHeaders(allowed) });
      res.end(`opening explorer unreachable on 127.0.0.1:${upstream}\n${err.message}\n`);
    });

    req.pipe(proxied);
  })
  .listen(listen, '127.0.0.1', () => {
    console.log(`[cors] 127.0.0.1:${listen} -> 127.0.0.1:${upstream} for ${origins.join(', ')}`);
  });
