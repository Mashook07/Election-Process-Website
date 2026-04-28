// VoteGuide AI — Page Renderers Part 1 (Home, How to Vote, Registration, Quiz, ECI Map)
import { votingSteps, registrationSteps, quickFacts, officialLinks } from './data.js';
import { unlockBadge, trackSection } from './badges.js';

export function renderHome() {
  trackSection('home');
  return `
  <section class="hero" id="hero-section">
    <div class="hero-canvas" id="three-canvas"></div>
    <div class="hero-content">
      <div class="hero-badge">🇮🇳 India's AI-Powered Election Education Platform</div>
      <h1>Your <span class="text-saffron">Vote</span> Builds<br><span class="text-emerald">Democracy</span></h1>
      <p class="hero-subtitle">Understand elections, register to vote, verify your voter details, and participate confidently with AI-powered guidance. Empowering every Indian citizen.</p>
      <div class="hero-buttons">
        <a href="#/how-to-vote" class="btn btn-primary btn-lg">Start Voting Guide 📋</a>
        <a href="#/registration" class="btn btn-secondary btn-lg">Check Registration 🔍</a>
        <a href="#/ai-assistant" class="btn btn-emerald btn-lg">Ask AI Assistant 🤖</a>
      </div>
      <div class="hero-stats">
        <div class="hero-stat-card reveal"><div class="hero-stat-icon">🗳️</div><div class="hero-stat-num" data-counter="97">0</div><div class="hero-stat-label">Crore+ Registered Voters</div></div>
        <div class="hero-stat-card reveal reveal-delay-1"><div class="hero-stat-icon">🏛️</div><div class="hero-stat-num" data-counter="543">0</div><div class="hero-stat-label">Lok Sabha Seats</div></div>
        <div class="hero-stat-card reveal reveal-delay-2"><div class="hero-stat-icon">📍</div><div class="hero-stat-num" data-counter="10">0</div><div class="hero-stat-label">Lakh+ Polling Stations</div></div>
        <div class="hero-stat-card reveal reveal-delay-3"><div class="hero-stat-icon">🗺️</div><div class="hero-stat-num">28 + 8</div><div class="hero-stat-label">States & Union Territories</div></div>
        <div class="hero-stat-card reveal reveal-delay-4"><div class="hero-stat-icon">📞</div><div class="hero-stat-num" data-counter="1950">0</div><div class="hero-stat-label">Voter Helpline Number</div></div>
        <div class="hero-stat-card reveal reveal-delay-5"><div class="hero-stat-icon">🎂</div><div class="hero-stat-num" data-counter="18">0</div><div class="hero-stat-label">Years Minimum Voting Age</div></div>
      </div>
    </div>
  </section>
  <section class="why-vote page-section">
    <div class="container">
      <div class="section-header"><span class="section-badge">🇮🇳 Democracy</span><h2 class="section-title">Why Your Vote Matters</h2><p class="section-subtitle">Every vote shapes the future of India. Here's why your participation is crucial.</p></div>
      <div class="why-vote-grid">
        <div class="why-vote-card reveal"><div class="why-vote-icon">⚖️</div><h4>Shape Governance</h4><p>Your vote determines who makes laws and policies that affect your daily life — from education to healthcare.</p></div>
        <div class="why-vote-card reveal reveal-delay-1"><div class="why-vote-icon">🛡️</div><h4>Protect Your Rights</h4><p>Voting ensures elected leaders remain accountable to the people and upholds the constitutional values of democracy.</p></div>
        <div class="why-vote-card reveal reveal-delay-2"><div class="why-vote-icon">🌱</div><h4>Build the Future</h4><p>Each election is an opportunity to choose the direction of India's development, progress, and global standing.</p></div>
      </div>
    </div>
  </section>`;
}

export function renderHowToVote() {
  trackSection('how-to-vote');
  return `<section class="page-section"><div class="container">
    <div class="section-header"><span class="section-badge">📋 Guide</span><h2 class="section-title">How to Vote in India</h2><p class="section-subtitle">Follow these simple steps to exercise your democratic right.</p></div>
    <div class="grid grid-3">
      ${votingSteps.map((s, i) => `<div class="step-card reveal reveal-delay-${i % 3 + 1}">
        <div class="step-number">${i + 1}</div><span class="step-icon">${s.icon}</span>
        <h4>${s.title}</h4><p>${s.desc}</p>
        ${s.link ? `<a href="${s.link}" target="_blank" class="step-link">Official Link →</a>` : ''}
      </div>`).join('')}
    </div>
    <div style="text-align:center;margin-top:48px">
      <a href="#/evm-demo" class="btn btn-primary btn-lg">Try EVM & VVPAT Demo 🗳️</a>
    </div>
  </div></section>`;
}

export function renderRegistration() {
  trackSection('registration');
  return `<section class="page-section"><div class="container">
    <div class="section-header"><span class="section-badge">📝 Register</span><h2 class="section-title">Voter Registration Guide</h2><p class="section-subtitle">Get your Voter ID and join the electoral roll in 6 simple steps.</p></div>
    <div class="grid grid-3">
      ${registrationSteps.map((s, i) => `<div class="step-card reveal reveal-delay-${i % 3 + 1}">
        <div class="step-number">${i + 1}</div><span class="step-icon">${s.icon}</span>
        <h4>${s.title}</h4><p>${s.desc}</p>
      </div>`).join('')}
    </div>
    <div class="card" style="margin-top:48px;text-align:center">
      <h3 style="margin-bottom:16px">Official Registration Links</h3>
      <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
        <a href="https://voters.eci.gov.in/" target="_blank" class="btn btn-primary">NVSP Portal</a>
        <a href="https://electoralsearch.eci.gov.in/" target="_blank" class="btn btn-outline">Electoral Search</a>
        <a href="https://affidavit.eci.gov.in/" target="_blank" class="btn btn-outline">Affidavits</a>
      </div>
    </div>
    <div class="card" style="margin-top:32px">
      <h3 style="margin-bottom:8px">🪪 Voter ID Verification (OCR)</h3>
      <p>Upload your Voter ID image to extract information using AI-powered OCR.</p>
      <div class="file-upload" id="ocr-upload-area">
        <span class="file-upload-icon">📤</span>
        <p class="file-upload-text"><strong>Click to upload</strong> or drag your Voter ID image</p>
        <input type="file" id="ocr-file-input" accept="image/*" style="display:none">
      </div>
      <div id="ocr-result" style="margin-top:16px"></div>
    </div>
  </div></section>`;
}

export function initOCR() {
  const area = document.getElementById('ocr-upload-area');
  const input = document.getElementById('ocr-file-input');
  if (!area || !input) return;
  area.addEventListener('click', () => input.click());
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const result = document.getElementById('ocr-result');
    result.innerHTML = '<div style="display:flex;align-items:center;gap:8px"><div class="spinner spinner-sm"></div> Processing image with AI OCR...</div>';
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      const { ocrVoterID } = await import('./ai-assistant.js');
      const text = await ocrVoterID(base64);
      result.innerHTML = `<div class="card card-accent-left" style="text-align:left;white-space:pre-wrap;font-size:0.9rem">${text}</div>`;
    };
    reader.readAsDataURL(file);
  });
}

export function renderQuiz() {
  trackSection('quiz');
  return `<section class="page-section"><div class="container">
    <div class="section-header"><span class="section-badge">🧠 Quiz</span><h2 class="section-title">Election Awareness Quiz</h2><p class="section-subtitle">Test your knowledge about Indian elections and democracy!</p></div>
    <div class="quiz-container" id="quiz-area">
      <div class="quiz-card" style="text-align:center">
        <div style="font-size:64px;margin-bottom:16px">🏆</div>
        <h3>Ready to Test Your Election Knowledge?</h3>
        <p>15 questions about Indian elections, voting process, and democracy.</p>
        <button class="btn btn-primary btn-lg" id="start-quiz-btn">Start Quiz →</button>
      </div>
    </div>
  </div></section>`;
}

export function initQuiz() {
  document.getElementById('start-quiz-btn')?.addEventListener('click', async () => {
    try {
      const { startQuiz } = await import('./quiz.js');
      startQuiz();
    } catch (e) {
      console.error('Quiz load error:', e);
      document.getElementById('quiz-area').innerHTML = '<div class="quiz-card" style="text-align:center"><p>Failed to load quiz. Please refresh the page.</p></div>';
    }
  });
}

export function renderECIMap() {
  trackSection('eci-map');
  const locations = [
    { id:'eci-hq', icon:'🏛️', name:'Election Commission of India', addr:'Nirvachan Sadan, Ashoka Road, New Delhi - 110001', desc:'Main headquarters of the Election Commission responsible for conducting free and fair elections.', tag:'Headquarters', mapQ:'Nirvachan+Sadan+Election+Commission+of+India+New+Delhi', coords:'28.6225,77.2117' },
    { id:'ceo-mh', icon:'⚖️', name:'Chief Electoral Officer, Maharashtra', addr:'New Administrative Building, Mumbai - 400032', desc:'State-level office managing all elections in Maharashtra — Lok Sabha, Vidhan Sabha, and local body elections.', tag:'State Office', mapQ:'Chief+Electoral+Officer+Maharashtra+Mumbai', coords:'19.0760,72.8777' },
    { id:'deo-mum', icon:'🏢', name:'District Election Office, Mumbai', addr:'Collector Office, CST Area, Mumbai', desc:'District-level election authority handling voter rolls, booth assignments, and election logistics for Mumbai.', tag:'District Office', mapQ:'District+Collector+Office+Mumbai+Election', coords:'18.9322,72.8347' },
    { id:'ero', icon:'📋', name:'Electoral Registration Office', addr:'Available in every district across India', desc:'Register as a new voter, update your existing details, or apply for corrections in the electoral roll.', tag:'Registration', mapQ:'Electoral+Registration+Office+near+me+India', coords:'20.5937,78.9629' },
    { id:'help-center', icon:'🆘', name:'Election Help Center', addr:'Available at Tehsil / Taluka level', desc:'Walk-in support for voter ID queries, booth allocation, EPIC corrections, and general election guidance.', tag:'Help Center', mapQ:'Election+Help+Center+near+me+India', coords:'20.5937,78.9629' },
    { id:'booth-near', icon:'📍', name:'Polling Booth Near Me', addr:'Assigned based on your address in electoral roll', desc:'Find your designated polling station where you cast your vote on election day.', tag:'Polling Booth', mapQ:'Polling+Booth+near+me+India', coords:'20.5937,78.9629' }
  ];

  return `<section class="page-section" style="background:var(--gray-50)"><div class="container">
    <div class="section-header">
      <span class="section-badge">🗺️ ECI MAP + BOOTH FINDER</span>
      <h2 class="section-title">Election Commission & Polling Booth Finder</h2>
      <p class="section-subtitle">Find official election offices, polling booth guidance, and voter support centers near you.</p>
    </div>

    <!-- LIVE MAP PREVIEW -->
    <div class="card" style="padding:0;overflow:hidden;margin-bottom:32px;border:2px solid var(--navy-200)">
      <div style="background:var(--navy-800);padding:16px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:22px">🗺️</span>
          <div><h4 class="eci-black-text" style="color:#ffffff;margin:0;font-size:1rem">Live Map Preview</h4><p class="eci-black-text" style="color:var(--gray-400);margin:0;font-size:0.8rem">ECI Headquarters — Nirvachan Sadan, New Delhi</p></div>
        </div>
        <a href="https://www.google.com/maps/search/Nirvachan+Sadan+Election+Commission+of+India+New+Delhi" target="_blank" class="btn btn-primary" style="font-size:0.85rem;padding:8px 16px">Open Full Map ↗</a>
      </div>
      <div class="map-container"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.7!2d77.2117!3d28.6225!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd37b741d057%3A0xcdee88e47393c3f1!2sElection+Commission+of+India!5e0!3m2!1sen!2sin!4v1" allowfullscreen loading="lazy" style="height:350px;border:none;width:100%"></iframe></div>
    </div>

    <!-- LOCATION CARDS -->
    <h3 style="margin-bottom:4px;display:flex;align-items:center;gap:8px">🏢 Official Election Locations</h3>
    <p style="color:var(--gray-500);margin-bottom:20px;font-size:0.9rem">Click any card to open the exact location on Google Maps</p>
    <div class="grid grid-3" style="margin-bottom:40px">
      ${locations.map(loc => `
      <div class="card eci-loc-card" style="display:flex;flex-direction:column;justify-content:space-between;border-top:4px solid var(--saffron-500);transition:transform .2s,box-shadow .2s" onmouseenter="this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 30px rgba(0,0,0,0.1)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
            <span style="font-size:32px">${loc.icon}</span>
            <span class="eci-tag-badge">✓ ${loc.tag}</span>
          </div>
          <h4 style="margin-bottom:6px;font-size:1rem;color:var(--navy-800)">${loc.name}</h4>
          <p style="font-size:0.8rem;color:var(--gray-400);margin-bottom:8px;display:flex;align-items:flex-start;gap:4px"><span>📍</span>${loc.addr}</p>
          <p style="font-size:0.85rem;color:var(--gray-600);margin-bottom:16px;line-height:1.5">${loc.desc}</p>
        </div>
        <a href="https://www.google.com/maps/search/${loc.mapQ}" target="_blank" rel="noopener" class="btn btn-primary" style="width:100%;text-align:center;font-size:0.85rem">Open in Google Maps ↗</a>
      </div>`).join('')}
    </div>

    <!-- SMART POLLING BOOTH FINDER -->
    <div class="card" style="border:2px solid var(--saffron-300);padding:0;overflow:hidden;margin-bottom:32px">
      <div style="background:linear-gradient(135deg,var(--navy-800),var(--navy-700));padding:24px 32px;display:flex;align-items:center;gap:14px">
        <span style="font-size:36px">🔍</span>
        <div><h3 class="eci-black-text" style="color:#ffffff;margin:0">Smart Polling Booth Finder</h3><p class="eci-black-text" style="color:var(--gray-400);margin:2px 0 0;font-size:0.9rem">Enter your details below to find nearby polling stations</p></div>
      </div>
      <div style="padding:24px 32px">
        <div class="grid grid-3" style="gap:12px;margin-bottom:16px">
          <div><label style="font-size:0.8rem;font-weight:600;color:var(--gray-600);display:block;margin-bottom:4px">PIN Code</label><input type="text" class="form-input" id="finder-pin" placeholder="e.g. 400001" maxlength="6" style="width:100%"></div>
          <div><label style="font-size:0.8rem;font-weight:600;color:var(--gray-600);display:block;margin-bottom:4px">Area / Locality</label><input type="text" class="form-input" id="finder-area" placeholder="e.g. Andheri West" style="width:100%"></div>
          <div><label style="font-size:0.8rem;font-weight:600;color:var(--gray-600);display:block;margin-bottom:4px">Constituency (Optional)</label><input type="text" class="form-input" id="finder-constituency" placeholder="e.g. Mumbai North" style="width:100%"></div>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <button class="btn btn-primary btn-lg" id="finder-search-btn" style="flex:1;min-width:200px">🔍 Find Polling Booth</button>
          <button class="btn btn-emerald btn-lg" id="finder-nearby-btn" style="flex:1;min-width:200px">📍 Use My Location</button>
        </div>
        <div id="finder-result" style="margin-top:20px"></div>
      </div>
    </div>

    <!-- VOTER HELPLINE -->
    <div class="card" style="background:linear-gradient(135deg,var(--navy-800) 0%,#1a2744 100%);color:var(--white);padding:32px;margin-bottom:32px">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px">
        <div style="display:flex;align-items:center;gap:20px">
          <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--saffron-500),var(--saffron-600));display:flex;align-items:center;justify-content:center;font-size:32px;box-shadow:0 0 30px rgba(255,153,51,0.4)">📞</div>
          <div>
            <p style="color:var(--saffron-400);text-transform:uppercase;font-size:0.75rem;font-weight:700;letter-spacing:0.1em;margin:0">National Voter Helpline</p>
            <h2 style="color:var(--white);margin:4px 0;font-size:2.5rem;font-family:var(--font-heading);letter-spacing:2px">1950</h2>
            <p style="color:var(--gray-400);margin:0;font-size:0.85rem">Toll-free • Available 24/7 • Multi-language support</p>
          </div>
        </div>
        <a href="tel:1950" class="btn" style="background:var(--gradient-saffron);color:var(--white);font-size:1rem;padding:14px 32px;box-shadow:0 0 20px rgba(255,153,51,0.3)">📞 Call Now</a>
      </div>
    </div>

    <!-- TRUSTED GOVERNMENT RESOURCES -->
    <h3 style="margin-bottom:4px;display:flex;align-items:center;gap:8px">🔗 Trusted Government Resources</h3>
    <p style="color:var(--gray-500);margin-bottom:20px;font-size:0.9rem">Official portals verified by the Election Commission of India</p>
    <div class="grid grid-4" style="margin-bottom:32px">
      <a href="https://voters.eci.gov.in" target="_blank" class="card" style="text-decoration:none;text-align:center;border-top:3px solid var(--emerald-500);transition:transform .2s" onmouseenter="this.style.transform='translateY(-3px)'" onmouseleave="this.style.transform=''">
        <span style="display:flex;align-items:center;justify-content:center;gap:4px;margin-bottom:8px"><span class="eci-tag-badge" style="font-size:0.65rem;padding:2px 8px">✓ OFFICIAL</span></span>
        <span style="font-size:28px;display:block;margin-bottom:8px">🗳️</span>
        <h5 style="margin-bottom:4px">NVSP Portal</h5>
        <p style="font-size:0.75rem;color:var(--gray-500);margin:0;word-break:break-all">voters.eci.gov.in</p>
      </a>
      <a href="https://electoralsearch.eci.gov.in" target="_blank" class="card" style="text-decoration:none;text-align:center;border-top:3px solid var(--emerald-500);transition:transform .2s" onmouseenter="this.style.transform='translateY(-3px)'" onmouseleave="this.style.transform=''">
        <span style="display:flex;align-items:center;justify-content:center;gap:4px;margin-bottom:8px"><span style="background:var(--emerald-glow);color:var(--emerald-700);padding:2px 8px;border-radius:12px;font-size:0.65rem;font-weight:700">✓ OFFICIAL</span></span>
        <span style="font-size:28px;display:block;margin-bottom:8px">🔎</span>
        <h5 style="margin-bottom:4px">Electoral Search</h5>
        <p style="font-size:0.75rem;color:var(--gray-500);margin:0;word-break:break-all">electoralsearch.eci.gov.in</p>
      </a>
      <a href="https://eci.gov.in" target="_blank" class="card" style="text-decoration:none;text-align:center;border-top:3px solid var(--emerald-500);transition:transform .2s" onmouseenter="this.style.transform='translateY(-3px)'" onmouseleave="this.style.transform=''">
        <span style="display:flex;align-items:center;justify-content:center;gap:4px;margin-bottom:8px"><span style="background:var(--emerald-glow);color:var(--emerald-700);padding:2px 8px;border-radius:12px;font-size:0.65rem;font-weight:700">✓ OFFICIAL</span></span>
        <span style="font-size:28px;display:block;margin-bottom:8px">🏛️</span>
        <h5 style="margin-bottom:4px">ECI Main Website</h5>
        <p style="font-size:0.75rem;color:var(--gray-500);margin:0;word-break:break-all">eci.gov.in</p>
      </a>
      <a href="https://nvsp.in" target="_blank" class="card" style="text-decoration:none;text-align:center;border-top:3px solid var(--emerald-500);transition:transform .2s" onmouseenter="this.style.transform='translateY(-3px)'" onmouseleave="this.style.transform=''">
        <span style="display:flex;align-items:center;justify-content:center;gap:4px;margin-bottom:8px"><span style="background:var(--emerald-glow);color:var(--emerald-700);padding:2px 8px;border-radius:12px;font-size:0.65rem;font-weight:700">✓ OFFICIAL</span></span>
        <span style="font-size:28px;display:block;margin-bottom:8px">📝</span>
        <h5 style="margin-bottom:4px">NVSP Registration</h5>
        <p style="font-size:0.75rem;color:var(--gray-500);margin:0;word-break:break-all">nvsp.in</p>
      </a>
    </div>

  </div></section>`;
}

export function initECIMap() {
  // Booth Finder search
  document.getElementById('finder-search-btn')?.addEventListener('click', () => {
    const pin = document.getElementById('finder-pin')?.value?.trim();
    const area = document.getElementById('finder-area')?.value?.trim();
    const constituency = document.getElementById('finder-constituency')?.value?.trim();
    if (!pin && !area && !constituency) { document.getElementById('finder-result').innerHTML = '<p style="color:var(--error);font-size:0.9rem">⚠️ Please enter at least one field (PIN code, area, or constituency)</p>'; return; }
    const q = [area, constituency, pin, 'polling booth'].filter(Boolean).join(', ');
    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(q + ' India')}`;
    document.getElementById('finder-result').innerHTML = `
      <div class="card" style="border-left:4px solid var(--emerald-500);background:var(--emerald-glow)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-size:20px">✅</span><strong style="color:var(--emerald-700)">Results Found</strong></div>
        <p style="margin:0 0 8px;font-size:0.9rem">Showing polling booth locations for: <strong>${q}</strong></p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px">
          <a href="${mapsUrl}" target="_blank" class="btn btn-primary" style="font-size:0.85rem">📍 Open in Google Maps</a>
          <a href="https://electoralsearch.eci.gov.in/" target="_blank" class="btn btn-outline" style="font-size:0.85rem">🔎 Verify on ECI Portal</a>
        </div>
        <p style="font-size:0.8rem;color:var(--gray-500);margin:0">💡 <strong>Tip:</strong> For your exact booth allocation, search your name on <a href="https://electoralsearch.eci.gov.in/" target="_blank" style="color:var(--saffron-600)">electoralsearch.eci.gov.in</a></p>
      </div>`;
  });

  // Use My Location
  document.getElementById('finder-nearby-btn')?.addEventListener('click', () => {
    const result = document.getElementById('finder-result');
    if (!navigator.geolocation) { result.innerHTML = '<p style="color:var(--error)">⚠️ Geolocation is not supported by your browser.</p>'; return; }
    result.innerHTML = '<div style="display:flex;align-items:center;gap:8px"><div class="spinner spinner-sm"></div> Detecting your location...</div>';
    navigator.geolocation.getCurrentPosition((pos) => {
      const {latitude, longitude} = pos.coords;
      const mapsUrl = `https://www.google.com/maps/search/polling+booth+near+me/@${latitude},${longitude},14z`;
      result.innerHTML = `
        <div class="card" style="border-left:4px solid var(--saffron-500);background:var(--saffron-glow)">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-size:20px">📍</span><strong style="color:var(--saffron-700)">Location Detected</strong></div>
          <p style="margin:0 0 8px;font-size:0.9rem">Coordinates: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px">
            <a href="${mapsUrl}" target="_blank" class="btn btn-primary" style="font-size:0.85rem">📍 Find Booths Near Me</a>
            <a href="https://www.google.com/maps/search/election+office+near+me/@${latitude},${longitude},14z" target="_blank" class="btn btn-outline" style="font-size:0.85rem">🏢 Find Election Office</a>
          </div>
          <p style="font-size:0.8rem;color:var(--gray-500);margin:0">💡 For exact booth: check <a href="https://electoralsearch.eci.gov.in/" target="_blank" style="color:var(--saffron-600)">electoralsearch.eci.gov.in</a></p>
        </div>`;
    }, () => { result.innerHTML = '<p style="color:var(--error)">⚠️ Location access denied. Please enter your details manually.</p>'; });
  });

  // Enter key support
  ['finder-pin','finder-area','finder-constituency'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('finder-search-btn')?.click(); });
  });
}

