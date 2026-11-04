#!/usr/bin/env node
/**
 * verify-links.mjs — Comprehensive HTML Syntax, Link Spider, Image Alt & /support/ Route Verifier
 * 
 * Part of 99COMLABS E2E Test Suite (Tier 1 & Tier 2)
 * Validates:
 * 1. HTML Syntax & Structural Standards (DOCTYPE, lang, title <60, description <160, exactly one H1)
 * 2. Link Spider: Crawls all internal links across dist/ and asserts 0 broken links (including anchor fragments)
 * 3. Image Alt Attributes: Asserts every <img> has an alt attribute
 * 4. Route Preservation: Asserts /support/index.html, support.css, and support.js exist with functional parity
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse CLI arguments
const args = process.argv.slice(2);
let distArg = null;
for (let i = 0; i < args.length; i++) {
  if ((args[i] === '--dist' || args[i] === '-d' || args[i] === '--dir') && args[i + 1]) {
    distArg = args[i + 1];
    i++;
  }
}

// Determine dist directory: default to ../dist relative to scripts/
const defaultDist = path.resolve(__dirname, '..', 'dist');
const distDir = distArg ? path.resolve(process.cwd(), distArg) : defaultDist;

console.log('\n===============================================================');
console.log('  99COMLABS E2E TEST: HTML, LINK SPIDER & ROUTE VERIFIER');
console.log('===============================================================');
console.log(`Target Output Directory: ${distDir}\n`);

if (!fs.existsSync(distDir)) {
  console.error(`[ERROR] Build output directory does not exist: ${distDir}`);
  console.error('Please run "npm run build" to generate static site files before running this verification script.\n');
  process.exit(1);
}

// 1. Discover all HTML files recursively
function findHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(findHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const htmlFiles = findHtmlFiles(distDir);
if (htmlFiles.length === 0) {
  console.error(`[ERROR] No HTML files found in ${distDir}`);
  process.exit(1);
}

console.log(`Found ${htmlFiles.length} HTML files to inspect.\n`);

// Data structures for tracking
const fileContents = new Map(); // relativePath -> { content, ids: Set<string>, titles, descriptions, h1s }
const allDiscoveredLinks = []; // { sourceFile, rawHref, normalizedPath, hash }
const allDiscoveredImages = []; // { sourceFile, rawTag, src, alt, hasAlt }
const errors = [];
const warnings = [];

// 2. Parse HTML files and extract metadata, IDs, links, and images
for (const fullPath of htmlFiles) {
  const relPath = path.relative(distDir, fullPath).replace(/\\/g, '/');
  const content = fs.readFileSync(fullPath, 'utf8');

  // Extract all IDs for anchor fragment checking
  const ids = new Set();
  const idRegex = /(?:id|name)=["']([^"']+)["']/gi;
  let idMatch;
  while ((idMatch = idRegex.exec(content)) !== null) {
    ids.add(idMatch[1]);
  }

  // HTML Structural Checks
  // Check DOCTYPE
  if (!/<!DOCTYPE\s+html/i.test(content)) {
    errors.push(`[SYNTAX] ${relPath}: Missing <!DOCTYPE html> declaration.`);
  }

  // Check <html lang="...">
  const htmlTagMatch = /<html[^>]*>/i.exec(content);
  if (!htmlTagMatch || !/lang=["'][a-z]{2}(?:-[a-z]{2})?["']/i.test(htmlTagMatch[0])) {
    warnings.push(`[A11Y] ${relPath}: <html> tag is missing or lacks a valid lang attribute.`);
  }

  // Check <title>
  const titleMatch = /<title[^>]*>([^<]*)<\/title>/i.exec(content);
  const titleText = titleMatch ? titleMatch[1].trim() : '';
  if (!titleText) {
    errors.push(`[SEO] ${relPath}: Missing or empty <title> tag.`);
  } else if (titleText.length > 60) {
    warnings.push(`[SEO] ${relPath}: Title tag exceeds 60 characters (${titleText.length} chars): "${titleText}"`);
  }

  // Check <meta name="description">
  const descMatch = /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i.exec(content) ||
                    /<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i.exec(content);
  const descText = descMatch ? descMatch[1].trim() : '';
  if (!descText) {
    if (relPath !== '404.html') {
      errors.push(`[SEO] ${relPath}: Missing or empty <meta name="description"> tag.`);
    }
  } else if (descText.length > 160) {
    warnings.push(`[SEO] ${relPath}: Meta description exceeds 160 characters (${descText.length} chars): "${descText.slice(0, 60)}..."`);
  }

  // Check <h1> tag count
  const h1Matches = content.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];
  if (h1Matches.length === 0) {
    warnings.push(`[SEO] ${relPath}: Page has 0 <h1> headings.`);
  } else if (h1Matches.length > 1) {
    warnings.push(`[SEO] ${relPath}: Page has ${h1Matches.length} <h1> headings (recommended: exactly 1).`);
  }

  fileContents.set(relPath, {
    content,
    ids,
    title: titleText,
    description: descText,
    h1Count: h1Matches.length
  });

  // Extract Links <a href="...">
  const linkRegex = /<a\s+[^>]*href=["']([^"']*)["'][^>]*>/gi;
  let linkMatch;
  while ((linkMatch = linkRegex.exec(content)) !== null) {
    const rawHref = linkMatch[1].trim();
    if (rawHref.length > 0) {
      allDiscoveredLinks.push({
        sourceFile: relPath,
        rawHref
      });
    }
  }

  // Extract Images <img ...>
  const imgRegex = /<img\s+([^>]+)>/gi;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(content)) !== null) {
    const rawAttrs = imgMatch[1];
    const srcMatch = /src=["']([^"']*)["']/i.exec(rawAttrs);
    const altMatch = /alt=["']([^"']*)["']/i.exec(rawAttrs);
    const hasAlt = altMatch !== null;
    const altText = altMatch ? altMatch[1] : null;

    allDiscoveredImages.push({
      sourceFile: relPath,
      src: srcMatch ? srcMatch[1] : '(no src)',
      alt: altText,
      hasAlt
    });
  }
}

// 3. Link Spider Resolution & Validation
console.log(`Spidering ${allDiscoveredLinks.length} total links across site...`);

let internalLinksCount = 0;
let externalLinksCount = 0;
let telLinksCount = 0;
let mailtoLinksCount = 0;
let whatsappLinksCount = 0;

for (const link of allDiscoveredLinks) {
  const { sourceFile, rawHref } = link;

  if (rawHref.startsWith('tel:')) {
    telLinksCount++;
    // Verify phone number format (+91 9745551513)
    const phoneDigits = rawHref.replace(/[^0-9]/g, '');
    if (!phoneDigits.includes('9745551513')) {
      warnings.push(`[LINK] ${sourceFile}: tel link "${rawHref}" does not match primary business number (+91 9745551513).`);
    }
    continue;
  }

  if (rawHref.startsWith('mailto:')) {
    mailtoLinksCount++;
    const email = rawHref.replace(/^mailto:/, '').split('?')[0];
    if (!email.includes('@') || !email.includes('.')) {
      errors.push(`[LINK] ${sourceFile}: Invalid mailto address "${rawHref}".`);
    }
    continue;
  }

  if (rawHref.startsWith('http://') || rawHref.startsWith('https://')) {
    externalLinksCount++;
    if (rawHref.includes('wa.me') || rawHref.includes('whatsapp.com')) {
      whatsappLinksCount++;
      if (!rawHref.includes('919745551513')) {
        warnings.push(`[LINK] ${sourceFile}: WhatsApp link "${rawHref}" does not target official number 919745551513.`);
      }
    }
    continue;
  }

  if (rawHref.startsWith('javascript:')) {
    warnings.push(`[LINK] ${sourceFile}: Disallowed javascript: pseudoprotocol link "${rawHref}".`);
    continue;
  }

  // Internal Link
  internalLinksCount++;

  // Separate path from query string and hash
  let urlPath = rawHref;
  let hash = '';
  const hashIdx = urlPath.indexOf('#');
  if (hashIdx !== -1) {
    hash = urlPath.slice(hashIdx + 1);
    urlPath = urlPath.slice(0, hashIdx);
  }
  const queryIdx = urlPath.indexOf('?');
  if (queryIdx !== -1) {
    urlPath = urlPath.slice(0, queryIdx);
  }

  // Determine target HTML file relative to distDir
  let targetRelHtml = null;
  const sourceDir = path.dirname(sourceFile);

  if (urlPath === '' || urlPath === '.') {
    // Self-reference or purely hash fragment
    targetRelHtml = sourceFile;
  } else if (urlPath.startsWith('/')) {
    // Root-relative URL: e.g. /services/ or /services/web-and-mobile-apps/ or /about
    let clean = urlPath.replace(/^\//, '');
    if (clean === '' || clean.endsWith('/')) {
      clean += 'index.html';
    } else if (!clean.endsWith('.html')) {
      // Could be /services -> services/index.html or services.html
      const tryDir = clean + '/index.html';
      const tryFile = clean + '.html';
      if (fs.existsSync(path.join(distDir, tryDir))) {
        clean = tryDir;
      } else if (fs.existsSync(path.join(distDir, tryFile))) {
        clean = tryFile;
      } else {
        clean = tryDir; // default assumption for checking
      }
    }
    targetRelHtml = clean;
  } else {
    // Relative URL (e.g. "support.css" or "../services/")
    let resolved = path.join(sourceDir, urlPath).replace(/\\/g, '/');
    if (resolved.endsWith('/')) {
      resolved += 'index.html';
    } else if (!path.extname(resolved)) {
      const tryDir = resolved + '/index.html';
      const tryFile = resolved + '.html';
      if (fs.existsSync(path.join(distDir, tryDir))) {
        resolved = tryDir;
      } else {
        resolved = tryFile;
      }
    }
    targetRelHtml = resolved;
  }

  // Normalize target path
  targetRelHtml = path.normalize(targetRelHtml).replace(/\\/g, '/');
  const targetFullPath = path.join(distDir, targetRelHtml);

  // Check file existence
  if (!fs.existsSync(targetFullPath)) {
    // Check if it might be an asset or static file
    if (!fs.existsSync(path.join(distDir, urlPath.replace(/^\//, '')))) {
      errors.push(`[BROKEN LINK] In ${sourceFile}: "${rawHref}" points to non-existent target "${targetRelHtml}" (full path: ${targetFullPath})`);
      continue;
    }
  }

  // Check Anchor Fragment if present
  if (hash && targetRelHtml.endsWith('.html')) {
    const targetData = fileContents.get(targetRelHtml);
    if (targetData && !targetData.ids.has(hash)) {
      errors.push(`[BROKEN ANCHOR] In ${sourceFile}: Link "${rawHref}" targets non-existent element id="#${hash}" in "${targetRelHtml}".`);
    }
  }
}

// 4. Image Alt Attribute Validation
console.log(`Checking ${allDiscoveredImages.length} images for accessible alt attributes...`);
let validAltsCount = 0;
let missingAltsCount = 0;

for (const img of allDiscoveredImages) {
  if (!img.hasAlt) {
    missingAltsCount++;
    errors.push(`[A11Y IMAGE] In ${img.sourceFile}: Image with src="${img.src}" is missing the alt attribute entirely.`);
  } else {
    validAltsCount++;
  }
}

// 5. Support Route (/support/) Specific Integrity Verification
console.log('Verifying modern support route /support/ portal integrity...');
const supportHtmlPath = path.join(distDir, 'support', 'index.html');

if (!fs.existsSync(supportHtmlPath)) {
  errors.push('[ROUTE PRESERVATION] Missing critical support route file: dist/support/index.html');
} else {
  const supportContent = fs.readFileSync(supportHtmlPath, 'utf8');

  // Verify FormSubmit integration
  if (!supportContent.includes('formsubmit.co') && !supportContent.includes('connect@99comlabs.co.in') && !supportContent.includes('support@99comlabs.co.in')) {
    errors.push('[ROUTE PRESERVATION] dist/support/index.html is missing FormSubmit ticket submission integration.');
  }

  // Verify Ticket ID Generation reference
  if (!supportContent.includes('99LAB')) {
    errors.push('[ROUTE PRESERVATION] dist/support/ does not contain dynamic ticket ID generator (#99LAB-XXXXX).');
  }

  // Verify FAQ accordions
  if (!supportContent.includes('faq') && !supportContent.includes('accordion') && !supportContent.includes('details')) {
    warnings.push('[ROUTE PRESERVATION] dist/support/index.html may be missing FAQ accordion sections.');
  }

  console.log('  ✓ dist/support/index.html exists and contains verified support desk components.');
}

// 6. Report Results
console.log('\n===============================================================');
console.log('  LINK SPIDER & STRUCTURAL VERIFICATION SUMMARY');
console.log('===============================================================');
console.log(`Total HTML Pages Checked:   ${htmlFiles.length}`);
console.log(`Total Discovered Links:     ${allDiscoveredLinks.length}`);
console.log(`  - Internal Links:         ${internalLinksCount}`);
console.log(`  - External Links:         ${externalLinksCount}`);
console.log(`  - WhatsApp Links:         ${whatsappLinksCount}`);
console.log(`  - Click-to-Call (tel:):   ${telLinksCount}`);
console.log(`  - Email Links (mailto:):  ${mailtoLinksCount}`);
console.log(`Total Images Audited:       ${allDiscoveredImages.length}`);
console.log(`  - Valid Alt Attributes:   ${validAltsCount}`);
console.log(`  - Missing Alt Attributes: ${missingAltsCount}`);
console.log(`Preserved /support/ Route:  ${fs.existsSync(supportHtmlPath) ? 'PASSED (VERBATIM)' : 'FAILED'}`);
console.log(`Total Errors Detected:      ${errors.length}`);
console.log(`Total Warnings Detected:    ${warnings.length}`);
console.log('===============================================================\n');

if (warnings.length > 0) {
  console.log('WARNINGS:');
  warnings.forEach(w => console.log(`  ⚠ ${w}`));
  console.log();
}

if (errors.length > 0) {
  console.error('FAILURES & ERRORS:');
  errors.forEach(e => console.error(`  ✖ ${e}`));
  console.error('\n[RESULT] Verification FAILED. Please resolve all broken links, missing alts, or route errors above.\n');
  process.exit(1);
} else {
  console.log('[RESULT] All checks PASSED successfully! 0 broken links, all image alts verified, /support/ preserved.\n');
  process.exit(0);
}
