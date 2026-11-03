import fs from 'node:fs';
import path from 'node:path';

const distDir = fs.existsSync('dist') ? 'dist' : '99comlabs/dist';
function getFiles(dir) {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(getFiles(fullPath));
    } else if (item.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = getFiles(distDir);
console.log('--- HEADING HIERARCHY AUDIT ---');

let totalIssues = 0;

for (const f of files) {
  const rel = path.relative(distDir, f).replace(/\\/g, '/');
  const html = fs.readFileSync(f, 'utf8');

  // Match all headings in order
  const matches = [...html.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi)];
  const headings = matches.map(m => ({
    tag: m[1].toLowerCase(),
    level: parseInt(m[1][1], 10),
    text: m[2].replace(/<[^>]+>/g, '').trim()
  }));

  console.log(`\nPAGE: ${rel} (${headings.length} headings)`);
  let lastLevel = 0;
  let pageIssues = 0;

  headings.forEach((h, idx) => {
    // Check if level jumps by more than 1 (e.g. h1 -> h3)
    let warning = '';
    if (lastLevel > 0 && h.level > lastLevel + 1) {
      warning = ` [WARNING: Skipped level from h${lastLevel} to h${h.level}]`;
      pageIssues++;
      totalIssues++;
    }
    console.log(`  ${h.tag.toUpperCase()}: ${h.text.slice(0, 50)}${h.text.length > 50 ? '...' : ''}${warning}`);
    lastLevel = h.level;
  });

  if (pageIssues > 0) {
    console.log(`  --> Page has ${pageIssues} heading level skip(s)`);
  }
}

console.log(`\nTotal Heading Level Skips across all pages: ${totalIssues}`);
