// GSC API client — zero external deps. Signs a service-account JWT with
// node:crypto, exchanges it for an access token, and calls the Search Console
// + URL Inspection APIs. Used by gsc.mjs (CLI) and gsc-monitor.mjs (automation).
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SCOPE = 'https://www.googleapis.com/auth/webmasters';

export function loadCreds() {
  // Priority: explicit env JSON (GitHub secret) -> file path -> default local path
  if (process.env.GSC_CREDENTIALS_JSON) {
    return JSON.parse(process.env.GSC_CREDENTIALS_JSON);
  }
  const p =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(os.homedir(), '.gsc', 'theasset-gsc.json');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function b64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getAccessToken(creds) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(
    JSON.stringify({
      iss: creds.client_email,
      scope: SCOPE,
      aud: creds.token_uri,
      iat: now,
      exp: now + 3600,
    }),
  );
  const signingInput = `${header}.${claim}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signingInput);
  const signature = signer
    .sign(creds.private_key)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const assertion = `${signingInput}.${signature}`;

  const res = await fetch(creds.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`token error ${res.status}: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

export async function gscClient() {
  const creds = loadCreds();
  const token = await getAccessToken(creds);
  const call = async (method, url, body) => {
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { raw: text };
    }
    if (!res.ok) {
      const err = new Error(
        `GSC ${method} ${url} -> ${res.status}: ${text.slice(0, 400)}`,
      );
      err.status = res.status;
      err.body = json;
      throw err;
    }
    return json;
  };

  const enc = encodeURIComponent;
  return {
    creds,
    // List all properties this service account can access
    listSites: () =>
      call('GET', 'https://www.googleapis.com/webmasters/v3/sites'),
    // Search analytics query
    query: (siteUrl, body) =>
      call(
        'POST',
        `https://www.googleapis.com/webmasters/v3/sites/${enc(
          siteUrl,
        )}/searchAnalytics/query`,
        body,
      ),
    // Sitemaps
    listSitemaps: (siteUrl) =>
      call(
        'GET',
        `https://www.googleapis.com/webmasters/v3/sites/${enc(
          siteUrl,
        )}/sitemaps`,
      ),
    submitSitemap: (siteUrl, feedpath) =>
      call(
        'PUT',
        `https://www.googleapis.com/webmasters/v3/sites/${enc(
          siteUrl,
        )}/sitemaps/${enc(feedpath)}`,
      ),
    // URL Inspection (index status)
    inspect: (siteUrl, inspectionUrl) =>
      call(
        'POST',
        'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
        { inspectionUrl, siteUrl },
      ),
  };
}
