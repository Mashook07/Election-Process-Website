// ============================================
// VoteGuide AI — Audit Trail & Intrusion Detection
// Secure logging for every action with anomaly detection
// ============================================

import { db, collection, addDoc, getDocs, query, orderBy, limit } from './firebase-config.js';
import { SecurityEvents, getBrowserFingerprint } from './security.js';
import { getCurrentUser } from './auth.js';
import { sha256 } from './crypto.js';

/**
 * SECURITY OVERVIEW:
 * - Every significant action is logged to Firestore `audit_logs` collection
 * - Logs include hashed user IDs (not raw UIDs) for privacy
 * - Client-side anomaly detection flags suspicious patterns
 * - Admin-only audit log viewer with filtering
 * - Intrusion detection: rapid actions, unusual patterns, brute force
 */

const AUDIT_COLLECTION = 'audit_logs';
const ANOMALY_THRESHOLDS = {
  rapidActions: { count: 10, windowMs: 5000 }, // 10 actions in 5 seconds
  loginAttempts: { count: 5, windowMs: 300000 }, // 5 login attempts in 5 minutes
  voteAttempts: { count: 2, windowMs: 60000 }, // 2 vote attempts in 1 minute
};

// In-memory action tracker for anomaly detection
const actionTracker = {};

// ── Hash User ID for Privacy ──
async function hashUserId(uid) {
  if (!uid) return 'anonymous';
  return (await sha256(`voteguide_audit_${uid}`)).substring(0, 16);
}

// ── Log Audit Event ──
export async function logAuditEvent(eventType, details = {}) {
  try {
    const user = getCurrentUser();
    const hashedUid = await hashUserId(user?.uid);
    const fingerprint = getBrowserFingerprint();

    const logEntry = {
      eventType,
      hashedUserId: hashedUid,
      timestamp: new Date().toISOString(),
      serverTimestamp: Date.now(),
      details: {
        ...details,
        // Never log passwords or sensitive data
        password: undefined,
        token: undefined,
        otp: undefined
      },
      metadata: {
        userAgent: navigator.userAgent.substring(0, 200),
        language: navigator.language,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        fingerprint,
        url: window.location.hash
      },
      severity: getSeverity(eventType),
      sessionId: getSessionId()
    };

    // Track action for anomaly detection
    trackAction(eventType, hashedUid);

    // Check for anomalies
    const anomaly = detectAnomaly(eventType, hashedUid);
    if (anomaly) {
      logEntry.anomalyDetected = true;
      logEntry.anomalyType = anomaly;
      // Log the anomaly itself as a separate event
      if (eventType !== SecurityEvents.INTRUSION_DETECTED) {
        logAuditEvent(SecurityEvents.INTRUSION_DETECTED, {
          originalEvent: eventType,
          anomalyType: anomaly,
          message: `Anomaly detected: ${anomaly}`
        });
      }
    }

    // Write to Firestore
    await addDoc(collection(db, AUDIT_COLLECTION), logEntry);

    // Also log to console in development
    if (logEntry.severity === 'critical' || logEntry.severity === 'high') {
      console.warn(`🔒 AUDIT [${logEntry.severity.toUpperCase()}]: ${eventType}`, details);
    }

    return logEntry;
  } catch (error) {
    // Audit logging should never break the app
    console.error('Audit log failed:', error);
    // Fallback: store in localStorage for later sync
    storeLocalFallback(eventType, details);
  }
}

// ── Severity Classification ──
function getSeverity(eventType) {
  const severityMap = {
    [SecurityEvents.INTRUSION_DETECTED]: 'critical',
    [SecurityEvents.SUSPICIOUS_ACTIVITY]: 'critical',
    [SecurityEvents.UNAUTHORIZED_ACCESS]: 'critical',
    [SecurityEvents.VOTE_DUPLICATE_BLOCKED]: 'high',
    [SecurityEvents.VERIFICATION_FAILED]: 'high',
    [SecurityEvents.MFA_FAILED]: 'high',
    [SecurityEvents.LOGIN_FAILED]: 'high',
    [SecurityEvents.RATE_LIMIT_HIT]: 'high',
    [SecurityEvents.INVALID_INPUT]: 'medium',
    [SecurityEvents.VOTE_CAST]: 'medium',
    [SecurityEvents.BLOCKCHAIN_VALIDATION]: 'medium',
    [SecurityEvents.LOGIN_SUCCESS]: 'low',
    [SecurityEvents.LOGOUT]: 'low',
    [SecurityEvents.MFA_ENROLLED]: 'low',
    [SecurityEvents.MFA_VERIFIED]: 'low',
    [SecurityEvents.VERIFICATION_STARTED]: 'low',
    [SecurityEvents.VERIFICATION_COMPLETED]: 'low',
    [SecurityEvents.ADMIN_ACTION]: 'medium',
    [SecurityEvents.SESSION_EXPIRED]: 'low',
    [SecurityEvents.VOTE_ATTEMPTED]: 'low'
  };
  return severityMap[eventType] || 'info';
}

// ── Session ID Management ──
function getSessionId() {
  let sessionId = sessionStorage.getItem('vg_session_id');
  if (!sessionId) {
    sessionId = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    sessionStorage.setItem('vg_session_id', sessionId);
  }
  return sessionId;
}

// ── Action Tracking for Anomaly Detection ──
function trackAction(eventType, userId) {
  const key = `${userId}_${eventType}`;
  const now = Date.now();

  if (!actionTracker[key]) {
    actionTracker[key] = [];
  }

  actionTracker[key].push(now);

  // Keep only last 60 seconds of history
  actionTracker[key] = actionTracker[key].filter(t => now - t < 60000);

  // Also track global actions per user
  const globalKey = `${userId}_ALL`;
  if (!actionTracker[globalKey]) {
    actionTracker[globalKey] = [];
  }
  actionTracker[globalKey].push(now);
  actionTracker[globalKey] = actionTracker[globalKey].filter(t => now - t < 60000);
}

// ── Anomaly Detection ──
function detectAnomaly(eventType, userId) {
  const now = Date.now();

  // Check 1: Rapid actions (potential bot/automation)
  const globalKey = `${userId}_ALL`;
  const globalActions = (actionTracker[globalKey] || []).filter(
    t => now - t < ANOMALY_THRESHOLDS.rapidActions.windowMs
  );
  if (globalActions.length >= ANOMALY_THRESHOLDS.rapidActions.count) {
    return 'RAPID_ACTIONS';
  }

  // Check 2: Multiple login failures (brute force)
  if (eventType === SecurityEvents.LOGIN_FAILED) {
    const loginKey = `${userId}_${SecurityEvents.LOGIN_FAILED}`;
    const loginAttempts = (actionTracker[loginKey] || []).filter(
      t => now - t < ANOMALY_THRESHOLDS.loginAttempts.windowMs
    );
    if (loginAttempts.length >= ANOMALY_THRESHOLDS.loginAttempts.count) {
      return 'BRUTE_FORCE_LOGIN';
    }
  }

  // Check 3: Multiple vote attempts (vote manipulation)
  if (eventType === SecurityEvents.VOTE_ATTEMPTED || eventType === SecurityEvents.VOTE_CAST) {
    const voteKey = `${userId}_${SecurityEvents.VOTE_ATTEMPTED}`;
    const voteAttempts = (actionTracker[voteKey] || []).filter(
      t => now - t < ANOMALY_THRESHOLDS.voteAttempts.windowMs
    );
    if (voteAttempts.length >= ANOMALY_THRESHOLDS.voteAttempts.count) {
      return 'VOTE_MANIPULATION_ATTEMPT';
    }
  }

  return null;
}

// ── Local Fallback Storage ──
function storeLocalFallback(eventType, details) {
  try {
    const fallbackLogs = JSON.parse(localStorage.getItem('vg_audit_fallback') || '[]');
    fallbackLogs.push({
      eventType,
      details,
      timestamp: new Date().toISOString(),
      pending: true
    });
    // Keep only last 100 entries
    if (fallbackLogs.length > 100) fallbackLogs.shift();
    localStorage.setItem('vg_audit_fallback', JSON.stringify(fallbackLogs));
  } catch (e) {
    // localStorage might be full or unavailable
  }
}

// ── Sync Fallback Logs to Firestore ──
export async function syncFallbackLogs() {
  try {
    const logs = JSON.parse(localStorage.getItem('vg_audit_fallback') || '[]');
    if (logs.length === 0) return;

    for (const log of logs) {
      await addDoc(collection(db, AUDIT_COLLECTION), {
        ...log,
        syncedAt: new Date().toISOString(),
        wasFallback: true
      });
    }

    localStorage.removeItem('vg_audit_fallback');
    console.log(`Synced ${logs.length} fallback audit logs`);
  } catch (error) {
    console.error('Failed to sync fallback logs:', error);
  }
}

// ── Render Audit Log (Admin Only) ──
export function renderAuditLog(logs) {
  if (!logs || logs.length === 0) {
    return '<p style="text-align:center;color:var(--gray-500)">No audit logs found.</p>';
  }

  return `
    <div class="audit-log-container">
      <div class="audit-log-header">
        <div class="audit-col-time">Time</div>
        <div class="audit-col-event">Event</div>
        <div class="audit-col-severity">Severity</div>
        <div class="audit-col-user">User</div>
        <div class="audit-col-details">Details</div>
      </div>
      ${logs.map(log => `
        <div class="audit-log-row audit-severity-${log.severity || 'info'}">
          <div class="audit-col-time">${new Date(log.timestamp).toLocaleString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
          <div class="audit-col-event"><span class="audit-event-badge">${log.eventType}</span></div>
          <div class="audit-col-severity"><span class="severity-badge severity-${log.severity || 'info'}">${(log.severity || 'info').toUpperCase()}</span></div>
          <div class="audit-col-user"><code>${log.hashedUserId?.substring(0, 8) || 'N/A'}...</code></div>
          <div class="audit-col-details">${log.anomalyDetected ? '⚠️ ' : ''}${log.details?.message || JSON.stringify(log.details || {}).substring(0, 80)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// ── Fetch Recent Audit Logs (Admin Only) ──
export async function fetchRecentLogs(maxLogs = 50) {
  try {
    const q = query(
      collection(db, AUDIT_COLLECTION),
      orderBy('serverTimestamp', 'desc'),
      limit(maxLogs)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }
}

// ── Export for use in other modules ──
export { getSessionId, detectAnomaly };
