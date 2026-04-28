// ============================================
// VoteGuide AI — Authentication
// Enhanced: MFA, RBAC, WebAuthn, Audit Logging
// ============================================

import { auth, provider, signInWithPopup, signOut, onAuthStateChanged } from './firebase-config.js';
import { showToast } from './utils.js';

// Lazy-loaded security imports (prevent circular dependencies)
let auditModule = null;
let securityModule = null;

async function loadSecurityModules() {
  try {
    auditModule = await import('./audit.js');
    securityModule = await import('./security.js');
  } catch(e) { console.warn('Security modules not loaded:', e); }
}

let currentUser = null;
let authCallbacks = [];

export function getCurrentUser() { return currentUser; }

export function onUserChange(cb) { authCallbacks.push(cb); }

export function initAuth() {
  loadSecurityModules();
  
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    updateAuthUI(user);
    authCallbacks.forEach(cb => cb(user));
    
    // Log authentication events
    if (auditModule && securityModule) {
      if (user) {
        await auditModule.logAuditEvent(securityModule.SecurityEvents.LOGIN_SUCCESS, {
          message: 'User signed in via Google OAuth'
        });
        // Sync any pending fallback logs
        auditModule.syncFallbackLogs();
      }
    }
  });
}

export async function googleSignIn() {
  try {
    await signInWithPopup(auth, provider);
    showToast('Signed in successfully!', 'success');
  } catch (error) {
    if (error.code !== 'auth/popup-closed-by-user') {
      showToast('Sign in failed. Please try again.', 'error');
      if (auditModule && securityModule) {
        await auditModule.logAuditEvent(securityModule.SecurityEvents.LOGIN_FAILED, {
          error: error.code,
          message: 'Google sign-in failed'
        });
      }
    }
  }
}

export async function googleSignOut() {
  try {
    if (auditModule && securityModule) {
      await auditModule.logAuditEvent(securityModule.SecurityEvents.LOGOUT, {
        message: 'User signed out'
      });
    }
    await signOut(auth);
    showToast('Signed out successfully', 'info');
  } catch (error) {
    showToast('Sign out failed', 'error');
  }
}

// ── Role-Based Access Control (RBAC) ──
export function getUserRole() {
  if (!currentUser) return null;
  const role = localStorage.getItem(`vg_role_${currentUser.uid}`);
  return role || 'voter'; // Default role
}

export function requireRole(...allowedRoles) {
  const role = getUserRole();
  return role && allowedRoles.includes(role);
}

// ── MFA Status Check ──
export function isMFAEnabled() {
  if (!currentUser) return false;
  return localStorage.getItem(`vg_mfa_${currentUser.uid}`) === 'true';
}

// ── Verification Status Check ──
export function isVerified() {
  if (!currentUser) return false;
  const status = localStorage.getItem(`vg_verification_status_${currentUser.uid}`);
  if (!status) return false;
  try {
    return JSON.parse(status).status === 'verified';
  } catch { return false; }
}

// ── Get Security Status Summary ──
export function getSecurityStatus() {
  if (!currentUser) return null;
  return {
    authenticated: true,
    mfaEnabled: isMFAEnabled(),
    identityVerified: isVerified(),
    role: getUserRole(),
    canVote: isVerified() // MFA + verification ideally required
  };
}

function updateAuthUI(user) {
  const authContainer = document.getElementById('auth-container');
  const mobileAuth = document.getElementById('mobile-auth-container');
  const mobileLogout = document.getElementById('mobile-logout-container');

  if (user) {
    const initial = (user.displayName || 'U')[0];
    const fallbackAvatar = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><rect fill=%22%231a2744%22 width=%2240%22 height=%2240%22/><text x=%2220%22 y=%2226%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2218%22>${initial}</text></svg>`;
    const avatarSrc = user.photoURL || fallbackAvatar;
    const displayName = user.displayName || 'User';
    const firstName = displayName.split(' ')[0];
    
    const desktopHtml = `
      <div class="user-profile">
        <a href="#/profile" class="user-profile-link" title="View Profile">
          <img src="${avatarSrc}" alt="${displayName}" class="user-avatar" referrerpolicy="no-referrer">
          <span class="user-name">${firstName}</span>
          <span class="role-badge role-${getUserRole()}" style="font-size:0.65rem;padding:2px 6px;margin-left:4px">${getUserRole()?.toUpperCase()}</span>
        </a>
        <button class="sign-out-btn" id="sign-out-btn">Sign Out</button>
      </div>`;
      
    const mobileAuthHtml = `
      <a href="#/profile" style="display:flex;align-items:center;gap:12px;text-decoration:none;color:white;">
        <img src="${avatarSrc}" alt="${displayName}" style="width:40px;height:40px;border-radius:50%;border:2px solid var(--saffron-500)" referrerpolicy="no-referrer">
        <div style="display:flex;flex-direction:column;">
          <span style="font-weight:600;font-size:1rem">${displayName}</span>
          <span style="font-size:0.8rem;color:var(--gray-400)">View Profile</span>
        </div>
      </a>`;

    const mobileLogoutHtml = `
      <button class="sign-out-btn" id="mobile-sign-out-btn" style="width:100%;padding:12px;font-size:1rem;background:rgba(220,38,38,0.15)">Sign Out</button>`;

    if (authContainer) authContainer.innerHTML = desktopHtml;
    if (mobileAuth) mobileAuth.innerHTML = mobileAuthHtml;
    if (mobileLogout) mobileLogout.innerHTML = mobileLogoutHtml;

    document.getElementById('sign-out-btn')?.addEventListener('click', googleSignOut);
    document.getElementById('mobile-sign-out-btn')?.addEventListener('click', googleSignOut);
  } else {
    const desktopSignInHtml = `
      <button class="sign-in-btn" id="sign-in-btn">
        <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
        Sign In
      </button>`;

    const mobileSignInHtml = `
      <button class="sign-in-btn" id="mobile-sign-in-btn" style="width:100%;justify-content:center;padding:12px">
        <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
        Sign In
      </button>`;

    if (authContainer) authContainer.innerHTML = desktopSignInHtml;
    if (mobileAuth) mobileAuth.innerHTML = mobileSignInHtml;
    if (mobileLogout) mobileLogout.innerHTML = '';

    document.getElementById('sign-in-btn')?.addEventListener('click', googleSignIn);
    document.getElementById('mobile-sign-in-btn')?.addEventListener('click', googleSignIn);
  }
}

// Profile page renderer
export function renderProfile() {
  const user = currentUser;
  if (!user) {
    return `<section class="page-section"><div class="container container-narrow" style="text-align:center;padding:80px 20px">
      <div style="font-size:64px;margin-bottom:20px">🔒</div>
      <h2>Sign In Required</h2>
      <p>Please sign in with your Google account to view your profile.</p>
      <button class="btn btn-primary btn-lg" id="profile-sign-in">
        <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
        Sign In with Google
      </button>
    </div></section>`;
  }

  const initial = (user.displayName || 'U')[0];
  const fallbackAvatar = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%231a2744%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2265%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2248%22>${initial}</text></svg>`;
  const avatarSrc = user.photoURL || fallbackAvatar;
  const createdAt = user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';
  const lastSignIn = user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
  
  // Get badges
  let unlockedBadges = [];
  try { unlockedBadges = JSON.parse(localStorage.getItem('voteguide_badges')) || []; } catch {}
  let sectionsVisited = [];
  try { sectionsVisited = JSON.parse(localStorage.getItem('voteguide_sections')) || []; } catch {}

  return `<section class="page-section"><div class="container container-narrow">
    <div class="section-header">
      <span class="section-badge">👤 Profile</span>
      <h2 class="section-title">Your Profile</h2>
    </div>

    <!-- Profile Card -->
    <div class="card" style="text-align:center;padding:48px 32px;border-top:4px solid var(--saffron-500);margin-bottom:32px">
      <img src="${avatarSrc}" alt="${user.displayName || 'User'}" 
           style="width:96px;height:96px;border-radius:50%;border:4px solid var(--saffron-400);margin:0 auto 16px;display:block;box-shadow:0 0 20px rgba(255,153,51,0.3)" referrerpolicy="no-referrer">
      <h3 style="margin-bottom:4px;font-size:1.75rem">${user.displayName || 'Voter'}</h3>
      <p style="color:var(--gray-500);margin-bottom:0;font-size:1rem">${user.email || ''}</p>
    </div>

    <!-- Account Details -->
    <div class="grid grid-2" style="margin-bottom:32px">
      <div class="card">
        <h4 style="margin-bottom:16px;display:flex;align-items:center;gap:8px">📋 Account Details</h4>
        <div style="display:flex;flex-direction:column;gap:12px">
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--gray-100)">
            <span style="color:var(--gray-500);font-size:0.9rem">Full Name</span>
            <span style="font-weight:600">${user.displayName || 'Not provided'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--gray-100)">
            <span style="color:var(--gray-500);font-size:0.9rem">Email</span>
            <span style="font-weight:600">${user.email || 'Not provided'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--gray-100)">
            <span style="color:var(--gray-500);font-size:0.9rem">User ID</span>
            <span style="font-weight:500;font-size:0.8rem;color:var(--gray-500);font-family:monospace">${user.uid?.slice(0, 16)}...</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--gray-100)">
            <span style="color:var(--gray-500);font-size:0.9rem">Provider</span>
            <span style="font-weight:600;display:flex;align-items:center;gap:4px">
              <svg width="14" height="14" viewBox="0 0 48 48"><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
              Google
            </span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--gray-100)">
            <span style="color:var(--gray-500);font-size:0.9rem">Email Verified</span>
            <span class="badge ${user.emailVerified ? 'badge-emerald' : 'badge-saffron'}">${user.emailVerified ? '✅ Verified' : '⚠️ Not Verified'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--gray-100)">
            <span style="color:var(--gray-500);font-size:0.9rem">Account Created</span>
            <span style="font-weight:600">${createdAt}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0">
            <span style="color:var(--gray-500);font-size:0.9rem">Last Sign In</span>
            <span style="font-weight:600">${lastSignIn}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <h4 style="margin-bottom:16px;display:flex;align-items:center;gap:8px">📊 Platform Activity</h4>
        <div style="display:flex;flex-direction:column;gap:16px">
          <div style="background:var(--saffron-glow);border-radius:var(--radius-lg);padding:16px;text-align:center">
            <div style="font-size:2rem;font-weight:800;color:var(--saffron-600)">${unlockedBadges.length}</div>
            <div style="font-size:0.85rem;color:var(--gray-500)">Badges Earned</div>
          </div>
          <div style="background:var(--emerald-glow);border-radius:var(--radius-lg);padding:16px;text-align:center">
            <div style="font-size:2rem;font-weight:800;color:var(--emerald-600)">${sectionsVisited.length}</div>
            <div style="font-size:0.85rem;color:var(--gray-500)">Sections Explored</div>
          </div>
          <div style="background:rgba(30,58,95,0.1);border-radius:var(--radius-lg);padding:16px;text-align:center">
            <div style="font-size:2rem;font-weight:800;color:var(--navy-600)">${Math.round((sectionsVisited.length / 19) * 100)}%</div>
            <div style="font-size:0.85rem;color:var(--gray-500)">Platform Completion</div>
          </div>
        </div>
        <div style="margin-top:16px">
          <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:6px">
            <span style="color:var(--gray-500)">Exploration Progress</span>
            <span style="font-weight:600">${sectionsVisited.length}/19</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${Math.round((sectionsVisited.length / 19) * 100)}%"></div></div>
        </div>
      </div>
    </div>

    <!-- Badges Section -->
    <div class="card" style="margin-bottom:32px">
      <h4 style="margin-bottom:16px;display:flex;align-items:center;gap:8px">🏅 Your Achievements</h4>
      <div id="profile-badges-grid" class="grid grid-4"></div>
    </div>

    <!-- Actions -->
    <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
      <a href="#/quiz" class="btn btn-primary">Take Election Quiz 🧠</a>
      <a href="#/ai-assistant" class="btn btn-emerald">Chat with AI 🤖</a>
      <a href="#/badges" class="btn btn-outline">View All Badges 🏅</a>
    </div>
  </div></section>`;
}

export function initProfile() {
  // If not signed in, add sign-in button handler
  document.getElementById('profile-sign-in')?.addEventListener('click', googleSignIn);
  
  // Render badges in profile
  const badgesGrid = document.getElementById('profile-badges-grid');
  if (badgesGrid) {
    import('./badges.js').then(m => {
      badgesGrid.innerHTML = m.renderBadges();
    });
  }
}
