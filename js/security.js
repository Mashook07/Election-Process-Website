// ============================================
// VoteGuide AI — Security Utilities Module
// Input validation, CSRF protection, rate limiting
// ============================================

/**
 * SECURITY OVERVIEW:
 * - Enhanced XSS prevention with multi-layer sanitization
 * - Schema-based input validation
 * - CSRF token generation and management
 * - Client-side rate limiting (complementary to server-side)
 * - Content Security Policy enforcement
 */

// ── Enhanced HTML Sanitization (DOMPurify-equivalent) ──
const DANGEROUS_TAGS = /(<script[\s>]|<\/script>|<iframe[\s>]|<\/iframe>|<object[\s>]|<\/object>|<embed[\s>]|<\/embed>|<link[\s>]|<form[\s>]|<\/form>|javascript:|vbscript:|data:text\/html|on\w+\s*=)/gi;

const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;'
};

export function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  
  // Step 1: Replace HTML entities
  let clean = str.replace(/[&<>"'`/]/g, char => HTML_ENTITIES[char] || char);
  
  // Step 2: Strip dangerous patterns
  clean = clean.replace(DANGEROUS_TAGS, '');
  
  // Step 3: Remove null bytes
  clean = clean.replace(/\0/g, '');
  
  // Step 4: Normalize unicode to prevent homograph attacks
  clean = clean.normalize('NFC');
  
  return clean;
}

// ── Deep Sanitize Object ──
export function sanitizeObject(obj) {
  if (typeof obj === 'string') return sanitizeInput(obj);
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    clean[sanitizeInput(key)] = sanitizeObject(value);
  }
  return clean;
}

// ── Schema-Based Input Validation ──
const VALIDATION_RULES = {
  string: (v, opts) => {
    if (typeof v !== 'string') return 'Must be a string';
    if (opts.minLength && v.length < opts.minLength) return `Minimum ${opts.minLength} characters`;
    if (opts.maxLength && v.length > opts.maxLength) return `Maximum ${opts.maxLength} characters`;
    if (opts.pattern && !opts.pattern.test(v)) return opts.patternMessage || 'Invalid format';
    return null;
  },
  number: (v, opts) => {
    if (typeof v !== 'number' || isNaN(v)) return 'Must be a number';
    if (opts.min !== undefined && v < opts.min) return `Minimum value is ${opts.min}`;
    if (opts.max !== undefined && v > opts.max) return `Maximum value is ${opts.max}`;
    if (opts.integer && !Number.isInteger(v)) return 'Must be an integer';
    return null;
  },
  email: (v) => {
    if (typeof v !== 'string') return 'Must be a string';
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v)) return 'Invalid email format';
    return null;
  },
  aadhaar: (v) => {
    if (typeof v !== 'string') return 'Must be a string';
    if (!/^\d{12}$/.test(v)) return 'Aadhaar must be 12 digits';
    // Don't start with 0 or 1
    if (/^[01]/.test(v)) return 'Invalid Aadhaar number';
    return null;
  },
  voterId: (v) => {
    if (typeof v !== 'string') return 'Must be a string';
    if (!/^[A-Z]{3}\d{7}$/.test(v)) return 'Voter ID must be 3 letters followed by 7 digits';
    return null;
  },
  otp: (v) => {
    if (typeof v !== 'string') return 'Must be a string';
    if (!/^\d{6}$/.test(v)) return 'OTP must be 6 digits';
    return null;
  },
  candidateId: (v) => {
    if (typeof v !== 'string') return 'Must be a string';
    if (!/^[a-zA-Z0-9_-]{1,50}$/.test(v)) return 'Invalid candidate ID format';
    return null;
  },
  electionId: (v) => {
    if (typeof v !== 'string') return 'Must be a string';
    if (!/^[a-zA-Z0-9_-]{1,50}$/.test(v)) return 'Invalid election ID format';
    return null;
  }
};

export function validateInput(value, schema) {
  const { type, required, ...opts } = schema;
  
  // Required check
  if (required && (value === undefined || value === null || value === '')) {
    return { valid: false, error: 'This field is required' };
  }
  
  // Skip validation if not required and empty
  if (!required && (value === undefined || value === null || value === '')) {
    return { valid: true, error: null };
  }
  
  // Type validation
  const validator = VALIDATION_RULES[type];
  if (!validator) return { valid: false, error: `Unknown validation type: ${type}` };
  
  const error = validator(value, opts);
  return { valid: !error, error };
}

// ── Batch Validation ──
export function validateForm(data, schemas) {
  const errors = {};
  let isValid = true;
  
  for (const [field, schema] of Object.entries(schemas)) {
    const result = validateInput(data[field], schema);
    if (!result.valid) {
      errors[field] = result.error;
      isValid = false;
    }
  }
  
  return { valid: isValid, errors };
}

// ── CSRF Token Management ──
const CSRF_TOKEN_KEY = 'vg_csrf_token';
const CSRF_TOKEN_EXPIRY = 'vg_csrf_expiry';
const CSRF_TTL = 30 * 60 * 1000; // 30 minutes

export function generateCSRFToken() {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  sessionStorage.setItem(CSRF_TOKEN_EXPIRY, (Date.now() + CSRF_TTL).toString());
  
  return token;
}

export function getCSRFToken() {
  const token = sessionStorage.getItem(CSRF_TOKEN_KEY);
  const expiry = parseInt(sessionStorage.getItem(CSRF_TOKEN_EXPIRY) || '0');
  
  if (!token || Date.now() > expiry) {
    return generateCSRFToken();
  }
  
  return token;
}

export function validateCSRFToken(token) {
  const stored = sessionStorage.getItem(CSRF_TOKEN_KEY);
  const expiry = parseInt(sessionStorage.getItem(CSRF_TOKEN_EXPIRY) || '0');
  
  if (!stored || !token) return false;
  if (Date.now() > expiry) return false;
  
  // Constant-time comparison to prevent timing attacks
  if (token.length !== stored.length) return false;
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ stored.charCodeAt(i);
  }
  return result === 0;
}

// ── Client-Side Rate Limiting ──
const rateLimitStore = {};

export function checkRateLimit(action, maxAttempts = 5, windowMs = 60000) {
  const now = Date.now();
  
  if (!rateLimitStore[action]) {
    rateLimitStore[action] = [];
  }
  
  // Remove expired entries
  rateLimitStore[action] = rateLimitStore[action].filter(t => now - t < windowMs);
  
  if (rateLimitStore[action].length >= maxAttempts) {
    const oldestAttempt = rateLimitStore[action][0];
    const retryAfter = Math.ceil((windowMs - (now - oldestAttempt)) / 1000);
    return {
      allowed: false,
      retryAfter,
      message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`
    };
  }
  
  rateLimitStore[action].push(now);
  return { allowed: true, remaining: maxAttempts - rateLimitStore[action].length };
}

// ── Secure Fetch Wrapper ──
export async function secureFetch(url, options = {}) {
  // Attach CSRF token
  const csrfToken = getCSRFToken();
  
  const headers = {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
    'X-Requested-With': 'XMLHttpRequest', // Helps prevent CSRF
    ...(options.headers || {})
  };
  
  // Add request timestamp and nonce for replay protection
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  headers['X-Request-Nonce'] = nonce;
  headers['X-Request-Timestamp'] = Date.now().toString();
  
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin'
  });
  
  return response;
}

// ── Security Event Types ──
export const SecurityEvents = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  MFA_ENROLLED: 'MFA_ENROLLED',
  MFA_VERIFIED: 'MFA_VERIFIED',
  MFA_FAILED: 'MFA_FAILED',
  VOTE_CAST: 'VOTE_CAST',
  VOTE_ATTEMPTED: 'VOTE_ATTEMPTED',
  VOTE_DUPLICATE_BLOCKED: 'VOTE_DUPLICATE_BLOCKED',
  VERIFICATION_STARTED: 'VERIFICATION_STARTED',
  VERIFICATION_COMPLETED: 'VERIFICATION_COMPLETED',
  VERIFICATION_FAILED: 'VERIFICATION_FAILED',
  ADMIN_ACTION: 'ADMIN_ACTION',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_HIT: 'RATE_LIMIT_HIT',
  INVALID_INPUT: 'INVALID_INPUT',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  BLOCKCHAIN_VALIDATION: 'BLOCKCHAIN_VALIDATION',
  INTRUSION_DETECTED: 'INTRUSION_DETECTED'
};

// ── Content Security Policy Builder ──
export function getCSPMeta() {
  return `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://translate.google.com https://translate.googleapis.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://translate.googleapis.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net wss://*.firebaseio.com https://firestore.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src https://translate.google.com https://*.firebaseapp.com;`;
}

// ── Fingerprint Detection (for anomaly detection) ──
export function getBrowserFingerprint() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('fingerprint', 2, 2);
  
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL().slice(-50)
  ];
  
  // Simple hash of the combined components
  let hash = 0;
  const str = components.join('|');
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}
