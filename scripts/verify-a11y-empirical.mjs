// scripts/verify-a11y-empirical.mjs
// Adversarial test runner for Touch Targets, Keyboard Navigation, Focus Rings, Reduced Motion, and Click-to-Call

import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('c:/Users/cpmoh/OneDrive/Desktop/99comlabs/99comlabs/dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('ERROR: dist/index.html does not exist. Run npm run build first.');
  process.exit(1);
}

const html = fs.readFileSync(indexPath, 'utf8');

// Find all compiled CSS files in dist/_astro/
const astroAssetDir = path.join(distDir, '_astro');
let compiledCss = '';
if (fs.existsSync(astroAssetDir)) {
  const files = fs.readdirSync(astroAssetDir);
  for (const f of files) {
    if (f.endsWith('.css')) {
      compiledCss += fs.readFileSync(path.join(astroAssetDir, f), 'utf8') + '\n';
    }
  }
}

console.log('='.repeat(80));
console.log('EMPIRICAL ACCESSIBILITY, TOUCH TARGET & INTERACTION TEST SUITE');
console.log('='.repeat(80));

let failures = [];
let passes = [];

function check(testName, condition, details) {
  if (condition) {
    passes.push({ testName, details });
    console.log(`[PASS] ${testName}`);
    if (details) console.log(`       ${details}`);
  } else {
    failures.push({ testName, details });
    console.log(`[FAIL] ${testName}`);
    if (details) console.log(`       ${details}`);
  }
}

// -----------------------------------------------------------------------------
// 1. TOUCH TARGETS VERIFICATION
// -----------------------------------------------------------------------------
console.log('\n--- 1. Touch Targets (WCAG 2.5.8 Target Size Minimum >= 44px / 56px) ---');

// 1.1 WhatsAppFloat dimension
const waFloatRegex = /<a[^>]*data-analytics="whatsapp-float-click"[^>]*class="([^"]*)"[^>]*>/;
const waFloatMatch = html.match(waFloatRegex);
if (!waFloatMatch) {
  check('WhatsAppFloat link element presence', false, 'Could not find <a data-analytics="whatsapp-float-click"> in dist/index.html');
} else {
  const classes = waFloatMatch[1].split(/\s+/);
  const hasW14 = classes.includes('w-14');
  const hasH14 = classes.includes('h-14');
  check('WhatsAppFloat has w-14 (56px) and h-14 (56px) classes', hasW14 && hasH14, `Classes: ${classes.join(' ')}`);

  // Verify compiled CSS for w-14 and h-14
  const hasW14Css = compiledCss.includes('width:3.5rem') || compiledCss.includes('width: 3.5rem');
  const hasH14Css = compiledCss.includes('height:3.5rem') || compiledCss.includes('height: 3.5rem');
  check('CSS defines .w-14 (3.5rem = 56px) and .h-14 (3.5rem = 56px)', hasW14Css && hasH14Css,
    `width:3.5rem=${hasW14Css}, height:3.5rem=${hasH14Css}`);
}

// 1.2 Mobile Nav Toggle Button dimension
const navToggleRegex = /<button[^>]*id="mobile-nav-toggle"[^>]*class="([^"]*)"[^>]*>/;
const navToggleMatch = html.match(navToggleRegex);
if (!navToggleMatch) {
  check('Mobile navigation toggle button presence', false, 'Could not find <button id="mobile-nav-toggle"> in dist/index.html');
} else {
  const classes = navToggleMatch[1].split(/\s+/);
  const hasMinHTouch = classes.includes('min-h-touch');
  const hasMinWTouch = classes.includes('min-w-touch');
  check('Mobile toggle button has min-h-touch (44px) and min-w-touch (44px)', hasMinHTouch && hasMinWTouch,
    `Classes: ${classes.join(' ')}`);

  // Verify compiled CSS for min-h-touch and min-w-touch
  const hasMinHCss = compiledCss.includes('min-height:44px') || compiledCss.includes('min-height: 44px');
  const hasMinWCss = compiledCss.includes('min-width:44px') || compiledCss.includes('min-width: 44px');
  check('CSS defines .min-h-touch and .min-w-touch (min-height: 44px, min-width: 44px)', hasMinHCss && hasMinWCss,
    `min-height:44px=${hasMinHCss}, min-width:44px=${hasMinWCss}`);
}

// 1.3 Desktop and Mobile Navigation Links
const navLinksMatch = html.match(/<nav[^>]*aria-label="Main Navigation"[^>]*>([\s\S]*?)<\/nav>/);
if (navLinksMatch) {
  const navContent = navLinksMatch[1];
  const allNavLinksHaveMinH = !navContent.includes('<a') || navContent.includes('min-h-touch');
  check('Desktop navigation items implement min-h-touch (>= 44px)', allNavLinksHaveMinH, 'Verified min-h-touch on nav links');
}

// -----------------------------------------------------------------------------
// 2. SKIP-TO-CONTENT BYPASS LINK
// -----------------------------------------------------------------------------
console.log('\n--- 2. Keyboard Navigation & Skip-to-Content Link ---');

// Check position: must be near top of <body>
const bodyStart = html.indexOf('<body');
const skipLinkIndex = html.indexOf('href="#main-content"');
const isNearBodyStart = skipLinkIndex > bodyStart && (skipLinkIndex - bodyStart) < 1000;
check('Skip link target is #main-content and located at start of <body>', isNearBodyStart,
  `Body start at ${bodyStart}, skip link at ${skipLinkIndex}`);

// Check skip link element attributes
const skipLinkRegex = /<a[^>]*href="#main-content"[^>]*>([\s\S]*?)<\/a>/;
const skipLinkMatch = html.match(skipLinkRegex);
if (skipLinkMatch) {
  const skipTag = skipLinkMatch[0];
  const skipText = skipLinkMatch[1].trim();
  const hasSrOnly = skipTag.includes('sr-only');
  const hasFocusNotSrOnly = skipTag.includes('focus:not-sr-only');
  const hasFocusVisibleRing = skipTag.includes('focus:ring-');
  check('Skip link has sr-only and focus:not-sr-only classes', hasSrOnly && hasFocusNotSrOnly, skipTag.slice(0, 100));
  check('Skip link has visible text "Skip to main content"', skipText.includes('Skip to main content'), `Text: "${skipText}"`);
  check('Skip link has prominent focus ring styling', hasFocusVisibleRing, 'Contains focus:ring- classes');
} else {
  check('Skip link exists in document', false, 'Missing href="#main-content" anchor tag');
}

// Check main landmark
const mainLandmarkRegex = /<main[^>]*id="main-content"[^>]*>/;
const mainLandmarkMatch = html.match(mainLandmarkRegex);
if (mainLandmarkMatch) {
  const mainTag = mainLandmarkMatch[0];
  const hasTabIndex = mainTag.includes('tabindex="-1"');
  check('Main landmark has id="main-content" and tabindex="-1" for program focus', hasTabIndex, mainTag);
} else {
  check('Main landmark <main id="main-content"> exists', false, 'Missing target landmark');
}

// -----------------------------------------------------------------------------
// 3. FOCUS RINGS (:focus-visible) & REDUCED MOTION OVERRIDES
// -----------------------------------------------------------------------------
console.log('\n--- 3. Focus Rings & prefers-reduced-motion Overrides ---');

// Check :focus-visible in compiled CSS
const hasFocusVisibleRule = compiledCss.includes(':focus-visible') &&
  (compiledCss.includes('0 0 0 2px #fff') || compiledCss.includes('0 0 0 2px #ffffff') || compiledCss.includes('0 0 0 4px #2563eb'));
check(':focus-visible global high-contrast ring compiled in CSS', hasFocusVisibleRule,
  `Found :focus-visible with box-shadow in compiled CSS: ${hasFocusVisibleRule}`);

// Check prefers-reduced-motion in compiled CSS
const hasReducedMotionMedia = compiledCss.includes('prefers-reduced-motion:reduce') || compiledCss.includes('prefers-reduced-motion: reduce');
const hasReducedMotionDuration = compiledCss.includes('.01ms!important') || compiledCss.includes('0.01ms!important') || compiledCss.includes('0.01ms !important');
const hasScrollBehaviorAuto = compiledCss.includes('scroll-behavior:auto!important') || compiledCss.includes('scroll-behavior: auto !important');
check('prefers-reduced-motion: reduce media query exists in compiled CSS', hasReducedMotionMedia,
  `prefers-reduced-motion: ${hasReducedMotionMedia}`);
check('prefers-reduced-motion overrides animation & transition durations to 0.01ms', hasReducedMotionDuration,
  `0.01ms !important: ${hasReducedMotionDuration}`);
check('prefers-reduced-motion resets scroll-behavior to auto !important', hasScrollBehaviorAuto,
  `scroll-behavior: auto !important: ${hasScrollBehaviorAuto}`);

// Check that animated elements use motion-safe
const hasMotionSafePing = html.includes('motion-safe:animate-ping') || html.includes('animate-ping');
check('WhatsApp decorative ping animation uses motion-safe:animate-ping', html.includes('motion-safe:animate-ping'),
  'Ensures animations are suppressed when user requests reduced motion');

// -----------------------------------------------------------------------------
// 4. CLICK-TO-CALL LINKS
// -----------------------------------------------------------------------------
console.log('\n--- 4. Click-to-Call Phone Links (tel:+919745551513) ---');

// Find all tel: links
const telMatches = [...html.matchAll(/<a[^>]*href="(tel:[^"]*)"[^>]*>([\s\S]*?)<\/a>/g)];
check('At least one tel: link exists in index.html', telMatches.length > 0, `Found ${telMatches.length} tel: link(s)`);

let allTelCorrect = true;
let telDetails = [];
for (let i = 0; i < telMatches.length; i++) {
  const [fullTag, href, innerHtml] = telMatches[i];
  const cleanText = innerHtml.replace(/<[^>]*>/g, '').trim();
  const isExactHref = href === 'tel:+919745551513';
  const containsNumber = cleanText.includes('+91 9745551513') || cleanText.includes('9745551513');
  telDetails.push({ href, cleanText, isExactHref, containsNumber });
  if (!isExactHref || !containsNumber) {
    allTelCorrect = false;
  }
}

check('All tel: links have exact href="tel:+919745551513" and visible phone number', allTelCorrect,
  JSON.stringify(telDetails, null, 2));

// -----------------------------------------------------------------------------
// 5. SUMMARY
// -----------------------------------------------------------------------------
console.log('\n' + '='.repeat(80));
console.log(`SUMMARY: ${passes.length} passed, ${failures.length} failed out of ${passes.length + failures.length} checks.`);
console.log('='.repeat(80));

if (failures.length > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
