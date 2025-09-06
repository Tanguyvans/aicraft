# Docusaurus Essential Commands

## Setup

```bash
npx create-docusaurus@latest website classic --typescript
cd website
npm start
```

## Basic Configuration

### 1. Configure docusaurus.config.ts

```typescript
title: 'AICraft',
tagline: 'AI Agent Package Manager for Claude',
url: 'https://tanguyvans.github.io',
baseUrl: '/aicraft/',
organizationName: 'Tanguyvans',
projectName: 'aicraft',
```

### 2. Add modern theme config

```typescript
themeConfig: {
  colorMode: {
    defaultMode: 'light',
    respectPrefersColorScheme: true,
  },
  navbar: {
    hideOnScroll: true,
  },
}
```

## Modern Design

### 1. Add Inter font and modern colors

```css
/* src/css/custom.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --ifm-color-primary: #6366f1;
  --ifm-font-family-base: 'Inter', sans-serif;
  --ifm-hero-background-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### 2. Style hero section

```css
.hero {
  background: var(--ifm-hero-background-gradient);
  padding: 4rem 0 6rem;
}

.hero__title {
  font-size: 3.5rem !important;
  background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## Terminal Component

### 1. Create terminal component

```bash
mkdir src/components/TerminalCommands
nano src/components/TerminalCommands/index.tsx
```

### 2. Add terminal styles

```css
/* TerminalCommands.module.css */
.terminalWrapper {
  background: #1e293b;
  border-radius: 1rem;
  overflow: hidden;
}

.terminalPrompt {
  color: #10b981;
}

.terminalCommand {
  color: #e2e8f0;
}
```

## Homepage Updates

### 1. Update landing page

```typescript
// src/pages/index.tsx
function HomepageHeader() {
  return (
    <header className={styles.heroBanner}>
      <div className={styles.brandingText}>
        CLAUDE CODE AGENTS
      </div>
      <h1>AICraft</h1>
      <p>AI Agent Package Manager for Claude</p>
    </header>
  );
}
```

### 2. Add commands section

```typescript
const commands = [
  { command: 'npm install -g aicraft', description: 'Install globally' },
  { command: 'npx aicraft list', description: 'View agents' },
  { command: 'npx aicraft install neo4j-expert', description: 'Install agent' },
];
```

## Build and Deploy

### 1. Test build

```bash
npm run build
npm run serve
```

### 2. Deploy to GitHub Pages

```bash
USE_SSH=true npm run deploy
```

### 3. Fix formatting issues

```bash
npx prettier --write .
git add .
git commit -m "Fix formatting"
```

## Notes

- Use TypeScript for better type safety
- Add `hideOnScroll: true` for modern navbar behavior
- Terminal component creates authentic command-line feel
- Always test build before deploying
- Format code with Prettier to pass CI checks
