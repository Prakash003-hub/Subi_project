import { cloneDefaultContent } from '../data/defaultContent.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const CONTENT_KEY = 'subi-site-content';
const INQUIRIES_KEY = 'subi-site-inquiries';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readStorage(key, fallback) {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota / privacy mode failures.
  }
}

export async function loadContent() {
  const localContent = readStorage(CONTENT_KEY, null);
  if (localContent) {
    return localContent;
  }

  try {
    return await request('/api/content');
  } catch {
    return cloneDefaultContent();
  }
}

export async function saveContent(content) {
  const nextContent = structuredClone(content);
  writeStorage(CONTENT_KEY, nextContent);
  return nextContent;
}

export async function loginAdmin(username, password) {
  if (username !== 'admin' || password !== 'admin123') {
    throw new Error('Invalid admin credentials');
  }

  return {
    token: `local-${Date.now()}`,
    username: 'admin',
  };
}

export async function loadInquiries() {
  const inquiries = readStorage(INQUIRIES_KEY, []);
  return Array.isArray(inquiries) ? inquiries.slice().reverse() : [];
}

export async function submitInquiry(payload) {
  const inquiry = {
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    fields: payload && typeof payload === 'object' && payload.fields ? payload.fields : {},
    source: payload?.source || 'service-form',
  };

  const current = readStorage(INQUIRIES_KEY, []);
  writeStorage(INQUIRIES_KEY, [...current, inquiry]);
  return inquiry;
}
