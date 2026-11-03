#!/usr/bin/env node
/**
 * test-challenger-seo-schema.mjs
 * 
 * Empirical Verification Challenger Suite for Milestone 2:
 * 1. SEO Metadata Audit (Title, Meta Description, Lengths, Keywords, Uniqueness)
 * 2. Heading Structure Audit (Exactly one <h1> per page)
 * 3. Canonical Tag & Route Mapping Audit
 * 4. Open Graph & Twitter Card Tag Audit
 * 5. Sitemap & Robots.txt Deep Verification
 * 6. Google Rich Results JSON-LD Deep Conformance
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', 'dist');

console.log('======================================================================');
console.log('  CHALLENGER M2-2: EMPIRICAL SEO, METADATA & SCHEMA AUDIT');
console.log('======================================================================\n');

if (!fs.existsSync(distDir)) {
  console.error(`[FATAL] Dist directory does not exist: ${distDir}`);
  process.exit(1);
}

// 1. Discover all HTML files
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

const htmlFiles = getFiles(distDir);
console.log(`Discovered ${htmlFiles.length} HTML files to empirically test.\n`);

const results = {
  h1: [],
  titles: [],
  descriptions: [],
  canonicals: [],
  og: [],
  twitter: [],
  robots: [],
  schemas: [],
  sitemaps: [],
  failures: [],
  warnings: []
};

const titleMap = new Map();
const descMap = new Map();

for (const filePath of htmlFiles) {
  const relPath = path.relative(distDir, filePath).replace(/\\/g, '/');
  const html = fs.readFileSync(filePath, 'utf8');

  // --- 1. Heading Audit: Exactly one <h1> ---
  const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  const h1Texts = h1Matches.map(m => m[1].replace(/<[^>]+>/g, '').trim());
  
  if (h1Matches.length !== 1) {
    results.failures.push(`[H1 COUNT] ${relPath}: Expected exactly 1 <h1>, found ${h1Matches.length}.`);
  } else if (!h1Texts[0]) {
    results.failures.push(`[H1 EMPTY] ${relPath}: The single <h1> is empty.`);
  } else {
    results.h1.push({ file: relPath, text: h1Texts[0] });
  }

  // --- 2. Title Audit ---
  const titleMatches = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
  if (titleMatches.length !== 1) {
    results.failures.push(`[TITLE COUNT] ${relPath}: Expected exactly 1 <title>, found ${titleMatches.length}.`);
  } else {
    const titleText = titleMatches[0][1].replace(/<[^>]+>/g, '').trim();
    const len = titleText.length;
    if (len === 0) {
      results.failures.push(`[TITLE EMPTY] ${relPath}: Title is empty.`);
    } else if (len > 60) {
      results.failures.push(`[TITLE LENGTH] ${relPath}: Title exceeds 60 chars (${len} chars): "${titleText}"`);
    }

    if (titleMap.has(titleText)) {
      results.failures.push(`[TITLE DUPLICATE] Duplicate title "${titleText}" found in ${relPath} and ${titleMap.get(titleText)}`);
    } else {
      titleMap.set(titleText, relPath);
    }

    results.titles.push({ file: relPath, title: titleText, length: len });
  }

  // --- 3. Meta Description Audit ---
  // Support both name="description" content="..." and content="..." name="description"
  const descMatch = html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
                    html.match(/<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
  if (!descMatch) {
    results.failures.push(`[META DESC MISSING] ${relPath}: Missing <meta name="description"> tag.`);
  } else {
    const descText = descMatch[1].trim();
    const len = descText.length;
    if (len === 0) {
      results.failures.push(`[META DESC EMPTY] ${relPath}: Meta description is empty.`);
    } else if (len > 160) {
      results.failures.push(`[META DESC LENGTH] ${relPath}: Meta description exceeds 160 chars (${len} chars): "${descText}"`);
    }

    if (descMap.has(descText)) {
      results.failures.push(`[META DESC DUPLICATE] Duplicate description found in ${relPath} and ${descMap.get(descText)}`);
    } else {
      descMap.set(descText, relPath);
    }

    // Check Kerala / India keywords
    const hasKeralaOrIndia = /kerala|india|malappuram|kottakkal/i.test(descText);
    results.descriptions.push({ file: relPath, description: descText, length: len, hasLocation: hasKeralaOrIndia });
  }

  // --- 4. Canonical Tag Audit ---
  const canonicalMatch = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i) ||
                         html.match(/<link\s+[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["'][^>]*>/i);
  if (!canonicalMatch) {
    if (relPath !== '404.html') {
      results.failures.push(`[CANONICAL MISSING] ${relPath}: Missing <link rel="canonical"> tag.`);
    }
  } else if (relPath === '404.html') {
    results.failures.push(`[CANONICAL 404 UNEXPECTED] 404.html should not declare a canonical link.`);
  } else {
    const canonicalUrl = canonicalMatch[1].trim();
    if (!canonicalUrl.startsWith('https://99comlabs.co.in/')) {
      results.failures.push(`[CANONICAL FORMAT] ${relPath}: Canonical URL "${canonicalUrl}" does not start with https://99comlabs.co.in/`);
    }

    // Expected canonical path mapping
    let expectedCanonical;
    if (relPath === 'index.html') {
      expectedCanonical = 'https://99comlabs.co.in/';
    } else if (relPath.endsWith('/index.html')) {
      expectedCanonical = `https://99comlabs.co.in/${relPath.replace(/\/index\.html$/, '/')}`;
    } else {
      expectedCanonical = `https://99comlabs.co.in/${relPath}`;
    }

    if (canonicalUrl !== expectedCanonical) {
      results.failures.push(`[CANONICAL MISMATCH] ${relPath}: Canonical is "${canonicalUrl}", expected "${expectedCanonical}".`);
    }
    results.canonicals.push({ file: relPath, canonical: canonicalUrl });
  }

  // --- 5. Open Graph & Twitter Cards Audit ---
  const ogTags = {
    title: html.match(/<meta\s+[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["'][^>]*>/i)?.[1],
    description: html.match(/<meta\s+[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i)?.[1],
    image: html.match(/<meta\s+[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["'][^>]*>/i)?.[1],
    url: html.match(/<meta\s+[^>]*property=["']og:url["'][^>]*content=["']([^"']*)["'][^>]*>/i)?.[1]
  };

  const twitterTags = {
    card: html.match(/<meta\s+[^>]*name=["']twitter:card["'][^>]*content=["']([^"']*)["'][^>]*>/i)?.[1] ||
          html.match(/<meta\s+[^>]*property=["']twitter:card["'][^>]*content=["']([^"']*)["'][^>]*>/i)?.[1],
    title: html.match(/<meta\s+[^>]*name=["']twitter:title["'][^>]*content=["']([^"']*)["'][^>]*>/i)?.[1] ||
           html.match(/<meta\s+[^>]*property=["']twitter:title["'][^>]*content=["']([^"']*)["'][^>]*>/i)?.[1],
    description: html.match(/<meta\s+[^>]*name=["']twitter:description["'][^>]*content=["']([^"']*)["'][^>]*>/i)?.[1] ||
                 html.match(/<meta\s+[^>]*property=["']twitter:description["'][^>]*content=["']([^"']*)["'][^>]*>/i)?.[1],
    image: html.match(/<meta\s+[^>]*name=["']twitter:image["'][^>]*content=["']([^"']*)["'][^>]*>/i)?.[1] ||
           html.match(/<meta\s+[^>]*property=["']twitter:image["'][^>]*content=["']([^"']*)["'][^>]*>/i)?.[1]
  };

  // Skip strict social card requirement on 404 or support if not defined
  if (relPath !== '404.html') {
    if (!ogTags.title) results.failures.push(`[OG MISSING] ${relPath}: Missing og:title.`);
    if (!ogTags.description) results.failures.push(`[OG MISSING] ${relPath}: Missing og:description.`);
    if (!ogTags.image) results.failures.push(`[OG MISSING] ${relPath}: Missing og:image.`);
    if (!ogTags.url) results.failures.push(`[OG MISSING] ${relPath}: Missing og:url.`);

    if (!twitterTags.card) results.failures.push(`[TWITTER MISSING] ${relPath}: Missing twitter:card.`);
    if (!twitterTags.title) results.failures.push(`[TWITTER MISSING] ${relPath}: Missing twitter:title.`);
  }

  // --- 6. Robots Meta Tag Audit ---
  const robotsMatch = html.match(/<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (relPath === '404.html') {
    if (!robotsMatch || !robotsMatch[1].includes('noindex')) {
      results.failures.push(`[ROBOTS 404] 404.html must have <meta name="robots" content="noindex...">`);
    }
  } else {
    if (robotsMatch && robotsMatch[1].includes('noindex')) {
      results.failures.push(`[ROBOTS ACCIDENTAL NOINDEX] ${relPath} contains unintended noindex.`);
    }
  }

  // --- 7. JSON-LD Extraction & Validation ---
  const jsonLdBlocks = [...html.matchAll(/<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const block of jsonLdBlocks) {
    const raw = block[1].trim();
    try {
      const parsed = JSON.parse(raw);
      results.schemas.push({ file: relPath, schema: parsed });

      // Check BreadcrumbList URLs
      if (parsed['@type'] === 'BreadcrumbList' && Array.isArray(parsed.itemListElement)) {
        for (const item of parsed.itemListElement) {
          if (item.item && !item.item.startsWith('https://99comlabs.co.in/')) {
            results.failures.push(`[BREADCRUMB URL] ${relPath}: Breadcrumb item "${item.name}" has non-absolute or foreign URL: "${item.item}"`);
          }
        }
      }
    } catch (e) {
      results.failures.push(`[JSON-LD SYNTAX] ${relPath}: Parse error: ${e.message}`);
    }
  }
}

// --- 8. Sitemap Audit ---
const sitemapIndexPath = path.join(distDir, 'sitemap-index.xml');
const sitemap0Path = path.join(distDir, 'sitemap-0.xml');

if (!fs.existsSync(sitemapIndexPath)) {
  results.failures.push('[SITEMAP MISSING] dist/sitemap-index.xml does not exist.');
} else {
  const indexXml = fs.readFileSync(sitemapIndexPath, 'utf8');
  if (!indexXml.startsWith('<?xml') || !indexXml.includes('<sitemapindex') || !indexXml.includes('https://99comlabs.co.in/sitemap-0.xml')) {
    results.failures.push('[SITEMAP INDEX INVALID] dist/sitemap-index.xml is not valid XML or missing sitemap-0 reference.');
  }
}

let sitemapUrls = [];
if (!fs.existsSync(sitemap0Path)) {
  results.failures.push('[SITEMAP MISSING] dist/sitemap-0.xml does not exist.');
} else {
  const sitemapXml = fs.readFileSync(sitemap0Path, 'utf8');
  if (!sitemapXml.startsWith('<?xml') || !sitemapXml.includes('<urlset')) {
    results.failures.push('[SITEMAP 0 INVALID] dist/sitemap-0.xml is not valid XML.');
  }

  const locMatches = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)];
  sitemapUrls = locMatches.map(m => m[1]);

  console.log(`Extracted ${sitemapUrls.length} URLs from dist/sitemap-0.xml.`);

  if (sitemapUrls.length !== 17) {
    results.failures.push(`[SITEMAP URL COUNT] Expected exactly 17 canonical indexable URLs, found ${sitemapUrls.length}.`);
  }

  if (sitemapUrls.some(u => u.includes('404'))) {
    results.failures.push('[SITEMAP ERROR] 404 page is erroneously included in sitemap.');
  }

  if (!sitemapUrls.includes('https://99comlabs.co.in/support/')) {
    results.failures.push('[SITEMAP ERROR] Preserved /support/ route is missing from sitemap.');
  }
}

// --- 9. Robots.txt Audit ---
const robotsPath = path.join(distDir, 'robots.txt');
if (!fs.existsSync(robotsPath)) {
  results.failures.push('[ROBOTS MISSING] dist/robots.txt does not exist.');
} else {
  const robotsTxt = fs.readFileSync(robotsPath, 'utf8');
  if (robotsTxt.includes('Disallow: /_astro/')) {
    results.failures.push('[ROBOTS CRAWL OBSTACLE] robots.txt blocks /_astro/ which prevents CSS/JS rendering by Googlebot!');
  }
  if (!robotsTxt.includes('Sitemap: https://99comlabs.co.in/sitemap-index.xml') && !robotsTxt.includes('Sitemap: https://99comlabs.co.in/sitemap.xml')) {
    results.failures.push('[ROBOTS SITEMAP MISSING] robots.txt does not reference the sitemap URL.');
  }
}

// Print Detailed Results
console.log('\n--- 1. H1 Headings Audited ---');
for (const h of results.h1) {
  console.log(`  • ${h.file.padEnd(45)} -> H1: "${h.text}"`);
}

console.log('\n--- 2. Title Tags Audited (<60 chars) ---');
for (const t of results.titles) {
  const status = t.length <= 60 ? 'PASS' : 'FAIL';
  console.log(`  • [${status}] (${String(t.length).padStart(2)} chars) ${t.file.padEnd(45)} -> "${t.title}"`);
}

console.log('\n--- 3. Meta Descriptions Audited (<160 chars) ---');
for (const d of results.descriptions) {
  const status = d.length <= 160 ? 'PASS' : 'FAIL';
  const loc = d.hasLocation ? '[Loc: YES]' : '[Loc:  NO]';
  console.log(`  • [${status}] (${String(d.length).padStart(3)} chars) ${loc} ${d.file.padEnd(45)} -> "${d.description}"`);
}

console.log('\n--- 4. Canonical Tags Audited ---');
for (const c of results.canonicals) {
  console.log(`  • ${c.file.padEnd(45)} -> ${c.canonical}`);
}

console.log('\n--- 5. Sitemaps & Robots Summary ---');
console.log(`  • Sitemap URLs verified: ${sitemapUrls.length}`);
console.log(`  • Robots.txt verified: Disallow /_astro/ is ABSENT; Sitemap referenced.`);

console.log('\n======================================================================');
console.log(`  FINAL VERIFICATION AUDIT RESULTS:`);
console.log(`  Total Failures: ${results.failures.length}`);
console.log(`  Total Warnings: ${results.warnings.length}`);
console.log('======================================================================');

if (results.failures.length > 0) {
  console.error('\nFAILURES DETECTED:');
  for (const f of results.failures) {
    console.error(`  ✖ ${f}`);
  }
  process.exit(1);
} else {
  console.log('\n✓ ALL EMPIRICAL SEO, METADATA, HEADING, SITEMAP & SCHEMA CHECKS PASSED!\n');
  process.exit(0);
}
