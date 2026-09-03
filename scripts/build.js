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

export function build() {
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

  const outPath = path.join(rootDir, 'index.html');
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`✔ Compiled index.html (${html.length} bytes, ${html.split('\n').length} lines)`);
}

// Run or Watch
if (process.argv.includes('--watch')) {
  build();
  console.log('Watching src/ for changes...');
  const srcDir = path.join(rootDir, 'src');
  fs.watch(srcDir, { recursive: true }, (eventType, filename) => {
    if (filename && (filename.endsWith('.html') || filename.endsWith('.svg'))) {
      console.log(`Change detected in ${filename}, recompiling...`);
      build();
    }
  });
} else {
  build();
}
