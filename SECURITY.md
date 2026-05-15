# 🔐 Security Policy — VoteGuide AI

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.x.x   | ✅ Actively supported |
| < 1.0   | ❌ Not supported   |

---

## 🛡️ Reporting a Vulnerability

VoteGuide AI handles sensitive election data and takes security extremely seriously.

**Please do NOT report security vulnerabilities through public GitHub issues.**

### How to Report

1. **GitHub Security Advisories** *(preferred)*: Use the ["Report a vulnerability"](https://github.com/Mashook07/Election-Process-Website/security/advisories/new) button on this repository.

2. **Email**: Contact the maintainer directly with full details of the vulnerability.

### What to Include in Your Report

- A clear description of the vulnerability
- Steps to reproduce the issue
- The potential impact / attack scenario
- Any proof-of-concept code (if applicable)
- Suggested fix (optional but appreciated)

---

## ⏱️ Response Timeline

| Stage | Timeline |
|-------|----------|
| Acknowledgement | Within 48 hours |
| Initial assessment | Within 5 business days |
| Fix or mitigation | Within 14 days (critical), 30 days (others) |
| Public disclosure | After fix is deployed |

---

## 🔒 Security Architecture

VoteGuide AI implements a **15-vector threat model** covering:

- **Vote integrity**: AES-256-GCM encryption + SHA-256 blockchain ledger
- **Authentication**: Firebase Auth + MFA + Government ID verification
- **Transport security**: HTTPS/TLS + HSTS + strict CSP headers
- **Input validation**: Multi-layer XSS sanitization + CSRF tokens
- **Rate limiting**: Firebase Cloud Functions + client-side debouncing
- **Anonymous voting**: Cryptographic identity-vote unlinking

See [README.md](README.md) for the full threat model table.

---

## 🏅 Responsible Disclosure

We follow a **responsible disclosure** policy:
- Reporters who responsibly disclose issues will be credited in the release notes.
- We will not take legal action against researchers who follow this policy.
- We ask for a reasonable time to fix before public disclosure.

---

<p align="center">
  Built with ❤️ for Indian Democracy<br>
  <strong>VoteGuide AI</strong> — Secure by Design
</p>
