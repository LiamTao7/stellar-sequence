/**
 * Netlify Serverless Function — Content API
 * GET  /api/content  → 读取内容（公开）
 * PUT  /api/content  → 更新内容（需要管理员密码）
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Admin password hash (SHA-256 of the real password)
const ADMIN_PASS_HASH = '5b2e4d10b05dddea3e21049b6d58d55fb2879bdbd67b2b7459ee29c726a7b523';

function checkAuth(event) {
  const token = (event.headers['x-admin-token'] || event.headers['authorization'] || '').replace('Bearer ', '');
  if (!token) return false;
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return hash === ADMIN_PASS_HASH;
}

// Try multiple paths: production (included in function bundle) vs local dev
const POSSIBLE_PATHS = [
  path.join(__dirname, '..', '..', 'server', 'data', 'content.json'),
  path.join(__dirname, 'data', 'content.json'),
  path.join('/var/task', 'server', 'data', 'content.json')
];

function findContentFile() {
  for (const p of POSSIBLE_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  return POSSIBLE_PATHS[0];
}

const CONTENT_FILE = findContentFile();

function readContent() {
  try {
    const raw = fs.readFileSync(CONTENT_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Content read error:', e.message, 'tried:', CONTENT_FILE);
    return {};
  }
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token, Authorization',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // GET — public
  if (event.httpMethod === 'GET') {
    const content = readContent();
    content._deploy = {
      platform: 'Netlify',
      updated: new Date().toISOString(),
      note: '通过 GitHub 修改 server/data/content.json 更新内容，或使用 /admin 管理后台'
    };
    return { statusCode: 200, headers, body: JSON.stringify(content) };
  }

  // PUT — requires auth
  if (event.httpMethod === 'PUT') {
    if (!checkAuth(event)) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: '未授权，请提供管理员令牌' }) };
    }
    const body = JSON.parse(event.body || '{}');
    const current = readContent();
    const merged = deepMerge(current, body);
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(merged, null, 2), 'utf-8');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: merged,
        note: '内容已更新。如需永久保存，请编辑 GitHub 仓库中的 server/data/content.json。'
      })
    };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
};
