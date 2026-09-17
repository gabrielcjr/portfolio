#!/usr/bin/env node
/**
 * Zero-dependency Static HTML Compiler & Watcher
 * Stitches src/sections/*.html partials into root index.html
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to load simple .env file without external dependencies
function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  const envVars = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eqIdx = line.indexOf('=');
      if (eqIdx !== -1) {
        const key = line.slice(0, eqIdx).trim();
        let val = line.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        envVars[key] = val;
      }
    }
  }
  return envVars;
}

const sections = [
  { placeholder: '<!-- {{NAVBAR}} -->', file: 'src/sections/navbar.html' },
  { placeholder: '<!-- {{HERO}} -->', file: 'src/sections/hero.html' },
  { placeholder: '<!-- {{METRICS}} -->', file: 'src/sections/metrics.html' },
  { placeholder: '<!-- {{PROJECTS}} -->', file: 'src/sections/projects.html' },
  { placeholder: '<!-- {{SKILLS}} -->', file: 'src/sections/skills.html' },
  { placeholder: '<!-- {{EXPERIENCE}} -->', file: 'src/sections/experience.html' },
  { placeholder: '<!-- {{EDUCATION}} -->', file: 'src/sections/education.html' },
  { placeholder: '<!-- {{CONTACT}} -->', file: 'src/sections/contact.html' },
  { placeholder: '<!-- {{FOOTER}} -->', file: 'src/sections/footer.html' },
  { placeholder: '<!-- {{MODALS}} -->', file: 'src/sections/modals.html' }
];

export async function build() {
  const templatePath = path.join(rootDir, 'src/template.html');
  if (!fs.existsSync(templatePath)) {
    console.error(`Error: Template not found at ${templatePath}`);
    process.exit(1);
  }

  let html = fs.readFileSync(templatePath, 'utf8');

  // Load in-code configuration
  let codeConfig = { theme: 'indigo', showSwitcher: true, allowVisitorOverride: true };
  const configPath = path.join(rootDir, 'config/theme.config.js');
  if (fs.existsSync(configPath)) {
    try {
      // Dynamic import with cache busting
      const imported = await import(`${configPath}?t=${Date.now()}`);
      if (imported.themeConfig) {
        codeConfig = { ...codeConfig, ...imported.themeConfig };
      }
    } catch (err) {
      console.warn('Warning: Could not load config/theme.config.js:', err.message);
    }
  }

  // Load .env configuration (takes precedence over theme.config.js if set)
  const envVars = loadEnv();
  const activeTheme = process.env.PORTFOLIO_THEME || envVars.PORTFOLIO_THEME || codeConfig.theme || 'indigo';
  
  const envShowSwitcher = process.env.PORTFOLIO_SHOW_THEME_SWITCHER || envVars.PORTFOLIO_SHOW_THEME_SWITCHER;
  const showSwitcher = envShowSwitcher !== undefined 
    ? envShowSwitcher === 'true' 
    : (codeConfig.showSwitcher !== false);

  const envAllowOverride = process.env.PORTFOLIO_ALLOW_THEME_OVERRIDE || envVars.PORTFOLIO_ALLOW_THEME_OVERRIDE;
  const allowVisitorOverride = envAllowOverride !== undefined 
    ? envAllowOverride === 'true' 
    : (codeConfig.allowVisitorOverride !== false);

  const resolvedConfig = {
    theme: activeTheme,
    showSwitcher,
    allowVisitorOverride
  };

  // Inject Theme data attribute on <html>
  const themeAttr = activeTheme && activeTheme !== 'indigo' ? ` data-theme="${activeTheme}"` : '';
  html = html.replace('<!-- {{THEME_ATTR}} -->', themeAttr);

  // Inject Runtime Theme Config Script into <head>
  const themeScript = `  <script id="portfolio-theme-runtime">
    window.__THEME_CONFIG__ = ${JSON.stringify(resolvedConfig, null, 2)};
    (function() {
      try {
        var cfg = window.__THEME_CONFIG__ || {};
        var stored = cfg.allowVisitorOverride ? localStorage.getItem('portfolio-theme') : null;
        var themeToApply = stored || cfg.theme || 'indigo';
        if (themeToApply && themeToApply !== 'indigo') {
          document.documentElement.setAttribute('data-theme', themeToApply);
        } else {
          document.documentElement.removeAttribute('data-theme');
        }
      } catch (e) {}
    })();
  </script>`;
  html = html.replace('<!-- {{THEME_CONFIG_SCRIPT}} -->', themeScript);

  for (const s of sections) {
    const filePath = path.join(rootDir, s.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: Partial file ${s.file} not found.`);
      continue;
    }
    let content = fs.readFileSync(filePath, 'utf8');

    // If switcher is disabled, conditionally hide or omit it
    if (!showSwitcher && s.file === 'src/sections/navbar.html') {
      content = content.replace(/class="theme-switcher-wrapper"/g, 'class="theme-switcher-wrapper" style="display: none;"');
      content = content.replace(/class="mobile-theme-row"/g, 'class="mobile-theme-row" style="display: none;"');
    }

    html = html.replace(s.placeholder, content);
  }

  const outPath = path.join(rootDir, 'index.html');
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`✔ Compiled index.html [Theme: '${activeTheme}', Switcher: ${showSwitcher}, Override: ${allowVisitorOverride}] (${html.length} bytes, ${html.split('\n').length} lines)`);
}

// Run or Watch
if (process.argv.includes('--watch')) {
  await build();
  console.log('Watching src/, config/, and .env for changes...');
  const watchDirs = [path.join(rootDir, 'src'), path.join(rootDir, 'config')];
  
  const handleRecompile = async (filename) => {
    console.log(`Change detected in ${filename}, recompiling...`);
    await build();
  };

  watchDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.watch(dir, { recursive: true }, (eventType, filename) => {
        if (filename) handleRecompile(filename);
      });
    }
  });

  const envFile = path.join(rootDir, '.env');
  if (fs.existsSync(envFile)) {
    fs.watch(envFile, () => handleRecompile('.env'));
  }
} else {
  await build();
}
