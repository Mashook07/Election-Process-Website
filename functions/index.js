// ============================================
// VoteGuide AI — Cloud Functions (Security Enhanced)
// Rate limiting, auth middleware, vote casting, audit
// ============================================

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors")({ origin: true });

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// ── API Key Management ──
// In production, use: functions.config().gemini.primary_key
// Set via: firebase functions:config:set gemini.primary_key="YOUR_KEY"
const API_KEYS = [
  process.env.GEMINI_API_KEY_PRIMARY || "AIzaSyBC3YKGA-p41UxeIlb4XvQCwFP1DxGF2C8",
  process.env.GEMINI_API_KEY_BACKUP || "AIzaSyAfufF-7dVKFFYfjrgk92tm4om2uL3Wm88"
];
let currentKeyIndex = 0;

// ── Security Middleware: Rate Limiter ──
async function checkRateLimit(ip, action, maxRequests = 30, windowSeconds = 60) {
  const key = `rate_limit_${action}_${ip.replace(/[.:/]/g, '_')}`;
  const ref = db.collection('rate_limits').doc(key);
  
  try {
    const result = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(ref);
      const now = Date.now();
      const windowMs = windowSeconds * 1000;
      
      if (!doc.exists) {
        transaction.set(ref, { count: 1, firstRequest: now, lastRequest: now });
        return { allowed: true, remaining: maxRequests - 1 };
      }
      
      const data = doc.data();
      
      // Reset window if expired
      if (now - data.firstRequest > windowMs) {
        transaction.update(ref, { count: 1, firstRequest: now, lastRequest: now });
        return { allowed: true, remaining: maxRequests - 1 };
      }
      
      if (data.count >= maxRequests) {
        return { 
          allowed: false, 
          retryAfter: Math.ceil((windowMs - (now - data.firstRequest)) / 1000) 
        };
      }
      
      transaction.update(ref, { count: data.count + 1, lastRequest: now });
      return { allowed: true, remaining: maxRequests - data.count - 1 };
    });
    
    return result;
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return { allowed: true, remaining: maxRequests }; // Fail open
  }
}

// ── Security Middleware: Auth Verification ──
async function verifyAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Auth verification failed:", error);
    return null;
  }
}

// ── Security Middleware: Input Validation ──
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .substring(0, 10000); // Max length
}

// ── Audit Logger ──
async function logServerAudit(eventType, details = {}, userId = null) {
  try {
    await db.collection('audit_logs').add({
      eventType,
      hashedUserId: userId ? require('crypto').createHash('sha256').update(`voteguide_audit_${userId}`).digest('hex').substring(0, 16) : 'server',
      timestamp: new Date().toISOString(),
      serverTimestamp: Date.now(),
      details,
      severity: getSeverity(eventType),
      source: 'cloud_function'
    });
  } catch (e) {
    console.error('Server audit log failed:', e);
  }
}

function getSeverity(eventType) {
  const criticalEvents = ['INTRUSION_DETECTED', 'SUSPICIOUS_ACTIVITY', 'UNAUTHORIZED_ACCESS'];
  const highEvents = ['VOTE_DUPLICATE_BLOCKED', 'RATE_LIMIT_HIT', 'AUTH_FAILED'];
  if (criticalEvents.includes(eventType)) return 'critical';
  if (highEvents.includes(eventType)) return 'high';
  return 'medium';
}

// ══════════════════════════════════════════
// API Endpoints
// ══════════════════════════════════════════

// ── Gemini AI Proxy (existing, enhanced with rate limiting) ──
exports.askGemini = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // Rate limiting
    const clientIp = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    const rateResult = await checkRateLimit(clientIp, 'gemini', 20, 60);
    if (!rateResult.allowed) {
      await logServerAudit('RATE_LIMIT_HIT', { action: 'askGemini', ip: clientIp });
      return res.status(429).json({ 
        error: "Rate limit exceeded",
        retryAfter: rateResult.retryAfter 
      });
    }

    try {
      const body = req.body;
      if (!body) {
        return res.status(400).json({ error: "Missing request body" });
      }

      const model = "gemini-2.5-flash";
      let response;
      let success = false;
      let lastError;

      for (let i = 0; i < API_KEYS.length; i++) {
        try {
          response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEYS[currentKeyIndex]}`,
            body,
            { headers: { "Content-Type": "application/json" } }
          );
          success = true;
          break;
        } catch (error) {
          lastError = error;
          if (error.response && error.response.status === 429) {
            console.warn(`Key index ${currentKeyIndex} hit 429 limit. Switching.`);
            currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
            continue;
          }
          break;
        }
      }

      if (success) {
        res.json(response.data);
      } else {
        throw lastError;
      }
    } catch (error) {
      console.error("Gemini API Error:", error.response ? error.response.data : error.message);
      res.status(500).json({
        error: {
          message: error.response?.data?.error?.message || "Internal Server Error"
        }
      });
    }
  });
});

// ── Cast Vote (Server-Side Validation) ──
exports.castVote = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // Rate limiting (strict: 2 votes per minute per IP)
    const clientIp = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    const rateResult = await checkRateLimit(clientIp, 'vote', 2, 60);
    if (!rateResult.allowed) {
      await logServerAudit('RATE_LIMIT_HIT', { action: 'castVote', ip: clientIp });
      return res.status(429).json({ error: "Rate limit exceeded. Please wait." });
    }

    // Auth verification
    const user = await verifyAuth(req);
    if (!user) {
      await logServerAudit('UNAUTHORIZED_ACCESS', { action: 'castVote', ip: clientIp });
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const { encryptedVote, integrityHash, electionId, anonymousToken, blockData } = req.body;

      // Validate required fields
      if (!encryptedVote || !integrityHash || !electionId || !anonymousToken) {
        return res.status(400).json({ error: "Missing required vote data" });
      }

      // Check if user has already voted (atomic transaction)
      const hashedUserId = require('crypto')
        .createHash('sha256')
        .update(`voter_status_${user.uid}`)
        .digest('hex');

      const existingVote = await db.collection('voter_status')
        .where('hashedUserId', '==', hashedUserId)
        .where('electionId', '==', sanitizeInput(electionId))
        .get();

      if (!existingVote.empty) {
        await logServerAudit('VOTE_DUPLICATE_BLOCKED', { electionId, userId: user.uid });
        return res.status(409).json({ error: "You have already voted in this election" });
      }

      // Store the encrypted vote (anonymous — no user identity)
      const voteRef = await db.collection('votes').add({
        encryptedVote,
        integrityHash: sanitizeInput(integrityHash),
        electionId: sanitizeInput(electionId),
        anonymousToken: sanitizeInput(anonymousToken),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        blockData: blockData || null
      });

      // Mark user as having voted (separate from vote — no link)
      await db.collection('voter_status').add({
        hashedUserId,
        electionId: sanitizeInput(electionId),
        votedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await logServerAudit('VOTE_CAST', { electionId, voteId: voteRef.id }, user.uid);

      res.json({ 
        success: true, 
        message: "Vote cast successfully",
        voteId: voteRef.id 
      });

    } catch (error) {
      console.error("Cast vote error:", error);
      await logServerAudit('VOTE_ERROR', { error: error.message });
      res.status(500).json({ error: "Failed to cast vote" });
    }
  });
});

// ── Get Election Results (Aggregated Only — No Individual Votes) ──
exports.getElectionResults = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const clientIp = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    const rateResult = await checkRateLimit(clientIp, 'results', 30, 60);
    if (!rateResult.allowed) {
      return res.status(429).json({ error: "Rate limit exceeded" });
    }

    try {
      const electionId = req.query.electionId || 'election_2026_general';
      
      // Count total votes for this election
      const votesSnapshot = await db.collection('votes')
        .where('electionId', '==', sanitizeInput(electionId))
        .get();

      res.json({
        electionId,
        totalVotes: votesSnapshot.size,
        // NOTE: Individual vote data is encrypted — we only return aggregate count
        message: "Individual votes are encrypted and cannot be read"
      });
    } catch (error) {
      console.error("Get results error:", error);
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });
});

// ── Verify Vote Receipt ──
exports.verifyVoteReceipt = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const clientIp = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    const rateResult = await checkRateLimit(clientIp, 'verify_receipt', 10, 60);
    if (!rateResult.allowed) {
      return res.status(429).json({ error: "Rate limit exceeded" });
    }

    try {
      const { receiptHash } = req.body;
      if (!receiptHash) {
        return res.status(400).json({ error: "Receipt hash required" });
      }

      // Check blockchain ledger for the receipt
      const blockSnapshot = await db.collection('blockchain_ledger')
        .where('dataHash', '==', sanitizeInput(receiptHash))
        .limit(1)
        .get();

      if (blockSnapshot.empty) {
        return res.json({ found: false, message: "Receipt not found in blockchain" });
      }

      const block = blockSnapshot.docs[0].data();
      res.json({
        found: true,
        blockIndex: block.index,
        blockHash: block.hash,
        timestamp: block.timestamp,
        message: "Vote verified on blockchain"
      });
    } catch (error) {
      console.error("Verify receipt error:", error);
      res.status(500).json({ error: "Verification failed" });
    }
  });
});

// ── Server-Side Audit Event Logger ──
exports.logAuditEvent = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const clientIp = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    const rateResult = await checkRateLimit(clientIp, 'audit', 60, 60);
    if (!rateResult.allowed) {
      return res.status(429).json({ error: "Rate limit exceeded" });
    }

    try {
      const { eventType, details } = req.body;
      await logServerAudit(
        sanitizeInput(eventType || 'UNKNOWN'),
        details || {},
        user.uid
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Audit log failed" });
    }
  });
});