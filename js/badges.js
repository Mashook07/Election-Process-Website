// ============================================
// VoteGuide AI — Badges / Achievement System
// ============================================

import { showToast } from './utils.js';
import { badges as badgeDefs } from './data.js';

const STORAGE_KEY = 'voteguide_badges';

export function getUnlockedBadges() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}

export function unlockBadge(badgeId) {
  const unlocked = getUnlockedBadges();
  if (unlocked.includes(badgeId)) return;
  unlocked.push(badgeId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));

  const badge = badgeDefs.find(b => b.id === badgeId);
  if (badge) {
    showToast(`🏅 Achievement Unlocked: ${badge.title}!`, 'success');
  }
}

export function isBadgeUnlocked(badgeId) {
  return getUnlockedBadges().includes(badgeId);
}

export function renderBadges() {
  const unlocked = getUnlockedBadges();
  return badgeDefs.map(b => `
    <div class="achievement-badge ${unlocked.includes(b.id) ? 'unlocked' : 'locked'}">
      <span class="badge-icon">${b.icon}</span>
      <span class="badge-title">${b.title}</span>
      <span class="badge-desc">${b.desc}</span>
    </div>
  `).join('');
}

// Track sections visited
const SECTIONS_KEY = 'voteguide_sections';

export function trackSection(section) {
  try {
    const visited = JSON.parse(localStorage.getItem(SECTIONS_KEY)) || [];
    if (!visited.includes(section)) {
      visited.push(section);
      localStorage.setItem(SECTIONS_KEY, JSON.stringify(visited));
    }
    if (visited.length >= 10) unlockBadge('election_expert');
  } catch {}
}

// Initialize first visit badge
export function initBadges() {
  unlockBadge('first_visit');
}
