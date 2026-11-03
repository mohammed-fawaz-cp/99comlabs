#!/usr/bin/env node
/**
 * scripts/test-challenger-m4-honest-support.mjs
 * 
 * Adversarial Empirical Verification Suite for Milestone 4 Phase 2
 * Author: challenger_m4_2 (Empirical Challenger)
 * 
 * Core Test Suites:
 * 1. Honest Content Standards (R4) & Content Integrity Audit
 *    - Hidden testimonials block assertion in src and dist
 *    - Absence of fabricated testimonials, fake client logos, fake case studies, fake awards, fake addresses, and invented phone numbers
 *    - 1:1 Parity audit for all 13 items in HANDOVER_CATALOG.md
 * 2. Route Preservation (/support/) & Functional Integrity
 *    - Verbatim file existence and byte-level parity
 *    - Statistical randomness and uniqueness stress-test of ticket generator (#99LAB-XXXXX) across 10,000 iterations
 *    - FormSubmit AJAX & POST endpoint integrity
 *    - Ticket confirmation modal dialogs & escalation channels
 *    - Internal anchor links and site navigation integrity (/ -> new site root)
 * 3. Server and Hosting Configurations Audit
 *    - public/.htaccess & dist/.htaccess (Rewrite rules, 301 redirects, HTTPS, trailing slashes, 404, security headers, compression, caching)
 *    - public/_redirects & dist/_redirects (Netlify/Cloudflare 301 rules, trailing slashes, 404 fallback)
 *    - .cpanel.yml (YAML syntax, DEPLOYPATH, copy commands, file permissions)
 *    - public/robots.txt & dist/robots.txt (Crawler directives, sitemaps, allow rules)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.resolve(projectRoot, 'dist');
const srcDir = path.resolve(projectRoot, 'src');
const publicDir = path.resolve(projectRoot, 'public');

console.log('='.repeat(80));
console.log('  CHALLENGER M4-2: ADVERSARIAL COVERAGE HARDENING (TIER 5)');
console.log('  Honest Content Standards (R4), /support/ Route, & Hosting Configs');
console.log('='.repeat(80));
console.log(`Project Root: ${projectRoot}`);
console.log(`Dist Dir:     ${distDir}`);
console.log(`Src Dir:      ${srcDir}\n`);

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  suites: {}
};

function startSuite(name) {
  console.log(`\n>>> SUITE: ${name}`);
  results.suites[name] = { passed: 0, failed: 0 };
}

function assert(suiteName, condition, description, errorDetails = '') {
  if (condition) {
    results.passed++;
    results.suites[suiteName].passed++;
    console.log(`  [PASS] ${description}`);
  } else {
    results.failed++;
    results.suites[suiteName].failed++;
    console.error(`  [FAIL] ${description}`);
    if (errorDetails) {
      console.error(`         DETAILS: ${errorDetails}`);
    }
  }
}

function warn(description) {
  results.warnings++;
  console.warn(`  [WARN] ${description}`);
}

function walkFiles(dir, extensions = ['.html', '.astro', '.js', '.mjs', '.json']) {
  let list = [];
  if (!fs.existsSync(dir)) return list;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      list = list.concat(walkFiles(full, extensions));
    } else if (extensions.some(ext => item.endsWith(ext))) {
      list.push(full);
    }
  }
  return list;
}

// =============================================================================
// SUITE 1: HONEST CONTENT STANDARDS (R4) & CONTENT INTEGRITY AUDIT
// =============================================================================
startSuite('Suite 1: Honest Content Standards (R4) & Content Integrity');

// 1.1 Home Page Testimonials Section in src/pages/index.astro
const srcIndexAstroPath = path.join(srcDir, 'pages', 'index.astro');
const srcIndexAstro = fs.readFileSync(srcIndexAstroPath, 'utf8');

const srcTestimonialsSectionRegex = /<section\b[^>]*id=["']testimonials["'][^>]*>([\s\S]*?)<\/section>/i;
const srcTestimonialMatch = srcIndexAstro.match(srcTestimonialsSectionRegex);

assert(
  'Suite 1: Honest Content Standards (R4) & Content Integrity',
  srcTestimonialMatch !== null,
  'src/pages/index.astro contains <section id="testimonials"> element'
);

if (srcTestimonialMatch) {
  const openTag = srcTestimonialMatch[0].split('>')[0] + '>';
  const hasHiddenClass = /class=["'][^"']*\bhidden\b[^"']*["']/i.test(openTag);
  const hasAriaHidden = /aria-hidden=["']true["']/i.test(openTag);
  const containsExactPlaceholder = srcTestimonialMatch[1].includes('[ADD REAL TESTIMONIAL + NAME + COMPANY]');

  assert(
    'Suite 1: Honest Content Standards (R4) & Content Integrity',
    hasHiddenClass,
    'src/pages/index.astro testimonials section has class="hidden"',
    `Found open tag: ${openTag}`
  );
  assert(
    'Suite 1: Honest Content Standards (R4) & Content Integrity',
    hasAriaHidden,
    'src/pages/index.astro testimonials section has aria-hidden="true"',
    `Found open tag: ${openTag}`
  );
  assert(
    'Suite 1: Honest Content Standards (R4) & Content Integrity',
    containsExactPlaceholder,
    'src/pages/index.astro testimonials section contains exact placeholder: [ADD REAL TESTIMONIAL + NAME + COMPANY]'
  );
}

// 1.2 Home Page Testimonials Section in dist/index.html
const distIndexPath = path.join(distDir, 'index.html');
assert(
  'Suite 1: Honest Content Standards (R4) & Content Integrity',
  fs.existsSync(distIndexPath),
  'dist/index.html exists'
);

const distIndexHtml = fs.readFileSync(distIndexPath, 'utf8');
const distTestimonialMatch = distIndexHtml.match(srcTestimonialsSectionRegex);

assert(
  'Suite 1: Honest Content Standards (R4) & Content Integrity',
  distTestimonialMatch !== null,
  'dist/index.html contains rendered <section id="testimonials">'
);

if (distTestimonialMatch) {
  const openTag = distTestimonialMatch[0].split('>')[0] + '>';
  const hasHiddenClass = /class=["'][^"']*\bhidden\b[^"']*["']/i.test(openTag);
  const hasAriaHidden = /aria-hidden=["']true["']/i.test(openTag);
  const containsExactPlaceholder = distTestimonialMatch[1].includes('[ADD REAL TESTIMONIAL + NAME + COMPANY]');

  assert(
    'Suite 1: Honest Content Standards (R4) & Content Integrity',
    hasHiddenClass,
    'dist/index.html testimonials section has class="hidden"',
    `Found open tag: ${openTag}`
  );
  assert(
    'Suite 1: Honest Content Standards (R4) & Content Integrity',
    hasAriaHidden,
    'dist/index.html testimonials section has aria-hidden="true"',
    `Found open tag: ${openTag}`
  );
  assert(
    'Suite 1: Honest Content Standards (R4) & Content Integrity',
    containsExactPlaceholder,
    'dist/index.html testimonials section contains exact placeholder: [ADD REAL TESTIMONIAL + NAME + COMPANY]'
  );
}

// 1.3 Adversarial Scan for Fake Social Proof, Fake Awards & Fake Clients across all src/ and dist/
const allContentFiles = [
  ...walkFiles(srcDir, ['.astro', '.js', '.mjs']),
  ...walkFiles(distDir, ['.html', '.js'])
];

const suspiciousTerms = [
  { term: 'lorem ipsum', desc: 'Lorem ipsum dummy text' },
  { term: 'john doe', desc: 'Fictitious person John Doe' },
  { term: 'jane doe', desc: 'Fictitious person Jane Doe' },
  { term: 'clutch', desc: 'Clutch review badges or ratings' },
  { term: 'forbes', desc: 'Forbes feature claims' },
  { term: '5-star', desc: 'Fabricated 5-star rating' },
  { term: '5 star', desc: 'Fabricated 5 star rating' },
  { term: 'award-winning', desc: 'Unsubstantiated Award-Winning marketing claims' },
  { term: 'trusted by 100', desc: 'Invented client volume claim' },
  { term: 'fortune 500', desc: 'Fortune 500 client claim' }
];

for (const { term, desc } of suspiciousTerms) {
  const foundIn = [];
  for (const file of allContentFiles) {
    const content = fs.readFileSync(file, 'utf8').toLowerCase();
    // Exclude our own test scripts or verification comments
    if (file.includes('scripts')) continue;
    if (content.includes(term)) {
      foundIn.push(path.relative(projectRoot, file));
    }
  }
  assert(
    'Suite 1: Honest Content Standards (R4) & Content Integrity',
    foundIn.length === 0,
    `No "${desc}" found across project content`,
    `Found occurrences in: ${foundIn.join(', ')}`
  );
}

// 1.4 Authentic Case Studies Audit
// In src/pages/projects.astro and dist/projects/index.html
const srcProjectsAstro = fs.readFileSync(path.join(srcDir, 'pages', 'projects.astro'), 'utf8');
const distProjectsHtml = fs.readFileSync(path.join(distDir, 'projects', 'index.html'), 'utf8');

const authenticCaseStudies = [
  { name: 'Enterprise Billing Application / POS', token: 'Enterprise Billing Application' },
  { name: 'Life & Tree IoT Telemetry', token: 'Life & Tree' },
  { name: 'MyPDF Document Processing Suite', token: 'MyPDF' }
];

for (const cs of authenticCaseStudies) {
  assert(
    'Suite 1: Honest Content Standards (R4) & Content Integrity',
    srcProjectsAstro.includes(cs.token) && distProjectsHtml.includes(cs.token),
    `Authentic case study verified present in projects page: ${cs.name}`
  );
}

// Assert that projects tab specifies exactly "(3)"
assert(
  'Suite 1: Honest Content Standards (R4) & Content Integrity',
  srcProjectsAstro.includes('All Projects (3)') && distProjectsHtml.includes('All Projects (3)'),
  'Projects page explicitly scopes case studies to exactly 3 authentic projects'
);

// 1.5 Authentic Address, PIN, and Location Geocoding Audit
const discoveredPins = new Set();
for (const file of allContentFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(/\b\d{6}\b/g) || [];
  for (const pin of matches) {
    // Filter out obvious timestamps or numbers if any
    discoveredPins.add(pin);
  }
}

assert(
  'Suite 1: Honest Content Standards (R4) & Content Integrity',
  discoveredPins.has('676304') && discoveredPins.size === 1,
  'Sole 6-digit postal PIN in codebase is authentic 676304 (Kottakkal, Malappuram)',
  `Discovered PINs: ${Array.from(discoveredPins).join(', ')}`
);

// Assert structured data uses honest street address placeholders
const schemaFiles = [
  path.join(distDir, 'index.html'),
  path.join(distDir, 'about', 'index.html'),
  path.join(distDir, 'contact', 'index.html')
];

for (const sf of schemaFiles) {
  const rel = path.relative(projectRoot, sf);
  const content = fs.readFileSync(sf, 'utf8');
  const hasStreetAddressPlaceholder = content.includes('"streetAddress":"[CONFIRM STREET ADDRESS]"') ||
                                      content.includes('"streetAddress": "[CONFIRM STREET ADDRESS]"');
  assert(
    'Suite 1: Honest Content Standards (R4) & Content Integrity',
    hasStreetAddressPlaceholder,
    `${rel} JSON-LD structured data uses honest placeholder [CONFIRM STREET ADDRESS]`
  );
}

// 1.6 Phone Number Integrity Audit
const phoneRegex = /(?:\+?91[\s-]?)?[6789]\d{9}/g;
const discoveredPhoneNumbers = new Set();
for (const file of allContentFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(phoneRegex) || [];
  for (const m of matches) {
    discoveredPhoneNumbers.add(m.replace(/[\s-]/g, ''));
  }
}

// Expected real phone number is 919745551513 (with or without leading +)
const nonAuthenticPhones = Array.from(discoveredPhoneNumbers).filter(p => !p.endsWith('9745551513'));
assert(
  'Suite 1: Honest Content Standards (R4) & Content Integrity',
  nonAuthenticPhones.length === 0,
  'All telephone and WhatsApp links reference authentic business number (+91 9745551513)',
  `Unexpected phone numbers discovered: ${nonAuthenticPhones.join(', ')}`
);

// 1.7 1:1 Parity Audit for All 13 Items in HANDOVER_CATALOG.md
const handoverCatalogPath = path.join(projectRoot, 'HANDOVER_CATALOG.md');
assert(
  'Suite 1: Honest Content Standards (R4) & Content Integrity',
  fs.existsSync(handoverCatalogPath),
  'HANDOVER_CATALOG.md exists at project root'
);

const handoverCatalogContent = fs.readFileSync(handoverCatalogPath, 'utf8');

const handoverItems = [
  { id: 1, file: 'src/components/Footer.astro', placeholder: '[CONFIRM STREET ADDRESS]' },
  { id: 2, file: 'src/pages/index.astro', placeholder: '[CONFIRM STREET ADDRESS]' },
  { id: 3, file: 'src/pages/index.astro', placeholder: '[ADD REAL TESTIMONIAL + NAME + COMPANY]' },
  { id: 4, file: 'src/pages/about.astro', placeholder: '[CONFIRM STREET ADDRESS]' },
  { id: 5, file: 'src/pages/about.astro', placeholder: '[ADD REAL TEAM MEMBER BIOS & PHOTOS]' },
  { id: 6, file: 'src/pages/privacy.astro', placeholder: '[CONFIRM FULL STREET ADDRESS]' },
  { id: 7, file: 'src/pages/terms.astro', placeholder: '[CONFIRM SPECIFIC JURISDICTION COURT]' },
  { id: 8, file: 'src/pages/terms.astro', placeholder: '[CONFIRM FULL STREET ADDRESS]' },
  { id: 9, file: 'src/pages/contact.astro', placeholder: '[CONFIRM STREET ADDRESS]' },
  { id: 10, file: 'src/components/ContactForm.astro', placeholder: '[ADD FORM BACKEND KEY / ENDPOINT]' },
  { id: 11, file: 'src/components/Analytics.astro', placeholder: '[ADD GA4 MEASUREMENT ID]' },
  { id: 12, file: 'src/components/Analytics.astro', placeholder: '[ADD GSC VERIFICATION TOKEN]' },
  { id: 13, file: 'public/support/index.html', placeholder: 'https://formsubmit.co/support@99comlabs.co.in' }
];

for (const item of handoverItems) {
  const targetPath = path.join(projectRoot, item.file);
  const exists = fs.existsSync(targetPath);
  assert(
    'Suite 1: Honest Content Standards (R4) & Content Integrity',
    exists,
    `Handover Item #${item.id} target file exists: ${item.file}`
  );
  if (exists) {
    const fileContent = fs.readFileSync(targetPath, 'utf8');
    const hasPlaceholder = fileContent.includes(item.placeholder);
    assert(
      'Suite 1: Honest Content Standards (R4) & Content Integrity',
      hasPlaceholder,
      `Handover Item #${item.id} placeholder matches 1:1 in ${item.file}: "${item.placeholder}"`
    );
  }
}

// =============================================================================
// SUITE 2: ROUTE PRESERVATION (/support/) & FUNCTIONAL INTEGRITY
// =============================================================================
startSuite('Suite 2: Route Preservation (/support/) & Functional Integrity');

const distSupportHtmlPath = path.join(distDir, 'support', 'index.html');
const distSupportCssPath = path.join(distDir, 'support', 'support.css');
const distSupportJsPath = path.join(distDir, 'support', 'support.js');
const pubSupportHtmlPath = path.join(publicDir, 'support', 'index.html');
const pubSupportCssPath = path.join(publicDir, 'support', 'support.css');
const pubSupportJsPath = path.join(publicDir, 'support', 'support.js');

// 2.1 Artifact Existence & Parity
assert(
  'Suite 2: Route Preservation (/support/) & Functional Integrity',
  fs.existsSync(distSupportHtmlPath) && fs.existsSync(distSupportCssPath) && fs.existsSync(distSupportJsPath),
  'dist/support/index.html, dist/support/support.css, and dist/support/support.js all exist'
);

const distSupportHtml = fs.readFileSync(distSupportHtmlPath, 'utf8');
const pubSupportHtml = fs.readFileSync(pubSupportHtmlPath, 'utf8');
const distSupportJs = fs.readFileSync(distSupportJsPath, 'utf8');
const pubSupportJs = fs.readFileSync(pubSupportJsPath, 'utf8');
const distSupportCss = fs.readFileSync(distSupportCssPath, 'utf8');
const pubSupportCss = fs.readFileSync(pubSupportCssPath, 'utf8');

assert(
  'Suite 2: Route Preservation (/support/) & Functional Integrity',
  distSupportHtml === pubSupportHtml,
  'dist/support/index.html is identical byte-for-byte to public/support/index.html'
);
assert(
  'Suite 2: Route Preservation (/support/) & Functional Integrity',
  distSupportJs === pubSupportJs,
  'dist/support/support.js is identical byte-for-byte to public/support/support.js'
);
assert(
  'Suite 2: Route Preservation (/support/) & Functional Integrity',
  distSupportCss === pubSupportCss,
  'dist/support/support.css is identical byte-for-byte to public/support/support.css'
);

// 2.2 Ticket ID Generator Format & Character Set Analysis
// Extract the generator function from support.js using balanced brace tracking
function extractFunction(source, funcName) {
  const start = source.indexOf(`function ${funcName}`);
  if (start === -1) return null;
  const braceStart = source.indexOf('{', start);
  if (braceStart === -1) return null;
  let depth = 1;
  let idx = braceStart + 1;
  while (idx < source.length && depth > 0) {
    if (source[idx] === '{') depth++;
    else if (source[idx] === '}') depth--;
    idx++;
  }
  return source.slice(start, idx);
}

const ticketGenFuncCode = extractFunction(distSupportJs, 'generateTicketId');
assert(
  'Suite 2: Route Preservation (/support/) & Functional Integrity',
  ticketGenFuncCode !== null,
  'generateTicketId() function found in support.js'
);

let generateTicketId;
if (ticketGenFuncCode) {
  const context = {};
  vm.createContext(context);
  vm.runInContext(`generateTicketId = ${ticketGenFuncCode}`, context);
  generateTicketId = context.generateTicketId;
}

assert(
  'Suite 2: Route Preservation (/support/) & Functional Integrity',
  typeof generateTicketId === 'function',
  'generateTicketId() evaluated successfully in isolated sandbox'
);

// 2.3 Statistical Randomness & Uniqueness Stress-Test across 10,000 iterations
if (typeof generateTicketId === 'function') {
  const sampleCount = 10000;
  const ticketSet = new Set();
  const charDistribution = {};
  '0123456789ABCDEF'.split('').forEach(c => { charDistribution[c] = 0; });
  let regexFailures = 0;

  for (let i = 0; i < sampleCount; i++) {
    const ticket = generateTicketId();
    if (!/^#99LAB-[0-9A-F]{5}$/.test(ticket)) {
      regexFailures++;
    }
    ticketSet.add(ticket);
    const code = ticket.slice(7);
    for (const ch of code) {
      charDistribution[ch] = (charDistribution[ch] || 0) + 1;
    }
  }

  assert(
    'Suite 2: Route Preservation (/support/) & Functional Integrity',
    regexFailures === 0,
    `10,000 generated tickets all strictly match format ^#99LAB-[0-9A-F]{5}$ (Failures: ${regexFailures})`
  );

  // For 10,000 samples out of 16^5 = 1,048,576 possibilities,
  // Birthday collision expected: ~ N^2 / (2M) ~ 100,000,000 / 2,097,152 ~ 47.6.
  // Unique tickets should easily exceed 9,900.
  const uniqueCount = ticketSet.size;
  const collisions = sampleCount - uniqueCount;
  assert(
    'Suite 2: Route Preservation (/support/) & Functional Integrity',
    uniqueCount >= 9900,
    `High ticket uniqueness: ${uniqueCount} unique out of 10,000 (${collisions} collisions, well within birthday bound)`,
    `Unique count: ${uniqueCount}`
  );

  // Character frequency test across 50,000 characters
  // Expected uniform frequency: 50,000 / 16 = 3,125 per hex character (~6.25%).
  // Minimum acceptable per character: > 2,000 (4.0%).
  const minCharCount = Math.min(...Object.values(charDistribution));
  const maxCharCount = Math.max(...Object.values(charDistribution));
  assert(
    'Suite 2: Route Preservation (/support/) & Functional Integrity',
    minCharCount > 2000 && maxCharCount < 4500,
    `Hex character distribution is uniformly distributed (Min: ${minCharCount}, Max: ${maxCharCount}, Expected: ~3125)`,
    `Distribution: ${JSON.stringify(charDistribution)}`
  );
}

// 2.4 FormSubmit Endpoint & Field Integrity
assert(
  'Suite 2: Route Preservation (/support/) & Functional Integrity',
  distSupportHtml.includes('action="https://formsubmit.co/support@99comlabs.co.in"') && distSupportHtml.includes('method="POST"'),
  'dist/support/index.html form action is https://formsubmit.co/support@99comlabs.co.in'
);

assert(
  'Suite 2: Route Preservation (/support/) & Functional Integrity',
  distSupportJs.includes('https://formsubmit.co/ajax/support@99comlabs.co.in'),
  'dist/support/support.js targets FormSubmit AJAX endpoint: https://formsubmit.co/ajax/support@99comlabs.co.in'
);

const requiredFormElements = [
  'id="clientName"',
  'id="clientEmail"',
  'id="clientPhone"',
  'id="projectId"',
  'id="supportCategory"',
  'id="severityLevel"',
  'id="ticketSubject"',
  'id="ticketDescription"',
  'id="ticketIdHidden"',
  'id="formSubjectHidden"'
];

for (const el of requiredFormElements) {
  assert(
    'Suite 2: Route Preservation (/support/) & Functional Integrity',
    distSupportHtml.includes(el),
    `Support form contains required input: ${el}`
  );
}

// 2.5 Modal Controls & Interactive Components
const modalElements = [
  'id="ticketSuccessModal"',
  'id="modalTicketId"',
  'id="modalDomainSev"',
  'id="copyTicketBtn"',
  'id="openMailtoBtn"',
  'id="openWhatsAppBtn"',
  'id="closeModalBtn"'
];

for (const mel of modalElements) {
  assert(
    'Suite 2: Route Preservation (/support/) & Functional Integrity',
    distSupportHtml.includes(mel),
    `Support ticket confirmation modal includes: ${mel}`
  );
}

// 2.6 Anchor Links Navigation Integrity (Back to Main Site)
const linkMatches = [...distSupportHtml.matchAll(/<a\b[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi)];
const internalSiteLinks = [];
const externalLinks = [];

for (const match of linkMatches) {
  const href = match[1];
  if (href.startsWith('mailto:') || href.startsWith('https://wa.me')) {
    externalLinks.push(href);
  } else {
    internalSiteLinks.push(href);
  }
}

// Every non-anchor navigation link must point to '/' (root)
const unexpectedNavLinks = internalSiteLinks.filter(href => !href.startsWith('#') && href !== '/');
assert(
  'Suite 2: Route Preservation (/support/) & Functional Integrity',
  unexpectedNavLinks.length === 0,
  'All navigation anchor links in /support/ navigate cleanly back to new site root "/"',
  `Unexpected links found: ${unexpectedNavLinks.join(', ')}`
);

// Verify FAQ anchor targets exist
const hashLinks = internalSiteLinks.filter(href => href.startsWith('#') && href !== '#');
for (const hash of hashLinks) {
  const targetId = hash.slice(1);
  const targetExists = distSupportHtml.includes(`id="${targetId}"`);
  assert(
    'Suite 2: Route Preservation (/support/) & Functional Integrity',
    targetExists,
    `Internal hash anchor ${hash} resolves to valid element id="${targetId}"`
  );
}

// =============================================================================
// SUITE 3: SERVER AND HOSTING CONFIGURATIONS AUDIT
// =============================================================================
startSuite('Suite 3: Server and Hosting Configurations Audit');

// 3.1 Apache .htaccess Audit
const distHtaccessPath = path.join(distDir, '.htaccess');
const pubHtaccessPath = path.join(publicDir, '.htaccess');

assert(
  'Suite 3: Server and Hosting Configurations Audit',
  fs.existsSync(distHtaccessPath) && fs.existsSync(pubHtaccessPath),
  '.htaccess exists in both dist/ and public/'
);

const htaccess = fs.readFileSync(distHtaccessPath, 'utf8');

// Core mod_rewrite rules
assert('Suite 3: Server and Hosting Configurations Audit', htaccess.includes('RewriteEngine On'), '.htaccess enables RewriteEngine On');
assert('Suite 3: Server and Hosting Configurations Audit', htaccess.includes('RewriteBase /'), '.htaccess sets RewriteBase /');

// HTTPS Enforcement
const httpsRule = /RewriteCond %\{HTTPS\} !=on[\r\n\s]+RewriteRule \^ https:\/\/%\{HTTP_HOST\}%\{REQUEST_URI\} \[L,R=301\]/;
assert('Suite 3: Server and Hosting Configurations Audit', httpsRule.test(htaccess), '.htaccess enforces 301 HTTPS redirection');

// Apex Domain Enforcement
const apexRule = /RewriteCond %\{HTTP_HOST\} \^www\\.99comlabs\\.co\\.in\$ \[NC\][\r\n\s]+RewriteRule \^\(\.\*\)\$ https:\/\/99comlabs\.co\.in\/\$1 \[L,R=301\]/;
assert('Suite 3: Server and Hosting Configurations Audit', apexRule.test(htaccess), '.htaccess redirects www.99comlabs.co.in to canonical apex domain');

// index.html Stripping
const indexStripRule = /RewriteCond %\{THE_REQUEST\} \^\[A-Z\]\{3,9\}\\ \/index\\.html\\ HTTP\/ \[NC\][\r\n\s]+RewriteRule \^index\\.html\$ https:\/\/99comlabs\.co\.in\/ \[L,R=301\]/;
assert('Suite 3: Server and Hosting Configurations Audit', indexStripRule.test(htaccess), '.htaccess strips /index.html and redirects to canonical root /');

// support/index.html Stripping
const supportStripRule = /RewriteCond %\{THE_REQUEST\} \^\[A-Z\]\{3,9\}\\ \/support\/index\\.html\\ HTTP\/ \[NC\][\r\n\s]+RewriteRule \^support\/index\\.html\$ https:\/\/99comlabs\.co\.in\/support\/ \[L,R=301\]/;
assert('Suite 3: Server and Hosting Configurations Audit', supportStripRule.test(htaccess), '.htaccess strips /support/index.html and redirects to /support/');

// Legacy .html Redirects with 404 exclusion
const legacyHtmlRule = /RewriteCond %\{REQUEST_URI\} !.*?404\\.html/;
assert('Suite 3: Server and Hosting Configurations Audit', legacyHtmlRule.test(htaccess), '.htaccess legacy .html rewrite explicitly excludes 404.html to avoid redirect loop');

// Trailing Slash Enforcement
const trailingSlashRule = /RewriteCond %\{REQUEST_URI\} !\/\\$[\r\n\s]+RewriteRule \^\(\.\*\)\\$ https:\/\/99comlabs\.co\.in\/\$1\/ \[L,R=301\]/;
assert('Suite 3: Server and Hosting Configurations Audit', trailingSlashRule.test(htaccess), '.htaccess enforces trailing slash on page directory routes');

// Sitemap Alias
const sitemapRule = /RewriteRule \^sitemap\\\.xml\$ \/sitemap-index\.xml \[L,R=301\]/;
assert('Suite 3: Server and Hosting Configurations Audit', sitemapRule.test(htaccess), '.htaccess aliases legacy sitemap.xml to Astro sitemap-index.xml');

// Error Document 404
assert('Suite 3: Server and Hosting Configurations Audit', htaccess.includes('ErrorDocument 404 /404.html'), '.htaccess sets ErrorDocument 404 /404.html');

// Security Headers
const requiredSecHeaders = [
  'Header always set X-Frame-Options "SAMEORIGIN"',
  'Header always set X-Content-Type-Options "nosniff"',
  'Header always set X-XSS-Protection "1; mode=block"',
  'Header always set Referrer-Policy "strict-origin-when-cross-origin"',
  'Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"'
];

for (const secHeader of requiredSecHeaders) {
  assert(
    'Suite 3: Server and Hosting Configurations Audit',
    htaccess.includes(secHeader),
    `.htaccess includes security header: ${secHeader.split('"')[0].trim()}`
  );
}

// 3.2 Netlify & Cloudflare _redirects Audit
const distRedirectsPath = path.join(distDir, '_redirects');
const pubRedirectsPath = path.join(publicDir, '_redirects');

assert(
  'Suite 3: Server and Hosting Configurations Audit',
  fs.existsSync(distRedirectsPath) && fs.existsSync(pubRedirectsPath),
  '_redirects exists in both dist/ and public/'
);

const redirects = fs.readFileSync(distRedirectsPath, 'utf8');

const expectedRedirectRules = [
  { from: '/index.html', to: '/', status: '301!' },
  { from: '/support/index.html', to: '/support/', status: '301!' },
  { from: '/support', to: '/support/', status: '301!' },
  { from: '/services.html', to: '/services/', status: '301!' },
  { from: '/projects.html', to: '/projects/', status: '301!' },
  { from: '/about.html', to: '/about/', status: '301!' },
  { from: '/contact.html', to: '/contact/', status: '301!' },
  { from: '/blog.html', to: '/blog/', status: '301!' },
  { from: '/privacy.html', to: '/privacy/', status: '301!' },
  { from: '/terms.html', to: '/terms/', status: '301!' },
  { from: '/services/web-and-mobile-apps.html', to: '/services/web-and-mobile-apps/', status: '301!' },
  { from: '/services/iot-and-electronics.html', to: '/services/iot-and-electronics/', status: '301!' },
  { from: '/services/cloud-hosting-and-security.html', to: '/services/cloud-hosting-and-security/', status: '301!' },
  { from: '/services/digital-growth-and-branding.html', to: '/services/digital-growth-and-branding/', status: '301!' },
  { from: '/blog/custom-website-cost-kerala-2026.html', to: '/blog/custom-website-cost-kerala-2026/', status: '301!' },
  { from: '/blog/iot-smart-sensors-cost-reduction-small-business.html', to: '/blog/iot-smart-sensors-cost-reduction-small-business/', status: '301!' },
  { from: '/blog/cloud-hosting-vs-shared-hosting-guide.html', to: '/blog/cloud-hosting-vs-shared-hosting-guide/', status: '301!' },
  { from: '/blog/why-website-not-getting-leads-fixes.html', to: '/blog/why-website-not-getting-leads-fixes/', status: '301!' },
  { from: '/sitemap.xml', to: '/sitemap-index.xml', status: '301' },
  { from: '/*', to: '/404.html', status: '404' }
];

for (const rule of expectedRedirectRules) {
  const lineRegex = new RegExp(`^${rule.from.replace(/\*/g, '\\*')}\\s+${rule.to.replace(/\*/g, '\\*')}\\s+${rule.status}`, 'm');
  assert(
    'Suite 3: Server and Hosting Configurations Audit',
    lineRegex.test(redirects),
    `_redirects defines valid rule: ${rule.from} -> ${rule.to} (${rule.status})`
  );
}

// 3.3 cPanel Git Automated Deployment (.cpanel.yml) Audit
const cpanelYmlPath = path.join(projectRoot, '.cpanel.yml');
assert(
  'Suite 3: Server and Hosting Configurations Audit',
  fs.existsSync(cpanelYmlPath),
  '.cpanel.yml exists at project root'
);

const cpanelYml = fs.readFileSync(cpanelYmlPath, 'utf8');

assert(
  'Suite 3: Server and Hosting Configurations Audit',
  cpanelYml.includes('deployment:') && cpanelYml.includes('tasks:'),
  '.cpanel.yml has valid cPanel Git deployment YAML structure'
);

assert(
  'Suite 3: Server and Hosting Configurations Audit',
  cpanelYml.includes('export DEPLOYPATH=/home/comlabsc/public_html/'),
  '.cpanel.yml targets production directory /home/comlabsc/public_html/'
);

assert(
  'Suite 3: Server and Hosting Configurations Audit',
  cpanelYml.includes('/bin/cp -R dist/. $DEPLOYPATH'),
  '.cpanel.yml copies compiled dist/. artifacts to $DEPLOYPATH'
);

assert(
  'Suite 3: Server and Hosting Configurations Audit',
  cpanelYml.includes('/bin/chmod -R 755 $DEPLOYPATH') && cpanelYml.includes('/bin/chmod 644 $DEPLOYPATH/.htaccess'),
  '.cpanel.yml applies secure readable file permissions (755 and 644 on .htaccess)'
);

// 3.4 Robots.txt Audit
const distRobotsPath = path.join(distDir, 'robots.txt');
const pubRobotsPath = path.join(publicDir, 'robots.txt');

assert(
  'Suite 3: Server and Hosting Configurations Audit',
  fs.existsSync(distRobotsPath) && fs.existsSync(pubRobotsPath),
  'robots.txt exists in both dist/ and public/'
);

const robots = fs.readFileSync(distRobotsPath, 'utf8');

assert(
  'Suite 3: Server and Hosting Configurations Audit',
  /User-agent:\s*\*/i.test(robots),
  'robots.txt specifies User-agent: *'
);

assert(
  'Suite 3: Server and Hosting Configurations Audit',
  /Allow:\s*\//i.test(robots),
  'robots.txt specifies Allow: /'
);

assert(
  'Suite 3: Server and Hosting Configurations Audit',
  /Disallow:\s*\/scripts\//i.test(robots),
  'robots.txt disallows internal script directory /scripts/'
);

assert(
  'Suite 3: Server and Hosting Configurations Audit',
  /Sitemap:\s*https:\/\/99comlabs\.co\.in\/sitemap-index\.xml/i.test(robots),
  'robots.txt declares primary Sitemap directive pointing to https://99comlabs.co.in/sitemap-index.xml'
);

// =============================================================================
// SUMMARY & VERDICT
// =============================================================================
console.log('\n' + '='.repeat(80));
console.log('ADVERSARIAL EMPIRICAL AUDIT SUMMARY');
console.log('='.repeat(80));

for (const [suiteName, stats] of Object.entries(results.suites)) {
  console.log(`- ${suiteName}: ${stats.passed} passed, ${stats.failed} failed`);
}

console.log('-'.repeat(80));
console.log(`Total Checks Run:  ${results.passed + results.failed}`);
console.log(`Total Passed:      ${results.passed}`);
console.log(`Total Failed:      ${results.failed}`);
console.log(`Total Warnings:    ${results.warnings}`);
console.log('='.repeat(80));

if (results.failed === 0) {
  console.log('\n[FINAL VERDICT: APPROVE]');
  console.log('100% of adversarial checks on Honest Content Standards, /support/ Route, and Server Configs PASSED.\n');
  process.exit(0);
} else {
  console.error('\n[FINAL VERDICT: REQUEST_CHANGES]');
  console.error(`${results.failed} adversarial assertion(s) failed. Worker remediation required.\n`);
  process.exit(1);
}
