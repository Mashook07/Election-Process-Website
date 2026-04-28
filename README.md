# 🗳️ VoteGuide AI — India's Secure Election & Voting Platform

![Firebase](https://img.shields.io/badge/Firebase-Deployed-orange?logo=firebase)
![Security](https://img.shields.io/badge/Security-Enterprise%20Grade-green?logo=shield)
![License](https://img.shields.io/badge/License-MIT-blue)

> An AI-powered election education platform with **enterprise-grade security** for secure online voting. Built with vanilla JavaScript, Firebase, and Web Crypto API.

🌐 **Live Demo:** [https://election-process-2026.web.app](https://election-process-2026.web.app)

---

## ✨ Features

### 🔒 Security Architecture
- **AES-256-GCM** end-to-end vote encryption via Web Crypto API
- **SHA-256** integrity hashing for tamper detection
- **Blockchain ledger** with proof-of-work for immutable vote storage
- **Anonymous voting** — voter identity is cryptographically unlinked from votes
- **Multi-Factor Authentication (MFA)** with OTP verification
- **Government ID verification** (Aadhaar with Verhoeff checksum + Voter ID)
- **Face capture** for biometric liveness detection
- **Role-Based Access Control** (Admin, Officer, Voter)
- **CSRF tokens**, **XSS sanitization**, **rate limiting**
- **Content Security Policy**, **HSTS**, **X-Frame-Options**
- **Audit trail** with real-time intrusion detection
- **15-vector threat model** — all mitigated

### 🗳️ Voting System
- Secure voting booth with candidate selection
- AES-256-GCM encrypted votes on blockchain
- Cryptographic vote receipts for verification
- One-person-one-vote enforcement (atomic transactions)
- Blockchain visualization with Merkle tree verification

### 📚 Election Education
- AI-powered election assistant (Gemini AI)
- Interactive EVM/VVPAT simulator
- Election quiz with leaderboard
- State-wise election data & ECI map
- Multi-language support via Google Translate
- First-time voter guide
- Myths vs Facts section

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JavaScript (ES Modules), HTML5, CSS3 |
| 3D Background | Three.js |
| AI Assistant | Google Gemini AI (via Cloud Functions) |
| Authentication | Firebase Auth (Google OAuth + MFA) |
| Database | Cloud Firestore |
| Hosting | Firebase Hosting |
| Backend | Firebase Cloud Functions (Node.js) |
| Cryptography | Web Crypto API (native browser) |
| Blockchain | Custom SHA-256 chained ledger |

---

## 📁 Project Structure

```
├── index.html                  # Main SPA entry point (CSP headers)
├── firebase.json               # Hosting config + security headers
├── firestore.rules             # Database security rules
├── .firebaserc                 # Firebase project config
├── .env.example                # Environment variable template
├── css/
│   ├── styles.css              # Design system & global styles
│   └── pages.css               # Page-specific + security page styles
├── js/
│   ├── app.js                  # SPA router + page loader
│   ├── auth.js                 # Authentication + MFA + RBAC
│   ├── firebase-config.js      # Firebase SDK initialization
│   ├── crypto.js               # AES-256-GCM, SHA-256, RSA, PBKDF2
│   ├── security.js             # Input validation, CSRF, rate limiting
│   ├── audit.js                # Audit trail + intrusion detection
│   ├── blockchain.js           # Tamper-proof vote ledger
│   ├── voting.js               # Secure voting booth + receipts
│   ├── voter-verification.js   # Gov ID + face verification
│   ├── security-pages.js       # Dashboard, admin, MFA setup
│   ├── utils.js                # Sanitization + helpers
│   └── ...                     # Other education modules
└── functions/
    ├── index.js                # Cloud Functions (rate limiting, vote API)
    └── package.json            # Backend dependencies
```

---

## 🔐 Security Features

### Threat Model (15 Vectors — All Mitigated)

| # | Attack | Mitigation |
|---|--------|------------|
| 1 | Credential Stuffing | Firebase Auth rate limiting + MFA |
| 2 | Session Hijacking | CSP headers + short token expiry |
| 3 | Vote Manipulation | AES-256-GCM + blockchain ledger |
| 4 | Double Voting | Atomic Firestore transaction |
| 5 | Voter Impersonation | Gov ID + face capture + MFA |
| 6 | Vote Buying/Coercion | Anonymous tokens (identity-vote unlinked) |
| 7 | Blockchain Tampering | Chained SHA-256 + Merkle tree |
| 8 | XSS | Multi-layer sanitization + CSP |
| 9 | CSRF | CSRF tokens + SameSite cookies |
| 10 | DDoS | Firebase CDN + rate limiting |
| 11 | API Key Exposure | Environment variables + App Check |
| 12 | Insider Threat | Encrypted votes + blind signatures |
| 13 | SQL Injection | Firestore NoSQL (inherently immune) |
| 14 | Man-in-the-Middle | HTTPS/TLS + HSTS headers |
| 15 | Replay Attack | Nonce + timestamp validation |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project on Blaze plan (for Cloud Functions)

### Local Development
```bash
# Clone the repo
git clone https://github.com/Mashook07/Election-Process-Website.git
cd Election-Process-Website

# Install function dependencies
cd functions && npm install && cd ..

# Serve locally
npx http-server . -p 8080 -c-1

# Open http://127.0.0.1:8080
```

### Deploy to Firebase
```bash
# Login to Firebase
firebase login

# Deploy everything
firebase deploy

# Or deploy individually
firebase deploy --only hosting
firebase deploy --only firestore
firebase deploy --only functions
```

---

## 📸 Screenshots

### Homepage
- Dark theme with 3D particle background
- "Vote Now" highlighted in navigation
- AI-powered election guidance

### Voting Booth
- Candidate selection with security indicators
- End-to-end encryption badge (AES-256-GCM)
- Blockchain recording confirmation

### Security Dashboard
- Real-time audit trail viewer
- Blockchain integrity status
- 15-vector threat model visualization
- Security hardening checklist

---

## 📄 License

This project is open source under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

<p align="center">
  Built with ❤️ for Indian Democracy<br>
  <strong>VoteGuide AI</strong> — Empowering Every Citizen
</p>
