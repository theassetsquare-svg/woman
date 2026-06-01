// One-time helper: stores the GSC service-account key as the GitHub Actions
// secret GSC_CREDENTIALS_JSON so the daily monitor workflow can auth.
//
// Needs a GitHub token with `repo` scope (a fine-grained PAT with
// "Secrets: read/write" on this repo, or a classic PAT with `repo`).
//
//   GH_TOKEN=ghp_xxx GSC_KEY=/home/user/.gsc/theasset-gsc.json \
//     node scripts/set-gsc-secret.mjs
import sodium from 'libsodium-wrappers';
import fs from 'node:fs';

const TOKEN = process.env.GH_TOKEN;
const REPO = process.env.REPO || 'theassetsquare-svg/woman';
const KEY = process.env.GSC_KEY || '/home/user/.gsc/theasset-gsc.json';
if (!TOKEN) {
  console.error('GH_TOKEN 환경변수가 필요합니다 (repo 권한 PAT).');
  process.exit(1);
}

const h = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/vnd.github+json',
  'User-Agent': 'gsc-setup',
  'X-GitHub-Api-Version': '2022-11-28',
};

const secret = fs.readFileSync(KEY, 'utf8');
const pk = await (
  await fetch(`https://api.github.com/repos/${REPO}/actions/secrets/public-key`, { headers: h })
).json();
if (!pk.key) {
  console.error('public-key 조회 실패:', JSON.stringify(pk));
  process.exit(1);
}
await sodium.ready;
const bin = sodium.from_base64(pk.key, sodium.base64_variants.ORIGINAL);
const enc = sodium.crypto_box_seal(sodium.from_string(secret), bin);
const encrypted_value = sodium.to_base64(enc, sodium.base64_variants.ORIGINAL);
const put = await fetch(
  `https://api.github.com/repos/${REPO}/actions/secrets/GSC_CREDENTIALS_JSON`,
  {
    method: 'PUT',
    headers: { ...h, 'Content-Type': 'application/json' },
    body: JSON.stringify({ encrypted_value, key_id: pk.key_id }),
  },
);
console.log(
  'GSC_CREDENTIALS_JSON →',
  put.status === 201 ? '생성됨 ✅' : put.status === 204 ? '갱신됨 ✅' : `실패(${put.status}) ${await put.text()}`,
);
