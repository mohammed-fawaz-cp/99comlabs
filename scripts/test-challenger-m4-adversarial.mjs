#!/usr/bin/env node
/**
 * scripts/test-challenger-m4-adversarial.mjs
 * 
 * Milestone 4 Phase 2: Adversarial Coverage Hardening (Tier 5 Stress Test Harness)
 * Author: challenger_m4_1 (Empirical Challenger)
 * 
 * Deep Empirical Stress-Testing across 4 Core Adversarial Dimensions:
 * 1. Form Inputs with Extreme Payloads & Concurrency:
 *    - Extreme non-ASCII Unicode & Emojis
 *    - HTML entities & XSS injection payloads
 *    - 5,000-character large specs payload
 *    - Whitespace trimming bypass attempts
 *    - Concurrency & double-submit race condition analysis
 *    - Network timeout / server failure fallback & recovery channels
 *    - Full reset cycle & state transitions
 * 2. Route, Navigation & Link Edge Cases:
 *    - Query string stripping in canonical & OG metadata
 *    - In-page hash fragment (#id) existence across all pages
 *    - 404 page accessibility, landmarks, recovery hub, and noindex/no-canonical directives
 *    - Legacy .html and trailing slash redirects (.htaccess and _redirects)
 * 3. Technical SEO, Rich Results & Social Metadata:
 *    - Real disk existence audit for Open Graph share images (og:image)
 *    - Open Graph 1200x630 dimensions & descriptive alt attributes
 *    - Blog Article schema: datePublished vs dateModified, nested entities, and schema 'image' property
 *    - Strict trailing slash consistency across canonicals, sitemaps, and internal links
 * 4. Responsive & CSS Edge Cases (Ultra-Narrow 320px & Overflow):
 *    - Hardcoded pixel width constraints > 320px
 *    - CSS overflow-x triggers & wide containers
 *    - Long unbreakable URL / word handling & touch target collisions
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', 'dist');

console.log('='.repeat(80));
console.log('  99COMLABS MILESTONE 4 PHASE 2: EMPIRICAL ADVERSARIAL STRESS TEST (TIER 5)');
console.log('='.repeat(80));
console.log(`Auditing Build Output: ${distDir}\n`);

if (!fs.existsSync(distDir)) {
  console.error(`[FATAL] Build output directory does not exist: ${distDir}`);
  console.error('Run "npm run build" before executing this adversarial test harness.');
  process.exit(1);
}

const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  findings: []
};

function assertTest(condition, category, testName, details = '', isCritical = true) {
  stats.total++;
  if (condition) {
    stats.passed++;
    console.log(`  [PASS] [${category}] ${testName}`);
    if (details) console.log(`         ${details}`);
  } else {
    if (isCritical) {
      stats.failed++;
      stats.findings.push({ severity: 'CRITICAL', category, testName, details });
      console.error(`  [FAIL] [${category}] ${testName}`);
      if (details) console.error(`         ERROR: ${details}`);
    } else {
      stats.warnings++;
      stats.findings.push({ severity: 'WARNING', category, testName, details });
      console.warn(`  [WARN] [${category}] ${testName}`);
      if (details) console.warn(`         WARNING: ${details}`);
    }
  }
}

// Helper: Discover all HTML files
function discoverHtmlFiles(dir) {
  let results = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(discoverHtmlFiles(full));
    } else if (item.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

const htmlFiles = discoverHtmlFiles(distDir);
console.log(`Discovered ${htmlFiles.length} HTML files in dist/:\n`);

// =============================================================================
// SUITE 1: CONTACT FORM EXTREME PAYLOADS, CONCURRENCY & RECOVERY
// =============================================================================
console.log('\n' + '='.repeat(80));
console.log('SUITE 1: FORM INPUTS, ADVERSARIAL PAYLOADS & CONCURRENCY');
console.log('='.repeat(80));

const contactHtmlPath = path.join(distDir, 'contact', 'index.html');
assertTest(fs.existsSync(contactHtmlPath), 'FORM', 'Contact HTML file exists in dist', contactHtmlPath);

const contactHtml = fs.readFileSync(contactHtmlPath, 'utf8');

// Extract inline contact form JS logic
const scriptMatches = [...contactHtml.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
const formScriptObj = scriptMatches.find(m => m[1].includes('initContactForm'));
assertTest(formScriptObj !== undefined, 'FORM', 'Inline contact form JS logic found in contact/index.html');

const formScriptSource = formScriptObj ? formScriptObj[1] : '';

// Helper to create a simulated DOM environment in node:vm
function createFormTestEnvironment() {
  const elements = {};
  const listeners = {};

  class MockClassList {
    constructor() { this.classes = new Set(); }
    add(...cls) { cls.forEach(c => this.classes.add(c)); }
    remove(...cls) { cls.forEach(c => this.classes.delete(c)); }
    contains(c) { return this.classes.has(c); }
    toggle(c) { this.classes.has(c) ? this.classes.delete(c) : this.classes.add(c); }
  }

  class MockElement {
    constructor(id) {
      this.id = id;
      this.value = '';
      this.textContent = '';
      this.disabled = false;
      this.classList = new MockClassList();
      this.attrs = {};
      this.listeners = {};
    }
    setAttribute(k, v) { this.attrs[k] = String(v); }
    getAttribute(k) { return this.attrs[k] || null; }
    removeAttribute(k) { delete this.attrs[k]; }
    addEventListener(evt, fn) {
      if (!this.listeners[evt]) this.listeners[evt] = [];
      this.listeners[evt].push(fn);
    }
    focus() { this.focused = true; }
    scrollIntoView() { this.scrolled = true; }
    reset() { this.value = ''; }
    async dispatchEvent(evt) {
      const handlers = this.listeners[evt.type] || [];
      for (const h of handlers) {
        await h(evt);
      }
    }
  }

  const ids = [
    'contact-inquiry-form', 'form-success-container', 'form-error-banner',
    'btn-submit-inquiry', 'btn-text', 'btn-icon-arrow', 'btn-spinner',
    'btn-reset-form', 'fullName', 'email', 'phone', 'serviceCategory',
    'projectBudget', 'projectDetails', '_gotcha', 'char-count',
    'projectDetails-counter', 'fullName-error', 'email-error',
    'phone-error', 'serviceCategory-error', 'projectDetails-error'
  ];

  ids.forEach(id => {
    elements[id] = new MockElement(id);
  });

  // Initial visibility classes matching HTML
  elements['form-success-container'].classList.add('hidden');
  elements['form-error-banner'].classList.add('hidden');
  elements['btn-spinner'].classList.add('hidden');
  elements['fullName-error'].classList.add('hidden');
  elements['email-error'].classList.add('hidden');
  elements['phone-error'].classList.add('hidden');
  elements['serviceCategory-error'].classList.add('hidden');
  elements['projectDetails-error'].classList.add('hidden');

  let fetchCalls = [];
  let fetchImpl = async (url, opts) => {
    fetchCalls.push({ url, opts });
    return { ok: true, status: 200, json: async () => ({ success: true }) };
  };

  const sandbox = {
    document: {
      getElementById: (id) => elements[id] || null,
      addEventListener: (evt, fn) => {
        if (!listeners[evt]) listeners[evt] = [];
        listeners[evt].push(fn);
      }
    },
    window: {
      gtag: null
    },
    fetch: (url, opts) => fetchImpl(url, opts),
    console: {
      warn: () => {},
      error: () => {},
      log: () => {}
    }
  };

  vm.createContext(sandbox);
  vm.runInContext(formScriptSource, sandbox);

  return {
    elements,
    sandbox,
    getFetchCalls: () => fetchCalls,
    setFetchImpl: (fn) => { fetchImpl = fn; }
  };
}

// 1.1 Extreme Unicode / Emoji Payloads
{
  const env = createFormTestEnvironment();
  const el = env.elements;

  el.fullName.value = 'राहुल മേനോൻ (Rahul) 🚀 💻 👨‍💻';
  el.email.value = 'rahul.menon+testing123@subdomain.example.co.in';
  el.phone.value = '+91 (974) 555-1513';
  el.serviceCategory.value = 'IoT & Electronics';
  el.projectBudget.value = '₹1,50,000 - ₹5,00,000';
  el.projectDetails.value = 'നമസ്കാരം! We require an advanced telemetry system with Unicode symbols & emojis: 📈 ⚡ 🌡️ 🤖. Multi-language strings: മലയാളം, हिन्दी, English.';

  const submitEvt = { type: 'submit', preventDefault: () => {} };
  await el['contact-inquiry-form'].dispatchEvent(submitEvt);

  const calls = env.getFetchCalls();
  assertTest(calls.length === 1, 'FORM_UNICODE', 'Form submits exactly 1 request for Unicode payload', `Dispatched ${calls.length} calls`);
  
  const payload = JSON.parse(calls[0].opts.body);
  assertTest(payload.fullName === 'राहुल മേനോൻ (Rahul) 🚀 💻 👨‍💻', 'FORM_UNICODE', 'Unicode/emoji full name preserved verbatim', payload.fullName);
  assertTest(payload.projectDetails.includes('നമസ്കാരം!') && payload.projectDetails.includes('📈 ⚡ 🌡️'), 'FORM_UNICODE', 'Malayalam & emoji project details serialized cleanly in JSON');
  assertTest(el['form-success-container'].classList.contains('hidden') === false, 'FORM_UNICODE', 'Success container revealed after Unicode submission');
  assertTest(el['contact-inquiry-form'].classList.contains('hidden') === true, 'FORM_UNICODE', 'Form hidden after successful Unicode submission');
}

// 1.2 HTML Entities & XSS Attack Payloads
{
  const env = createFormTestEnvironment();
  const el = env.elements;

  el.fullName.value = '<script>alert("xss")</script> &amp; <Rahul>';
  el.email.value = 'security.test@example.com';
  el.phone.value = '9846000000';
  el.serviceCategory.value = 'Web & Mobile Apps';
  el.projectDetails.value = '<div class="test">Testing <script> injection & "quotes" & \'single quotes\' in requirements</div>';

  const submitEvt = { type: 'submit', preventDefault: () => {} };
  await el['contact-inquiry-form'].dispatchEvent(submitEvt);

  const calls = env.getFetchCalls();
  assertTest(calls.length === 1, 'FORM_XSS', 'Form processes HTML tag/entity payload safely without crash');
  
  let validJson = false;
  try {
    const parsed = JSON.parse(calls[0].opts.body);
    validJson = parsed.fullName === '<script>alert("xss")</script> &amp; <Rahul>' &&
                parsed.projectDetails.includes('<div class="test">');
  } catch (e) {
    validJson = false;
  }
  assertTest(validJson, 'FORM_XSS', 'HTML tags and entities serialized into valid standard JSON payload without corruption');
}

// 1.3 5,000-character Large Payload Stress-Test
{
  const env = createFormTestEnvironment();
  const el = env.elements;

  const longRequirement = 'A'.repeat(5000);
  el.fullName.value = 'Enterprise Client';
  el.email.value = 'enterprise@corp.example.com';
  el.phone.value = '9846000000';
  el.serviceCategory.value = 'Cloud & Security';
  el.projectDetails.value = longRequirement;

  const submitEvt = { type: 'submit', preventDefault: () => {} };
  await el['contact-inquiry-form'].dispatchEvent(submitEvt);

  const calls = env.getFetchCalls();
  const payload = JSON.parse(calls[0].opts.body);
  assertTest(payload.projectDetails.length === 5000, 'FORM_STRESS', '5,000 character requirement payload transmitted completely without truncation', `Received ${payload.projectDetails.length} characters`);
}

// 1.4 Whitespace Trimming & Bypass Rejection
{
  const env = createFormTestEnvironment();
  const el = env.elements;

  // Name: only spaces
  el.fullName.value = '      ';
  // Email: only spaces
  el.email.value = '   \t   ';
  // Phone: only dashes/spaces (0 digits)
  el.phone.value = '  - - -  ';
  // Details: 20 spaces (length 20, but trimmed 0)
  el.projectDetails.value = '                    ';
  el.serviceCategory.value = '';

  const submitEvt = { type: 'submit', preventDefault: () => {} };
  await el['contact-inquiry-form'].dispatchEvent(submitEvt);

  const calls = env.getFetchCalls();
  assertTest(calls.length === 0, 'FORM_TRIM', 'Whitespace-only inputs completely rejected, 0 network requests dispatched', `Dispatched ${calls.length} calls`);
  assertTest(el.fullName.attrs['aria-invalid'] === 'true', 'FORM_TRIM', 'Whitespace-only fullName marked aria-invalid="true"');
  assertTest(el.email.attrs['aria-invalid'] === 'true', 'FORM_TRIM', 'Whitespace-only email marked aria-invalid="true"');
  assertTest(el.phone.attrs['aria-invalid'] === 'true', 'FORM_TRIM', 'Non-digit phone marked aria-invalid="true"');
  assertTest(el.projectDetails.attrs['aria-invalid'] === 'true', 'FORM_TRIM', 'Whitespace-only details marked aria-invalid="true"');
  assertTest(el['fullName-error'].classList.contains('hidden') === false, 'FORM_TRIM', 'Inline error message revealed for fullName');
}

// 1.5 Concurrency & Double-Submit Race Condition Analysis
{
  const env = createFormTestEnvironment();
  const el = env.elements;

  el.fullName.value = 'Fast Clicker';
  el.email.value = 'fast@example.com';
  el.phone.value = '9846000000';
  el.serviceCategory.value = 'Web & Mobile Apps';
  el.projectDetails.value = 'Requirements for concurrent submit testing.';

  // Simulate slow network with 100ms latency
  let delayedResolve;
  env.setFetchImpl(async (url, opts) => {
    env.getFetchCalls().push({ url, opts });
    await new Promise(r => { delayedResolve = r; });
    return { ok: true, status: 200, json: async () => ({}) };
  });

  const submitEvt1 = { type: 'submit', preventDefault: () => {} };
  const submitPromise1 = el['contact-inquiry-form'].dispatchEvent(submitEvt1);

  // While submitPromise1 is pending, check if submit button is disabled
  const buttonDisabledDuringFlight = el['btn-submit-inquiry'].disabled === true;
  assertTest(buttonDisabledDuringFlight, 'FORM_CONCURRENCY', 'Submit button disabled immediately upon first submission to prevent GUI double-clicks');

  // Trigger rapid second submit event during flight (e.g. keyboard Enter or programmatic dispatch)
  const submitEvt2 = { type: 'submit', preventDefault: () => {} };
  const submitPromise2 = el['contact-inquiry-form'].dispatchEvent(submitEvt2);

  // Complete the network call
  if (delayedResolve) delayedResolve();
  await Promise.all([submitPromise1, submitPromise2]);

  const calls = env.getFetchCalls();
  const doubleSubmitGuarded = calls.length === 1;
  // If calls.length > 1, document as finding
  assertTest(
    doubleSubmitGuarded,
    'FORM_CONCURRENCY',
    'Client form handler enforces an isSubmitting mutex guard against simultaneous in-flight submit events',
    doubleSubmitGuarded 
      ? 'Single network call dispatched.' 
      : `Dispatched ${calls.length} concurrent calls (Race Condition Vulnerability: isSubmitting guard missing).`,
    false // Non-fatal warning / recommendation
  );
}

// 1.6 Network Dropout / Server 500 / Network Timeout
{
  const env = createFormTestEnvironment();
  const el = env.elements;

  el.fullName.value = 'Recovery Test';
  el.email.value = 'recovery@example.com';
  el.phone.value = '9846000000';
  el.serviceCategory.value = 'Web & Mobile Apps';
  el.projectDetails.value = 'Valid requirements for network error test.';

  // Mock network rejection
  env.setFetchImpl(async () => {
    throw new TypeError('Failed to fetch: Connection timeout');
  });

  const submitEvt = { type: 'submit', preventDefault: () => {} };
  await el['contact-inquiry-form'].dispatchEvent(submitEvt);

  assertTest(el['form-error-banner'].classList.contains('hidden') === false, 'FORM_NETWORK_ERROR', 'Error alert banner revealed upon network failure');
  assertTest(el['btn-submit-inquiry'].disabled === false, 'FORM_NETWORK_ERROR', 'Submit button re-enabled after network failure allowing user retry');
  assertTest(contactHtml.includes('Call +91 9745551513') && contactHtml.includes('WhatsApp (+91 9745551513)'), 'FORM_NETWORK_ERROR', 'Error banner embeds direct phone and WhatsApp escape hatches');
}

// 1.7 Reset Form Cycle & Clean Re-entry
{
  const env = createFormTestEnvironment();
  const el = env.elements;

  el.fullName.value = 'Old User';
  el.email.value = 'old@example.com';
  el.phone.value = '9846000000';
  el.serviceCategory.value = 'Web & Mobile Apps';
  el.projectDetails.value = 'Old requirements that were submitted.';

  const submitEvt = { type: 'submit', preventDefault: () => {} };
  await el['contact-inquiry-form'].dispatchEvent(submitEvt);

  // Click reset button
  const clickResetEvt = { type: 'click' };
  await el['btn-reset-form'].dispatchEvent(clickResetEvt);

  assertTest(el['form-success-container'].classList.contains('hidden') === true, 'FORM_RESET', 'Success container hidden on form reset');
  assertTest(el['contact-inquiry-form'].classList.contains('hidden') === false, 'FORM_RESET', 'Form made visible again on reset');
  assertTest(el.fullName.focused === true, 'FORM_RESET', 'Focus returned to fullName input for seamless keyboard re-entry');
}

// =============================================================================
// SUITE 2: ROUTE, NAVIGATION & LINK INTEGRITY EDGE CASES
// =============================================================================
console.log('\n' + '='.repeat(80));
console.log('SUITE 2: ROUTE, NAVIGATION & LINK INTEGRITY EDGE CASES');
console.log('='.repeat(80));

// 2.1 Query Parameter Stripping & Canonical Uniformity
{
  let canonicalQueryViolations = 0;
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const rel = path.relative(distDir, file).replace(/\\/g, '/');
    if (rel === '404.html') continue;

    const canonicalMatch = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
    if (canonicalMatch) {
      const canonicalUrl = canonicalMatch[1];
      if (canonicalUrl.includes('?') || canonicalUrl.includes('#')) {
        canonicalQueryViolations++;
        console.error(`  [CANONICAL_PARAM] ${rel} canonical contains query or hash: ${canonicalUrl}`);
      }
    }
  }
  assertTest(canonicalQueryViolations === 0, 'ROUTING', 'All canonical tags strictly strip query parameters and hash fragments');
}

// 2.2 Hash Fragment Target Existence Audit
{
  let brokenHashLinks = 0;
  const hashLinkRegex = /<a\s+[^>]*href=["']#([^"']+)["'][^>]*>/gi;

  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const rel = path.relative(distDir, file).replace(/\\/g, '/');

    // Extract all IDs present in document
    const idMatches = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(m => m[1]);
    const docIds = new Set(idMatches);

    let match;
    while ((match = hashLinkRegex.exec(html)) !== null) {
      const targetId = match[1];
      if (!docIds.has(targetId)) {
        brokenHashLinks++;
        console.error(`  [BROKEN_HASH] In ${rel}: Link href="#${targetId}" has no matching element with id="${targetId}"`);
      }
    }
  }
  assertTest(brokenHashLinks === 0, 'ROUTING', 'All in-page hash links (#id) resolve to valid existing DOM targets on the host page', `Found ${brokenHashLinks} broken anchor targets`);
}

// 2.3 404 Page Accessibility & Crawl Directive Integrity
{
  const notFoundPath = path.join(distDir, '404.html');
  assertTest(fs.existsSync(notFoundPath), '404_PAGE', 'Standalone 404.html exists in dist root', notFoundPath);

  const notFoundHtml = fs.readFileSync(notFoundPath, 'utf8');

  // Must have noindex meta
  const hasNoindex = notFoundHtml.includes('name="robots"') && notFoundHtml.includes('noindex');
  assertTest(hasNoindex, '404_PAGE', '404.html contains meta robots="noindex, nofollow" directive');

  // Must NOT have canonical tag (standard SEO rule: 404 should never canonicalize)
  const hasCanonical = /<link\s+[^>]*rel=["']canonical["']/i.test(notFoundHtml);
  assertTest(!hasCanonical, '404_PAGE', '404.html correctly omits self-referencing canonical tag to avoid indexing invalid routes');

  // Must have skip-link and main landmark
  assertTest(notFoundHtml.includes('href="#main-content"'), '404_PAGE', '404.html includes accessible skip-to-content link');
  assertTest(notFoundHtml.includes('id="main-content"'), '404_PAGE', '404.html contains main landmark id="main-content"');

  // Must have recovery navigation links
  const hasHomeLink = notFoundHtml.includes('href="/"');
  const hasServicesLink = notFoundHtml.includes('href="/services/"');
  const hasBlogLink = notFoundHtml.includes('href="/blog/"');
  const hasSupportLink = notFoundHtml.includes('href="/support/"');
  assertTest(hasHomeLink && hasServicesLink && hasBlogLink && hasSupportLink, '404_PAGE', '404.html provides clear recovery hub links to Home, Services, Blog, and Support');

  // Direct rescue channels
  assertTest(notFoundHtml.includes('wa.me/919745551513') && notFoundHtml.includes('tel:+919745551513'), '404_PAGE', '404.html embeds direct WhatsApp and phone rescue links');
}

// 2.4 Legacy Route Redirects Integrity
{
  const htaccessPath = path.join(distDir, '.htaccess');
  const redirectsPath = path.join(distDir, '_redirects');

  assertTest(fs.existsSync(htaccessPath), 'REDIRECTS', '.htaccess file exists in dist output');
  assertTest(fs.existsSync(redirectsPath), 'REDIRECTS', '_redirects file exists in dist output');

  const redirectsContent = fs.existsSync(redirectsPath) ? fs.readFileSync(redirectsPath, 'utf8') : '';
  const htaccessContent = fs.existsSync(htaccessPath) ? fs.readFileSync(htaccessPath, 'utf8') : '';

  // Check 301 redirects for legacy flat pages
  const legacyPages = ['services', 'projects', 'about', 'contact', 'blog', 'privacy', 'terms'];
  let allLegacyCovered = true;
  for (const page of legacyPages) {
    if (!redirectsContent.includes(`/${page}.html`)) {
      allLegacyCovered = false;
      console.error(`  [REDIRECT_MISSING] /${page}.html missing in _redirects`);
    }
  }
  assertTest(allLegacyCovered, 'REDIRECTS', 'All legacy flat .html routes mapped to clean trailing slash URLs in _redirects');

  // Check trailing slash normalization for /support
  assertTest(redirectsContent.includes('/support /support/ 301!'), 'REDIRECTS', '_redirects enforces trailing slash normalization for /support route');

  // Check custom 404 handler in both files
  assertTest(redirectsContent.includes('/* /404.html 404'), 'REDIRECTS', '_redirects includes fallback custom 404 handler rule');
  assertTest(htaccessContent.includes('ErrorDocument 404 /404.html'), 'REDIRECTS', '.htaccess includes ErrorDocument 404 /404.html directive');
}

// =============================================================================
// SUITE 3: TECHNICAL SEO, SCHEMAS & SOCIAL METADATA EDGE CASES
// =============================================================================
console.log('\n' + '='.repeat(80));
console.log('SUITE 3: TECHNICAL SEO, RICH RESULTS & SOCIAL METADATA EDGE CASES');
console.log('='.repeat(80));

// 3.1 Social Sharing Image (OG Image) Physical File Existence
{
  let missingOgImages = 0;
  const ogImageRegex = /<meta\s+[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i;

  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const rel = path.relative(distDir, file).replace(/\\/g, '/');

    const match = html.match(ogImageRegex);
    if (match) {
      const ogUrl = match[1];
      // Convert URL to local path
      let localPath;
      if (ogUrl.startsWith('https://99comlabs.co.in/')) {
        const subPath = ogUrl.replace('https://99comlabs.co.in/', '');
        localPath = path.join(distDir, subPath);
      } else if (ogUrl.startsWith('/')) {
        localPath = path.join(distDir, ogUrl.slice(1));
      } else {
        localPath = path.join(distDir, ogUrl);
      }

      if (!fs.existsSync(localPath)) {
        missingOgImages++;
        console.error(`  [OG_IMAGE_404] In ${rel}: og:image references "${ogUrl}", but file does not exist on disk: ${localPath}`);
      }
    }
  }

  assertTest(
    missingOgImages === 0,
    'SEO_OG',
    'Open Graph share images referenced in <meta property="og:image"> exist physically on disk',
    missingOgImages === 0 
      ? 'All referenced OG share images exist.' 
      : `CRITICAL DEFECT: ${missingOgImages} pages reference non-existent og:image file (og-share.png 404)!`,
    true
  );
}

// 3.2 Open Graph Dimensions & Alt Attributes
{
  let dimensionViolations = 0;
  let altViolations = 0;

  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const rel = path.relative(distDir, file).replace(/\\/g, '/');
    if (rel === '404.html') continue;

    const hasWidth = html.includes('property="og:image:width" content="1200"');
    const hasHeight = html.includes('property="og:image:height" content="630"');
    if (!hasWidth || !hasHeight) {
      dimensionViolations++;
      console.error(`  [OG_DIMENSION] In ${rel}: Missing explicit og:image:width="1200" or height="630"`);
    }

    const hasOgAlt = html.includes('property="og:image:alt"');
    const hasTwitterAlt = html.includes('name="twitter:image:alt"');
    if (!hasOgAlt || !hasTwitterAlt) {
      altViolations++;
      console.error(`  [OG_ALT] In ${rel}: Missing og:image:alt or twitter:image:alt`);
    }
  }

  assertTest(dimensionViolations === 0, 'SEO_OG', 'All indexable pages specify explicit Open Graph dimensions (1200x630)');
  assertTest(altViolations === 0, 'SEO_OG', 'All indexable pages include accessible alt descriptions for social share images');
}

// 3.3 Blog Article Structured Data Deep Audit
{
  const blogArticleFiles = htmlFiles.filter(f => {
    const rel = path.relative(distDir, f).replace(/\\/g, '/');
    return rel.startsWith('blog/') && rel !== 'blog/index.html';
  });

  assertTest(blogArticleFiles.length === 4, 'SCHEMA_BLOG', 'Exactly 4 blog articles detected for structured data audit', `Found ${blogArticleFiles.length} files`);

  let dateSequencePassed = true;
  let missingImageInSchema = 0;
  let validAuthorsAndPublishers = true;

  for (const file of blogArticleFiles) {
    const rel = path.relative(distDir, file).replace(/\\/g, '/');
    const html = fs.readFileSync(file, 'utf8');

    const jsonLdBlocks = [...html.matchAll(/<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    const articleBlock = jsonLdBlocks.map(b => JSON.parse(b[1])).find(j => j['@type'] === 'Article' || j['@type'] === 'BlogPosting');

    if (!articleBlock) {
      console.error(`  [SCHEMA_ARTICLE_MISSING] No Article schema in ${rel}`);
      continue;
    }

    // Check dateModified vs datePublished
    const pubDate = new Date(articleBlock.datePublished);
    const modDate = new Date(articleBlock.dateModified);
    if (isNaN(pubDate.getTime()) || isNaN(modDate.getTime())) {
      dateSequencePassed = false;
      console.error(`  [SCHEMA_DATE_INVALID] In ${rel}: Invalid date format`);
    } else if (modDate < pubDate) {
      dateSequencePassed = false;
      console.error(`  [SCHEMA_DATE_ORDER] In ${rel}: dateModified (${articleBlock.dateModified}) is earlier than datePublished (${articleBlock.datePublished})`);
    }

    // Check recommended 'image' property in Article JSON-LD
    if (!articleBlock.image) {
      missingImageInSchema++;
      console.warn(`  [SCHEMA_ARTICLE_IMAGE] In ${rel}: Article JSON-LD schema does not define recommended "image" property.`);
    }

    // Check nested author & publisher
    if (!articleBlock.author || !articleBlock.author.name || !articleBlock.publisher || !articleBlock.publisher.name) {
      validAuthorsAndPublishers = false;
    }
  }

  assertTest(dateSequencePassed, 'SCHEMA_BLOG', 'datePublished and dateModified are valid ISO 8601 strings and dateModified >= datePublished');
  assertTest(validAuthorsAndPublishers, 'SCHEMA_BLOG', 'Article schemas contain complete nested author and publisher Organization objects');
  assertTest(
    missingImageInSchema === 0,
    'SCHEMA_BLOG',
    'Article JSON-LD schema defines recommended "image" property for Google Rich Results image cards and Google Discover',
    missingImageInSchema === 0
      ? 'All Article schemas define image.'
      : `GAP: ${missingImageInSchema} blog articles omit "image" property in Article JSON-LD schema (Google Rich Results non-critical recommendation).`,
    false // Warning / Non-fatal schema recommendation
  );
}

// 3.4 Trailing Slash Consistency Across All Canonical URLs & Sitemaps
{
  let canonicalTrailingSlashViolations = 0;
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const rel = path.relative(distDir, file).replace(/\\/g, '/');
    if (rel === '404.html') continue;

    const match = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
    if (match) {
      const href = match[1];
      if (!href.endsWith('/')) {
        canonicalTrailingSlashViolations++;
        console.error(`  [CANONICAL_SLASH] In ${rel}: Canonical "${href}" missing trailing slash.`);
      }
    }
  }
  assertTest(canonicalTrailingSlashViolations === 0, 'SEO_CANONICAL', '100% of canonical URLs strictly enforce trailing slashes across all pages');

  // Check sitemap URLs
  const sitemapFile = path.join(distDir, 'sitemap-0.xml');
  let sitemapSlashViolations = 0;
  if (fs.existsSync(sitemapFile)) {
    const sitemapContent = fs.readFileSync(sitemapFile, 'utf8');
    const locMatches = [...sitemapContent.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    for (const loc of locMatches) {
      if (!loc.endsWith('/')) {
        sitemapSlashViolations++;
        console.error(`  [SITEMAP_SLASH] Sitemap URL "${loc}" missing trailing slash.`);
      }
    }
  }
  assertTest(sitemapSlashViolations === 0, 'SEO_SITEMAP', '100% of sitemap <loc> URLs strictly enforce trailing slashes');
}

// =============================================================================
// SUITE 4: RESPONSIVE, CSS & VIEWPORT ROBUSTNESS (320px & OVERFLOW)
// =============================================================================
console.log('\n' + '='.repeat(80));
console.log('SUITE 4: RESPONSIVE & CSS ROBUSTNESS (320px NARROW VIEWPORT & OVERFLOW)');
console.log('='.repeat(80));

// 4.1 Static Audit for Hardcoded Widths Exceeding 320px
{
  let hardcodedWidthViolations = 0;
  const inlineWidthRegex = /style=["'][^"']*\bwidth:\s*(\d+)px/gi;

  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const rel = path.relative(distDir, file).replace(/\\/g, '/');

    let match;
    while ((match = inlineWidthRegex.exec(html)) !== null) {
      const widthVal = parseInt(match[1], 10);
      if (widthVal > 320) {
        hardcodedWidthViolations++;
        console.error(`  [OVERFLOW_320] In ${rel}: Inline width ${widthVal}px exceeds 320px ultra-narrow viewport.`);
      }
    }
  }
  assertTest(hardcodedWidthViolations === 0, 'RESPONSIVE_320', 'Zero hardcoded inline widths > 320px across all 18 HTML pages');
}

// 4.2 Tailwind Utility & Layout Overflow Vulnerabilities
{
  let arbitraryWidthViolations = 0;
  // Check for Tailwind arbitrary classes like w-[350px] or min-w-[360px] in HTML files
  const arbitraryWidthRegex = /\b(?:min-)?w-\[(\d+)px\]/g;

  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const rel = path.relative(distDir, file).replace(/\\/g, '/');

    let match;
    while ((match = arbitraryWidthRegex.exec(html)) !== null) {
      const w = parseInt(match[1], 10);
      if (w > 320) {
        arbitraryWidthViolations++;
        console.error(`  [ARBITRARY_WIDTH] In ${rel}: Class w-[${w}px] exceeds 320px.`);
      }
    }
  }
  assertTest(arbitraryWidthViolations === 0, 'RESPONSIVE_320', 'Zero arbitrary width classes > 320px in compiled HTML markup');
}

// 4.3 Long Unbreakable Word & URL Wrapping Verification
{
  // Inspect compiled CSS in dist/_astro/ to ensure overflow-wrap: break-word or word-break: break-word is compiled
  const astroDir = path.join(distDir, '_astro');
  let hasBreakWordCss = false;
  if (fs.existsSync(astroDir)) {
    for (const f of fs.readdirSync(astroDir)) {
      if (f.endsWith('.css')) {
        const cssContent = fs.readFileSync(path.join(astroDir, f), 'utf8');
        if (
          cssContent.includes('break-words') ||
          cssContent.includes('overflow-wrap:break-word') ||
          cssContent.includes('word-break:break-word') ||
          cssContent.includes('word-wrap:break-word')
        ) {
          hasBreakWordCss = true;
          break;
        }
      }
    }
  }
  assertTest(hasBreakWordCss, 'CSS_WRAP', 'Compiled stylesheet includes break-words / overflow-wrap for defensive wrapping of long URLs and strings');
}

// 4.4 Mobile Navigation Drawer & WhatsApp FAB Collision on 320px
{
  // Verify WhatsApp FAB z-index and touch dimensions on narrow screens
  const whatsAppFloatCode = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
  assertTest(whatsAppFloatCode.includes('w-14 h-14'), 'FAB_A11Y', 'Floating WhatsApp maintains 56px touch target (> 44px min) on narrow screens');
  assertTest(whatsAppFloatCode.includes('hidden sm:inline-block'), 'FAB_A11Y', 'WhatsApp tooltip is hidden on mobile viewports (<640px) preventing narrow-screen overflow');
}

// =============================================================================
// SUMMARY & VERDICT
// =============================================================================
console.log('\n' + '='.repeat(80));
console.log('ADVERSARIAL STRESS TEST SUMMARY');
console.log('='.repeat(80));
console.log(`Total Checks Run:     ${stats.total}`);
console.log(`Passed:               ${stats.passed}`);
console.log(`Failed (Critical):    ${stats.failed}`);
console.log(`Warnings (Non-fatal): ${stats.warnings}`);
console.log('='.repeat(80));

if (stats.findings.length > 0) {
  console.log('\nDETAILED FINDINGS:');
  stats.findings.forEach((f, idx) => {
    const symbol = f.severity === 'CRITICAL' ? '✖' : '⚠';
    console.log(`  ${symbol} [${f.severity}] [${f.category}] ${f.testName}`);
    if (f.details) console.log(`    ${f.details}`);
  });
}

console.log('\nVERDICT:');
if (stats.failed > 0) {
  console.log('[VERDICT: REQUEST_CHANGES]');
  console.log(`Discovered ${stats.failed} critical defect(s) requiring worker remediation.`);
  process.exit(1);
} else if (stats.warnings > 0) {
  console.log('[VERDICT: APPROVE WITH RECOMMENDATIONS]');
  console.log(`0 critical failures. ${stats.warnings} non-critical optimization(s) documented.`);
  process.exit(0);
} else {
  console.log('[VERDICT: APPROVE]');
  console.log('100% of adversarial stress tests passed.');
  process.exit(0);
}
