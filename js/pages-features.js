// VoteGuide AI — Page Renderers Part 2 (AI Chat, Text Analyzer, Translate, Election Dates)
import { askGemini, analyzeText, translateText, clearChatHistory } from './ai-assistant.js';
import { createCalendarUrl } from './calendar.js';
import { electionDates } from './data.js';
import { unlockBadge, trackSection } from './badges.js';
import { formatAIResponse, sanitize } from './utils.js';

let chatQuestionCount = 0;

export function renderAIAssistant() {
  trackSection('ai-assistant');
  return `<section class="chat-page-v2">
    <div class="chat-bg-gradient"></div>
    <div class="container" style="position:relative;z-index:1">

      <!-- Two Column Layout -->
      <div class="chat-layout">

        <!-- Left: Chat Area -->
        <div class="chat-left-col">
          <!-- Chat Header -->
          <div class="chat-box-header">
            <div class="chat-box-avatar">🤖</div>
            <div>
              <strong style="color:var(--navy-800);font-size:var(--text-base)">VoteGuide AI</strong>
              <div class="chat-box-status"><span class="chat-status-dot"></span> Online — English & Hindi</div>
            </div>
          </div>

          <!-- Messages -->
          <div class="chat-messages-area" id="chat-messages">
            <div class="chat-bubble chat-bubble-ai">
              <div class="chat-bubble-avatar">🤖</div>
              <div class="chat-bubble-content">🙏 Namaste! I'm VoteGuide AI, your election education assistant. Ask me anything about Indian elections, voter registration, EVMs, or the democratic process. I support <strong>English</strong> and <strong>Hindi</strong>!</div>
            </div>
          </div>

          <!-- Quick Questions -->
          <div class="chat-quick-area" id="chat-quick-btns">
            <div class="chat-quick-chips">
              <button class="quick-chip" data-q="How do I register to vote?">📝 How to register?</button>
              <button class="quick-chip" data-q="What is NOTA?">🗳️ What is NOTA?</button>
              <button class="quick-chip" data-q="How does EVM work?">⚡ How does EVM work?</button>
              <button class="quick-chip" data-q="What is VVPAT?">📄 What is VVPAT?</button>
              <button class="quick-chip" data-q="What documents do I need to vote?">📋 Documents needed?</button>
              <button class="quick-chip" data-q="मैं पहली बार वोट कैसे करूं?">🌟 पहली बार वोट?</button>
            </div>
          </div>

          <!-- Input -->
          <div class="chat-input-bar">
            <input type="text" class="chat-input-v2" id="chat-input" placeholder="Ask about elections, voting, registration..." autocomplete="off">
            <button class="chat-send-v2" id="chat-send-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>

        <!-- Right: Sidebar -->
        <div class="chat-right-col">
          <div class="chat-sidebar-card">
            <h3 class="chat-sidebar-title">Quick Links</h3>
            <a href="https://voters.eci.gov.in" target="_blank" class="chat-sidebar-link">📋 Voter Registration Portal</a>
            <a href="https://eci.gov.in" target="_blank" class="chat-sidebar-link">🏛️ Election Commission of India</a>
            <a href="#/booth-finder" class="chat-sidebar-link">📍 Find Your Booth</a>
            <a href="#/evm-demo" class="chat-sidebar-link">🗳️ EVM Demo</a>
            <a href="#/election-dates" class="chat-sidebar-link">📅 Election Dates</a>
            <a href="#/how-to-vote" class="chat-sidebar-link">📖 How to Vote Guide</a>
          </div>

          <div class="chat-sidebar-card">
            <h3 class="chat-sidebar-title">Helplines</h3>
            <p class="chat-sidebar-info">📞 Voter Helpline: <strong style="color:var(--saffron-400)">1950</strong></p>
            <p class="chat-sidebar-info">📱 cVIGIL App: Report MCC violations</p>
            <p class="chat-sidebar-info">🌐 NVSP: <a href="https://nvsp.in" target="_blank">nvsp.in</a></p>
            <p class="chat-sidebar-info">📲 Voter Helpline App: iOS & Android</p>
          </div>
        </div>

      </div>
    </div>
  </section>`;
}

export function initChat() {
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send-btn');
  const messages = document.getElementById('chat-messages');
  if (!input || !sendBtn || !messages) return;

  async function sendMessage(text) {
    if (!text.trim()) return;
    input.value = '';
    messages.insertAdjacentHTML('beforeend', `<div class="chat-bubble chat-bubble-user"><div class="chat-bubble-avatar">👤</div><div class="chat-bubble-content">${sanitize(text)}</div></div>`);
    
    // Use a unique ID for each typing indicator so rapid messages don't conflict
    const typingId = 'ai-typing-' + Date.now();
    messages.insertAdjacentHTML('beforeend', `<div class="chat-bubble chat-bubble-ai" id="${typingId}"><div class="chat-bubble-avatar">🤖</div><div class="chat-bubble-content"><div class="spinner spinner-sm" style="margin:4px auto"></div></div></div>`);
    messages.scrollTop = messages.scrollHeight;

    const reply = await askGemini(text);
    const typing = document.getElementById(typingId);
    
    if (typing) {
      typing.outerHTML = `<div class="chat-bubble chat-bubble-ai"><div class="chat-bubble-avatar">🤖</div><div class="chat-bubble-content">${formatAIResponse(reply)}</div></div>`;
    } else {
      // Fallback just in case the typing element was lost
      messages.insertAdjacentHTML('beforeend', `<div class="chat-bubble chat-bubble-ai"><div class="chat-bubble-avatar">🤖</div><div class="chat-bubble-content">${formatAIResponse(reply)}</div></div>`);
    }
    messages.scrollTop = messages.scrollHeight;

    chatQuestionCount++;
    if (chatQuestionCount >= 5) unlockBadge('ai_chat');
  }

  sendBtn.addEventListener('click', () => sendMessage(input.value));
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(input.value); });
  document.querySelectorAll('.quick-chip').forEach(btn => {
    btn.addEventListener('click', () => sendMessage(btn.dataset.q));
  });
}

export function renderTextAnalyzer() {
  trackSection('text-analyzer');
  return `<section class="page-section"><div class="container container-narrow">
    <div class="section-header"><span class="section-badge">📊 Analyzer</span><h2 class="section-title">Election Text Analyzer</h2><p class="section-subtitle">Paste election-related content and get AI-powered analysis.</p></div>
    <div class="card">
      <textarea class="form-textarea" id="analyzer-input" rows="6" placeholder="Paste any election-related text here for analysis..." style="min-height:160px"></textarea>
      <button class="btn btn-primary" id="analyze-btn" style="margin-top:12px;width:100%">🔍 Analyze Text</button>
      <div id="analyzer-result" style="margin-top:20px"></div>
    </div>
  </div></section>`;
}

export function initTextAnalyzer() {
  document.getElementById('analyze-btn')?.addEventListener('click', async () => {
    const text = document.getElementById('analyzer-input')?.value;
    const result = document.getElementById('analyzer-result');
    if (!text?.trim()) { result.innerHTML = '<p style="color:var(--error)">Please enter some text to analyze.</p>'; return; }
    result.innerHTML = '<div style="display:flex;align-items:center;gap:8px"><div class="spinner spinner-sm"></div> Analyzing with AI...</div>';
    const analysis = await analyzeText(text);
    result.innerHTML = `<div class="card card-accent-left" style="white-space:pre-wrap;font-size:0.9rem;line-height:1.7">${formatAIResponse(analysis)}</div>`;
  });
}

export function renderTranslate() {
  trackSection('translate');
  const languages = ['Hindi','Marathi','Tamil','Telugu','Bengali','Gujarati','Kannada','Malayalam'];
  return `<section class="page-section"><div class="container container-narrow">
    <div class="section-header"><span class="section-badge">🌐 Translate</span><h2 class="section-title">Election Content Translator</h2><p class="section-subtitle">Translate election information into Indian languages with text-to-speech.</p></div>
    <div class="card">
      <div class="form-group"><label class="form-label">Source Text (English)</label>
        <textarea class="form-textarea" id="translate-input" rows="4" placeholder="Enter election-related text in English...">Your vote is your voice. Every citizen of India who is 18 years or older has the right to vote. Register today at voters.eci.gov.in and make your democracy stronger.</textarea>
      </div>
      <div class="form-group"><label class="form-label">Target Language</label>
        <select class="form-select" id="translate-lang">${languages.map(l => `<option value="${l}">${l}</option>`).join('')}</select>
      </div>
      <div style="display:flex;gap:12px">
        <button class="btn btn-primary" id="translate-btn" style="flex:1">🌐 Translate</button>
        <button class="btn btn-emerald" id="tts-btn" style="flex:1">🔊 Read Aloud</button>
      </div>
      <div id="translate-result" style="margin-top:20px"></div>
    </div>
  </div></section>`;
}

export function initTranslate() {
  let lastTranslation = '';
  document.getElementById('translate-btn')?.addEventListener('click', async () => {
    const text = document.getElementById('translate-input')?.value;
    const lang = document.getElementById('translate-lang')?.value;
    const result = document.getElementById('translate-result');
    if (!text?.trim()) return;
    result.innerHTML = '<div style="display:flex;align-items:center;gap:8px"><div class="spinner spinner-sm"></div> Translating...</div>';
    const translated = await translateText(text, lang);
    lastTranslation = translated;
    result.innerHTML = `<div class="card card-emerald-accent" style="font-size:1.05rem;line-height:1.8">${translated}</div>`;
    unlockBadge('translator');
  });
  document.getElementById('tts-btn')?.addEventListener('click', () => {
    const text = lastTranslation || document.getElementById('translate-input')?.value;
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const lang = document.getElementById('translate-lang')?.value;
    const langMap = { Hindi:'hi-IN', Marathi:'mr-IN', Tamil:'ta-IN', Telugu:'te-IN', Bengali:'bn-IN', Gujarati:'gu-IN', Kannada:'kn-IN', Malayalam:'ml-IN' };
    utterance.lang = langMap[lang] || 'en-IN';
    utterance.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
}

export function renderElectionDates() {
  trackSection('election-dates');
  const typeColors = { national: 'saffron', state: 'emerald', admin: 'navy', local: 'saffron', special: 'navy' };
  return `<section class="page-section"><div class="container">
    <div class="section-header"><span class="section-badge">📅 Schedule</span><h2 class="section-title">Election Dates & Schedule</h2><p class="section-subtitle">Stay updated with important election timelines.</p></div>
    <div class="grid grid-2">
      ${electionDates.map(d => `<div class="card card-accent-top reveal">
        <span class="badge badge-${typeColors[d.type] || 'navy'}" style="margin-bottom:12px">${d.type.toUpperCase()}</span>
        <h4 style="margin-bottom:8px">${d.title}</h4>
        <p style="font-size:0.9rem">${d.desc}</p>
        <p style="font-weight:600;color:var(--navy-700);margin-bottom:12px">📅 ${d.schedule}</p>
        <a href="${createCalendarUrl(d.title, d.desc, d.date)}" target="_blank" class="btn btn-sm btn-outline">+ Add to Google Calendar</a>
      </div>`).join('')}
    </div>
  </div></section>`;
}
