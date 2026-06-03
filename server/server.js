/**
 * Stellar Sequence — Backend CMS Server
 * Express + Multer (file upload) + JSON file storage
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Config ---
const DATA_DIR = path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');

// Ensure directories
[DATA_DIR, UPLOAD_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static files from parent (the website)
app.use(express.static(path.join(__dirname, '..')));
// Serve uploads
app.use('/uploads', express.static(UPLOAD_DIR));
// Serve admin panel
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));

// --- Multer (file upload) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|svg|ico|mp4|webm|mov|avi|mkv)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Allowed: images, videos, ico, svg'));
    }
  }
});

// --- Helpers ---
function readContent() {
  try {
    return JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'));
  } catch (e) {
    return {};
  }
}

function writeContent(data) {
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// --- API Routes ---

// GET /api/content — returns all content
app.get('/api/content', (req, res) => {
  res.json(readContent());
});

// PUT /api/content — update any content field
app.put('/api/content', (req, res) => {
  const current = readContent();
  const merged = deepMerge(current, req.body);
  writeContent(merged);
  res.json({ success: true, data: merged });
});

// POST /api/upload — upload file (image/video/favicon)
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = '/uploads/' + req.file.filename;
  res.json({ success: true, url, filename: req.file.filename });
});

// POST /api/upload/type — upload & update specific media slot
app.post('/api/upload/media', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const type = req.body.type; // 'video' | 'image-0' | 'image-1' | 'image-2' | 'image-3' | 'favicon' | 'logo'
  const url = '/uploads/' + req.file.filename;

  const content = readContent();
  if (!content.media) content.media = { video: '', images: ['', '', '', ''], imageLabels: ['', '', '', ''] };

  if (type === 'video') {
    content.media.video = url;
  } else if (type === 'favicon') {
    content.favicon = url;
  } else if (type === 'logo') {
    content.logo = url;
  } else if (type && type.startsWith('image-')) {
    const idx = parseInt(type.split('-')[1]);
    if (idx >= 0 && idx < 4) {
      content.media.images[idx] = url;
    }
  }

  writeContent(content);
  res.json({ success: true, url, type });
});

// DELETE /api/upload/:filename — remove uploaded file
app.delete('/api/upload/:filename', (req, res) => {
  const filepath = path.join(UPLOAD_DIR, req.params.filename);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// --- Deep merge helper ---
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

// --- Start ---
app.listen(PORT, () => {
  console.log(`Stellar Sequence CMS running on http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
});
