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

  for (const s of sections) {
    const filePath = path.join(rootDir, s.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: Partial file ${s.file} not found.`);
      continue;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    html = html.replace(s.placeholder, content);
  }

  // Inject cache-busting query parameter for main assets
  const cacheBust = `?v=${Date.now().toString(36)}`;
  html = html.replace(/<!-- {{CACHE_BUST}} -->/g, cacheBust);

  const outPath = path.join(rootDir, 'index.html');
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`✔ Compiled index.html (${html.length} bytes, ${html.split('\n').length} lines)`);
}

// Run or Watch
if (process.argv.includes('--watch')) {
  await build();
  console.log('Watching src/ for changes...');
  const srcDir = path.join(rootDir, 'src');

  const handleRecompile = async (filename) => {
    console.log(`Change detected in ${filename}, recompiling...`);
    await build();
  };

  if (fs.existsSync(srcDir)) {
    fs.watch(srcDir, { recursive: true }, (eventType, filename) => {
      if (filename) handleRecompile(filename);
    });
  }
} else {
  await build();
}
