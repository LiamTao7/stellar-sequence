/**
 * Vercel Serverless Function — Content API
 * Uses in-memory + JSON file for content storage
 * For Vercel deployment, file writes persist within the same deployment
 * For persistent storage across deployments, use Vercel KV
 */

const fs = require('fs');
const path = require('path');

const CONTENT_FILE = path.join(process.cwd(), 'server', 'data', 'content.json');

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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const content = readContent();
    // Add deployment info
    content._deploy = {
      platform: 'Vercel',
      updated: new Date().toISOString(),
      note: '通过 GitHub 修改 server/data/content.json 更新内容，或使用 /admin 管理后台'
    };
    return res.status(200).json(content);
  }

  if (req.method === 'PUT') {
    const current = readContent();
    const merged = deepMerge(current, req.body);
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(merged, null, 2), 'utf-8');
    return res.status(200).json({
      success: true,
      data: merged,
      note: '内容已更新。修改将在下次部署时持久化。如需立即持久化，请直接编辑 GitHub 仓库中的 server/data/content.json。'
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
