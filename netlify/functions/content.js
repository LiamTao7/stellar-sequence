/**
 * Netlify Serverless Function — Content API
 * GET  /api/content  → 读取内容
 * PUT  /api/content  → 更新内容（部署期间有效）
 */
const fs = require('fs');
const path = require('path');

const CONTENT_FILE = path.join(__dirname, '..', '..', 'server', 'data', 'content.json');

function readContent() {
  try {
    return JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'));
  } catch (e) {
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
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // GET
  if (event.httpMethod === 'GET') {
    const content = readContent();
    content._deploy = {
      platform: 'Netlify',
      updated: new Date().toISOString(),
      note: '通过 GitHub 修改 server/data/content.json 更新内容，或使用 /admin 管理后台'
    };
    return { statusCode: 200, headers, body: JSON.stringify(content) };
  }

  // PUT
  if (event.httpMethod === 'PUT') {
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
