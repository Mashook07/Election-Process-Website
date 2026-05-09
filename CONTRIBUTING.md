# 🤝 Contributing to VoteGuide AI

Thank you for your interest in contributing to VoteGuide AI — India's Secure Election Platform!

---

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Issue Reporting](#issue-reporting)
- [Style Guidelines](#style-guidelines)

---

## 📜 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you agree to uphold this code. Please report unacceptable behavior to the maintainers.

---

## 🚀 How to Contribute

### 1. Fork the Repository
```bash
git fork https://github.com/Mashook07/Election-Process-Website.git
```

### 2. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Make Your Changes
- Follow the existing code style
- Write clear, descriptive commit messages
- Add comments where logic is complex

### 4. Test Your Changes
```bash
npx http-server . -p 8080 -c-1
```
Open `http://127.0.0.1:8080` and verify all features work correctly.

### 5. Submit a Pull Request
- Push your branch to your fork
- Open a PR against the `main` branch
- Describe what changed and why
- Link any related issues

---

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- Firebase CLI
- A modern browser (Chrome/Firefox/Edge)

### Local Setup
```bash
# Clone the repo
git clone https://github.com/Mashook07/Election-Process-Website.git
cd Election-Process-Website

# Install function dependencies
cd functions && npm install && cd ..

# Copy environment config
cp .env.example .env
# Fill in your Firebase credentials

# Start local server
npx http-server . -p 8080 -c-1
```

---

## 📐 Pull Request Guidelines

- **Keep PRs small and focused** — one feature/fix per PR
- **Update the README** if you add or change a feature
- **Don't break existing tests** or functionality
- **Follow the existing file structure**:
  - `css/` — styles only
  - `js/` — JavaScript modules
  - `functions/` — Firebase Cloud Functions

### Commit Message Format
```
type(scope): short description

Examples:
feat(voting): add candidate photo display
fix(auth): resolve MFA timeout issue
docs(readme): update installation steps
style(css): improve mobile nav spacing
refactor(utils): simplify sanitize function
```

---

## 🐛 Issue Reporting

When opening an issue, please include:

### Bug Report
- **Browser & version**
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)

### Feature Request
- **Problem it solves**
- **Proposed solution**
- **Alternatives considered**

---

## 🎨 Style Guidelines

### JavaScript
- Use ES6+ features (arrow functions, template literals, destructuring)
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable and function names
- Add JSDoc comments for exported functions

### CSS
- Follow the existing design token system in `css/variables.css`
- Use CSS custom properties (`var(--token)`) instead of hard-coded values
- Mobile-first responsive design

### HTML
- Use semantic HTML5 elements
- Always include `aria-label` for interactive elements
- Maintain accessibility standards (WCAG 2.1 AA)

---

## 🔐 Security

If you discover a security vulnerability, please **do NOT open a public issue**. Instead, report it privately via the repository's security advisory feature or contact the maintainer directly.

---

<p align="center">
  Built with ❤️ for Indian Democracy<br>
  <strong>VoteGuide AI</strong> — Empowering Every Citizen
</p>
