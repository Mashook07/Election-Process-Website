// VoteGuide AI — Page Renderers Part 3 (Parliament, States, President, Updates, First-Time Voter, Myths, Links, Booth Finder, EVM Demo, Badges)
import { statesData, mythsAndFacts, officialLinks, firstTimeVoterSteps, parliamentInfo, presidentInfo, updatesData, evmCandidates, badges as badgeDefs } from './data.js';
import { unlockBadge, trackSection, renderBadges } from './badges.js';
import { formatDate } from './utils.js';

export function renderParliament() {
  trackSection('parliament');
  const ls = parliamentInfo.lokSabha, rs = parliamentInfo.rajyaSabha;
  return `<section class="page-section"><div class="container">
    <div class="section-header"><span class="section-badge">🏛️ Parliament</span><h2 class="section-title">Indian Parliament</h2><p class="section-subtitle">Understanding the two houses of India's Parliament.</p></div>
    <div class="grid grid-2">
      <div class="card card-accent-top reveal">
        <h3 style="margin-bottom:4px">${ls.title}</h3>
        <div style="display:flex;gap:16px;margin:16px 0;flex-wrap:wrap">
          <span class="badge badge-saffron">${ls.seats} Seats</span><span class="badge badge-navy">Term: ${ls.term}</span><span class="badge badge-emerald">Min Age: ${ls.minAge}</span>
        </div>
        <p style="font-size:0.9rem;color:var(--gray-500);margin-bottom:8px">Presided by: ${ls.head}</p>
        <ul style="list-style:none;padding:0">${ls.facts.map(f => `<li style="padding:6px 0;border-bottom:1px solid var(--gray-100);font-size:0.9rem;color:var(--gray-600)">• ${f}</li>`).join('')}</ul>
      </div>
      <div class="card card-emerald-accent reveal reveal-delay-1">
        <h3 style="margin-bottom:4px">${rs.title}</h3>
        <div style="display:flex;gap:16px;margin:16px 0;flex-wrap:wrap">
          <span class="badge badge-saffron">${rs.seats} Seats</span><span class="badge badge-navy">Term: ${rs.term}</span><span class="badge badge-emerald">Min Age: ${rs.minAge}</span>
        </div>
        <p style="font-size:0.9rem;color:var(--gray-500);margin-bottom:8px">Presided by: ${rs.head}</p>
        <ul style="list-style:none;padding:0">${rs.facts.map(f => `<li style="padding:6px 0;border-bottom:1px solid var(--gray-100);font-size:0.9rem;color:var(--gray-600)">• ${f}</li>`).join('')}</ul>
      </div>
    </div>
  </div></section>`;
}

export function renderStates() {
  trackSection('states');
  const regions = ['All','North','South','East','West','North East','Central'];
  return `<section class="page-section"><div class="container">
    <div class="section-header"><span class="section-badge">🗺️ States</span><h2 class="section-title">States & Union Territories</h2><p class="section-subtitle">Complete election data for all 28 states and 8 union territories.</p></div>
    <div style="display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap;justify-content:center">
      <input type="text" class="form-input" id="state-search" placeholder="🔍 Search state..." style="max-width:300px">
      <div style="display:flex;gap:6px;flex-wrap:wrap" id="region-filters">
        ${regions.map(r => `<button class="chip ${r === 'All' ? 'active' : ''}" data-region="${r}">${r}</button>`).join('')}
      </div>
    </div>
    <div class="data-table-wrapper"><table class="data-table" id="states-table">
      <thead><tr><th>Name</th><th>Capital</th><th>Type</th><th>Vidhan Sabha</th><th>Lok Sabha</th><th>Rajya Sabha</th><th>Region</th></tr></thead>
      <tbody id="states-tbody"></tbody>
    </table></div>
  </div></section>`;
}

export function initStatesTable() {
  let filter = 'All', search = '';
  function render() {
    const tbody = document.getElementById('states-tbody');
    if (!tbody) return;
    const filtered = statesData.filter(s =>
      (filter === 'All' || s.region === filter) &&
      (!search || s.name.toLowerCase().includes(search.toLowerCase()) || s.capital.toLowerCase().includes(search.toLowerCase()))
    );
    tbody.innerHTML = filtered.map(s => `<tr>
      <td style="font-weight:600">${s.name}</td><td>${s.capital}</td>
      <td><span class="badge ${s.type === 'State' ? 'badge-emerald' : 'badge-saffron'}">${s.type}</span></td>
      <td>${s.vidhanSabha || '—'}</td><td>${s.lokSabha}</td><td>${s.rajyaSabha || '—'}</td><td>${s.region}</td>
    </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--gray-400)">No results found</td></tr>';
  }
  document.getElementById('state-search')?.addEventListener('input', (e) => { search = e.target.value; render(); });
  document.getElementById('region-filters')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('chip')) {
      document.querySelectorAll('#region-filters .chip').forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      filter = e.target.dataset.region;
      render();
    }
  });
  render();
}

export function renderPresident() {
  trackSection('president');
  return `<section class="page-section"><div class="container container-narrow">
    <div class="section-header"><span class="section-badge">🏛️ President</span><h2 class="section-title">President of India</h2><p class="section-subtitle">Role, powers, and election process of the Head of State.</p></div>
    <div class="card reveal" style="margin-bottom:24px">
      <h3 style="margin-bottom:12px">Role & Importance</h3>
      <p style="font-size:1.05rem;line-height:1.8">${presidentInfo.role}</p>
    </div>
    <div class="grid grid-2">
      <div class="card card-accent-top reveal">
        <h4 style="margin-bottom:12px">🗳️ Election Process</h4>
        <ul style="list-style:none;padding:0">${presidentInfo.election.map(e => `<li style="padding:8px 0;border-bottom:1px solid var(--gray-100);font-size:0.9rem;color:var(--gray-600)">• ${e}</li>`).join('')}</ul>
      </div>
      <div class="card card-emerald-accent reveal reveal-delay-1">
        <h4 style="margin-bottom:12px">⚖️ Key Powers</h4>
        <ul style="list-style:none;padding:0">${presidentInfo.powers.map(p => `<li style="padding:8px 0;border-bottom:1px solid var(--gray-100);font-size:0.9rem;color:var(--gray-600)">• ${p}</li>`).join('')}</ul>
      </div>
    </div>
  </div></section>`;
}

export function renderUpdates() {
  trackSection('updates');
  return `<section class="page-section"><div class="container container-narrow">
    <div class="section-header"><span class="section-badge">📢 Updates</span><h2 class="section-title">Election Updates</h2><p class="section-subtitle">Latest official election information and awareness notices.</p></div>
    <div style="display:flex;flex-direction:column;gap:16px">
      ${updatesData.map(u => `<div class="card card-accent-left reveal">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
          <span class="badge badge-saffron">${u.type}</span><small style="color:var(--gray-400)">${formatDate(u.date)}</small>
        </div>
        <h4 style="margin-bottom:8px">${u.title}</h4>
        <p style="font-size:0.9rem;margin:0">${u.desc}</p>
      </div>`).join('')}
    </div>
  </div></section>`;
}

export function renderFirstTimeVoter() {
  trackSection('first-time-voter');
  return `<section class="page-section"><div class="container container-narrow">
    <div class="section-header"><span class="section-badge">🌟 First Vote</span><h2 class="section-title">First-Time Voter Guide</h2><p class="section-subtitle">"I just turned 18 — how do I vote?" Here's your complete roadmap!</p></div>
    <div style="background:var(--saffron-glow);border:1px solid rgba(255,153,51,0.2);border-radius:var(--radius-xl);padding:24px;margin-bottom:32px;text-align:center">
      <h3 style="color:var(--saffron-600)">🎉 Congratulations on turning 18!</h3>
      <p style="margin:0;color:var(--gray-600)">You now have the power to shape India's future. Follow these steps to cast your first vote.</p>
    </div>
    <div class="ftv-timeline">
      ${firstTimeVoterSteps.map((s, i) => `<div class="ftv-step reveal reveal-delay-${Math.min(i % 3 + 1, 3)}">
        <div class="ftv-step-dot">${s.icon}</div>
        <div class="ftv-step-content"><h4>Step ${i + 1}: ${s.title}</h4><p>${s.desc}</p></div>
      </div>`).join('')}
    </div>
  </div></section>`;
}

export function renderMyths() {
  trackSection('myths');
  unlockBadge('myth_buster');
  return `<section class="page-section"><div class="container">
    <div class="section-header"><span class="section-badge">💡 Facts</span><h2 class="section-title">Myth vs Fact</h2><p class="section-subtitle">Busting common misconceptions about Indian elections.</p></div>
    <div class="grid grid-2">
      ${mythsAndFacts.map(m => `<div class="myth-card reveal">
        <div class="myth-header"><span class="myth-tag">❌ Myth</span><span style="flex:1;font-weight:600;color:var(--gray-700)">"${m.myth}"</span></div>
        <div class="fact-section"><span class="fact-tag">✅ Fact</span><p style="margin:0;font-size:0.9rem;color:var(--gray-700);line-height:1.7">${m.fact}</p></div>
      </div>`).join('')}
    </div>
  </div></section>`;
}

export function renderOfficialLinks() {
  trackSection('official-links');
  return `<section class="page-section"><div class="container">
    <div class="section-header"><span class="section-badge">🔗 Links</span><h2 class="section-title">Official Government Links</h2><p class="section-subtitle">Trusted and verified government resources for election information.</p></div>
    <div class="grid grid-4">
      ${officialLinks.map(l => `<a href="${l.url}" target="_blank" class="card reveal" style="text-align:center;text-decoration:none">
        <span style="font-size:40px;display:block;margin-bottom:12px">${l.icon}</span>
        <h5 style="margin-bottom:4px">${l.name}</h5><p style="font-size:0.85rem;margin:0">${l.desc}</p>
      </a>`).join('')}
    </div>
  </div></section>`;
}

export function renderBoothFinder() {
  trackSection('booth-finder');
  return `<section class="page-section"><div class="container container-narrow">
    <div class="section-header"><span class="section-badge">📍 Finder</span><h2 class="section-title">Polling Booth Finder</h2><p class="section-subtitle">Find your nearest polling booth by PIN code or area.</p></div>
    <div class="card">
      <div class="booth-finder-form">
        <input type="text" class="form-input" id="booth-pin" placeholder="PIN Code" maxlength="6">
        <input type="text" class="form-input" id="booth-area" placeholder="Area / Locality">
        <input type="text" class="form-input" id="booth-constituency" placeholder="Constituency">
        <button class="btn btn-primary" id="booth-search-btn">🔍 Find</button>
      </div>
      <div id="booth-result"></div>
      <div class="map-container" style="margin-top:20px">
        <iframe id="booth-map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.7!2d77.2295!3d28.6273!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd37b741d057%3A0xcdee88e47393c3f1!2sElection+Commission+of+India!5e0!3m2!1sen!2sin!4v1" allowfullscreen loading="lazy"></iframe>
      </div>
    </div>
    <div class="card" style="margin-top:20px;text-align:center">
      <p style="margin-bottom:12px">For accurate booth information, use the official ECI search:</p>
      <a href="https://electoralsearch.eci.gov.in/" target="_blank" class="btn btn-primary">Search on ECI Portal →</a>
    </div>
  </div></section>`;
}

export function initBoothFinder() {
  document.getElementById('booth-search-btn')?.addEventListener('click', () => {
    const pin = document.getElementById('booth-pin')?.value;
    const area = document.getElementById('booth-area')?.value;
    const constituency = document.getElementById('booth-constituency')?.value;
    const result = document.getElementById('booth-result');
    const map = document.getElementById('booth-map');
    if (!pin && !area && !constituency) { result.innerHTML = '<p style="color:var(--error)">Please enter at least one search parameter.</p>'; return; }
    const mapQuery = [area, constituency, pin, 'India'].filter(Boolean).join(' ');
    const displayQuery = [area, constituency, pin].filter(Boolean).join(', ');
    map.src = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
    result.innerHTML = `<div class="card card-emerald-accent" style="margin-top:12px">
      <p style="margin:0">📍 Showing map for: <strong>${displayQuery}</strong></p>
      <p style="margin:4px 0 0;font-size:0.85rem;color:var(--gray-500)">For exact booth allocation, verify at <a href="https://electoralsearch.eci.gov.in/" target="_blank">electoralsearch.eci.gov.in</a></p>
    </div>`;
  });
}

export function renderEVMDemo() {
  trackSection('evm-demo');
  return `<section class="page-section"><div class="container">
    <div class="section-header"><span class="section-badge">🗳️ Demo</span><h2 class="section-title">EVM & VVPAT Interactive Demo</h2><p class="section-subtitle">Experience how electronic voting works in India.</p></div>
    <div class="evm-container">
      <div style="text-align:center;margin-bottom:20px"><p id="evm-instruction" style="color:var(--gray-600)">👆 Press the blue button next to your chosen candidate to cast your vote</p></div>
      <div class="evm-machine">
        <div class="evm-header">⚡ ELECTRONIC VOTING MACHINE — DEMO</div>
        <div class="evm-body">
          <div class="evm-ballot">
            <div style="padding:8px 16px;background:var(--gray-200);font-weight:600;font-size:0.85rem;color:var(--gray-600)">BALLOT UNIT</div>
            ${evmCandidates.map((c, i) => `<div class="evm-candidate" id="evm-cand-${i}">
              <div class="evm-candidate-info"><div class="evm-candidate-symbol">${c.symbol}</div><div><strong style="font-size:0.9rem">${c.name}</strong><br><small style="color:var(--gray-500)">${c.party}</small></div></div>
              <button class="evm-vote-btn" data-index="${i}" id="evm-btn-${i}">●</button>
            </div>`).join('')}
          </div>
          <div class="evm-vvpat" id="vvpat-area">
            <div style="text-align:center;color:var(--gray-400)">
              <div style="font-size:48px;margin-bottom:8px">📄</div>
              <p style="font-size:0.85rem">VVPAT slip will appear here<br>after you cast your vote</p>
            </div>
          </div>
        </div>
      </div>
      <div style="text-align:center;margin-top:20px"><button class="btn btn-outline" id="evm-reset-btn" style="display:none">🔄 Reset Demo</button></div>
    </div>
  </div></section>`;
}

export function initEVMDemo() {
  let voted = false;
  document.querySelectorAll('.evm-vote-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (voted) return;
      voted = true;
      const idx = parseInt(btn.dataset.index);
      const cand = evmCandidates[idx];

      // Beep sound
      try { const ctx = new AudioContext(); const o = ctx.createOscillator(); const g = ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.frequency.value = 800; g.gain.value = 0.3; o.start(); setTimeout(() => { o.stop(); ctx.close(); }, 150); } catch (e) {}

      btn.classList.add('voted');
      btn.innerHTML = '✓';
      document.getElementById('evm-instruction').innerHTML = '✅ Vote recorded successfully! Check VVPAT slip.';
      document.getElementById('vvpat-area').innerHTML = `<div class="vvpat-slip">
        <div class="vvpat-slip-header">VVPAT Verification Slip</div>
        <div class="vvpat-slip-symbol">${cand.symbol}</div>
        <div class="vvpat-slip-name">${cand.name}</div>
        <small style="color:var(--gray-500)">${cand.party}</small>
        <div style="border-top:1px dashed var(--gray-300);margin-top:8px;padding-top:8px;font-size:0.75rem;color:var(--gray-400)">Slip displayed for 7 seconds</div>
      </div>`;

      document.getElementById('evm-reset-btn').style.display = 'inline-flex';
      unlockBadge('evm_demo');

      // Hide slip after 7s
      setTimeout(() => {
        const area = document.getElementById('vvpat-area');
        if (area && voted) area.innerHTML = '<div style="text-align:center;color:var(--gray-400)"><p>✅ VVPAT slip has been retracted</p></div>';
      }, 7000);
    });
  });

  document.getElementById('evm-reset-btn')?.addEventListener('click', () => {
    voted = false;
    document.querySelectorAll('.evm-vote-btn').forEach(b => { b.classList.remove('voted'); b.innerHTML = '●'; });
    document.getElementById('evm-instruction').innerHTML = '👆 Press the blue button next to your chosen candidate to cast your vote';
    document.getElementById('vvpat-area').innerHTML = '<div style="text-align:center;color:var(--gray-400)"><div style="font-size:48px;margin-bottom:8px">📄</div><p style="font-size:0.85rem">VVPAT slip will appear here<br>after you cast your vote</p></div>';
    document.getElementById('evm-reset-btn').style.display = 'none';
  });
}

export function renderBadgesPage() {
  trackSection('badges');
  return `<section class="page-section"><div class="container container-narrow">
    <div class="section-header"><span class="section-badge">🏅 Achievements</span><h2 class="section-title">Your Achievements</h2><p class="section-subtitle">Earn badges by exploring the platform and learning about elections.</p></div>
    <div class="grid grid-4">${renderBadges()}</div>
  </div></section>`;
}
