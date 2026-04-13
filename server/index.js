import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { defaultContent } from './defaultContent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'content.json');
const PORT = Number(process.env.PORT || 3001);
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const sessions = new Set();

async function readStore() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    const store = { content: defaultContent, inquiries: [] };
    await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
    return store;
  }
}

async function writeStore(store) {
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, message) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
  });
  res.end(message);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

function getToken(req) {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');
  return token || '';
}

function isAuthed(req) {
  return sessions.has(getToken(req));
}

function normalizeContent(input) {
  const content = input && typeof input === 'object' ? input : {};
  return {
    posts: Array.isArray(content.posts) ? content.posts : [],
    products: Array.isArray(content.products) ? content.products : [],
    services: Array.isArray(content.services) ? content.services : [],
    jobs: Array.isArray(content.jobs) ? content.jobs : [],
    serviceForm: {
      title: content.serviceForm?.title || 'Service Request',
      description: content.serviceForm?.description || '',
      heading: content.serviceForm?.heading || '',
      submitLabel: content.serviceForm?.submitLabel || 'Submit Request',
      fields: Array.isArray(content.serviceForm?.fields) ? content.serviceForm.fields : [],
    },
  };
}

function sanitizeInquiry(payload) {
  const inquiry = payload && typeof payload === 'object' ? payload : {};
  return {
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    fields: inquiry.fields && typeof inquiry.fields === 'object' ? inquiry.fields : {},
    source: inquiry.source || 'service-form',
  };
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendText(res, 204, '');
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  try {
    if (req.method === 'GET' && url.pathname === '/api/content') {
      const store = await readStore();
      sendJson(res, 200, store.content);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/admin/login') {
      const body = await parseBody(req);
      if (body.username !== ADMIN_USERNAME || body.password !== ADMIN_PASSWORD) {
        sendJson(res, 401, { message: 'Invalid admin credentials' });
        return;
      }

      const token = crypto.randomUUID();
      sessions.add(token);
      sendJson(res, 200, { token, username: ADMIN_USERNAME });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/admin/inquiries') {
      if (!isAuthed(req)) {
        sendJson(res, 401, { message: 'Unauthorized' });
        return;
      }

      const store = await readStore();
      sendJson(res, 200, store.inquiries.slice().reverse());
      return;
    }

    if (req.method === 'PUT' && url.pathname === '/api/admin/content') {
      if (!isAuthed(req)) {
        sendJson(res, 401, { message: 'Unauthorized' });
        return;
      }

      const body = await parseBody(req);
      const store = await readStore();
      store.content = normalizeContent(body.content);
      await writeStore(store);
      sendJson(res, 200, store.content);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/inquiries') {
      const body = await parseBody(req);
      const store = await readStore();
      const inquiry = sanitizeInquiry(body);
      store.inquiries.push(inquiry);
      await writeStore(store);
      sendJson(res, 201, inquiry);
      return;
    }

    sendJson(res, 404, { message: 'Not found' });
  } catch (error) {
    sendJson(res, 500, { message: error.message || 'Internal server error' });
  }
});

server.listen(PORT, () => {
  console.log(`Admin backend running on http://localhost:${PORT}`);
});
