#!/usr/bin/env node
/**
 * scripts/verify-contact-empirical.mjs
 * 
 * Empirical Adversarial Test Suite for Milestone 3:
 * 1. Contact Form Client Validation & Progressive Enhancement
 * 2. Spam Honeypot Protection Drop
 * 3. Character Counter and Minimum Length Enforcement
 * 4. Submission Loading, Network Dispatch & Success State
 * 5. Error Recovery & Fallback Direct Communication Channels
 * 6. Contact Links Integrity (Phone, WhatsApp, Email)
 * 7. Preserved /support/ Route Structural & Functional Parity
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const distDir = path.resolve('c:/Users/cpmoh/OneDrive/Desktop/99comlabs/99comlabs/dist');
const contactHtmlPath = path.join(distDir, 'contact', 'index.html');
const supportHtmlPath = path.join(distDir, 'support', 'index.html');
const supportCssPath = path.join(distDir, 'support', 'support.css');
const supportJsPath = path.join(distDir, 'support', 'support.js');

console.log('='.repeat(80));
console.log('EMPIRICAL ADVERSARIAL TEST: ROUTE, CONTACT FORM & LINK VERIFICATION');
console.log('='.repeat(80));

const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function assert(condition, name, details = '') {
  if (condition) {
    results.passed++;
    results.tests.push({ status: 'PASS', name, details });
    console.log(`[PASS] ${name}`);
    if (details) console.log(`       ${details}`);
  } else {
    results.failed++;
    results.tests.push({ status: 'FAIL', name, details });
    console.error(`[FAIL] ${name}`);
    if (details) console.error(`       ERROR: ${details}`);
  }
}

// -----------------------------------------------------------------------------
// SECTION 1: STATIC ARTIFACT INTEGRITY
// -----------------------------------------------------------------------------
console.log('\n--- Section 1: Static Route & Artifact Verification ---');

assert(fs.existsSync(contactHtmlPath), 'Contact HTML file exists in dist', contactHtmlPath);
assert(fs.existsSync(supportHtmlPath), 'Preserved Support HTML exists in dist', supportHtmlPath);
assert(fs.existsSync(supportCssPath), 'Support CSS exists in dist', supportCssPath);
assert(fs.existsSync(supportJsPath), 'Support JS exists in dist', supportJsPath);

const contactHtml = fs.readFileSync(contactHtmlPath, 'utf8');
const supportHtml = fs.readFileSync(supportHtmlPath, 'utf8');
const supportJs = fs.readFileSync(supportJsPath, 'utf8');

// -----------------------------------------------------------------------------
// SECTION 2: CONTACT PAGE COMMUNICATION CHANNELS & ACCESSIBILITY AUDIT
// -----------------------------------------------------------------------------
console.log('\n--- Section 2: Contact Communication Links & Metadata ---');

// Phone Link
const phoneLinkRegex = /href=["']tel:\+919745551513["']/g;
const phoneMatches = contactHtml.match(phoneLinkRegex) || [];
assert(phoneMatches.length >= 2, 'Contact page contains multiple click-to-call links (+91 9745551513)', `Found ${phoneMatches.length} matching tel: links`);

// WhatsApp Link
const waLinkRegex = /href=["']https:\/\/wa\.me\/919745551513(?:\?[^"']*)?["']/g;
const waMatches = contactHtml.match(waLinkRegex) || [];
assert(waMatches.length >= 2, 'Contact page contains direct WhatsApp links (919745551513)', `Found ${waMatches.length} matching WhatsApp links`);

// Plain-text Email
assert(contactHtml.includes('connect@99comlabs.co.in'), 'Contact page exposes visible email connect@99comlabs.co.in');
assert(contactHtml.includes('mailto:connect@99comlabs.co.in'), 'Contact page contains mailto:connect@99comlabs.co.in link');

// Honeypot field in HTML
assert(contactHtml.includes('id="_gotcha"') && contactHtml.includes('name="_gotcha"'), 'Honeypot input _gotcha is present in contact HTML');
assert(contactHtml.includes('tabindex="-1"'), 'Honeypot has tabindex="-1" to prevent keyboard tab focus');

// Exact Success Message in HTML
const expectedSuccessMessage = 'Thank you! Your inquiry has been received. Our team in Kerala will contact you within 24 business hours.';
assert(contactHtml.includes(expectedSuccessMessage), 'Contact HTML contains exact required success confirmation message', expectedSuccessMessage);

// -----------------------------------------------------------------------------
// SECTION 3: EMPIRICAL HARNESS FOR CONTACT FORM CLIENT LOGIC
// -----------------------------------------------------------------------------
console.log('\n--- Section 3: Empirical Stress-Testing of Contact Form Logic ---');

// Extract inline script from dist/contact/index.html
const allScripts = [...contactHtml.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
const scriptObj = allScripts.find(s => s[1].includes('initContactForm'));
assert(scriptObj !== undefined, 'Found inline contact form initialization script in dist/contact/index.html');

const formScriptCode = scriptObj ? scriptObj[1] : '';

// Helper to construct a Mock DOM Element
class MockElement {
  constructor(id, tagName = 'div', attributes = {}) {
    this.id = id;
    this.tagName = tagName.toUpperCase();
    this.value = '';
    this.textContent = '';
    this.attributes = { ...attributes };
    this.classList = new Set((attributes.class || '').split(/\s+/).filter(Boolean));
    this.eventListeners = {};
    this.disabled = false;
    this.focused = false;
    this.options = [];
    this.selectedIndex = 0;
  }

  setAttribute(name, val) {
    this.attributes[name] = String(val);
  }

  getAttribute(name) {
    return this.attributes[name] ?? null;
  }

  removeAttribute(name) {
    delete this.attributes[name];
  }

  hasAttribute(name) {
    return name in this.attributes;
  }

  addEventListener(event, handler) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(handler);
  }

  async dispatchEvent(eventObj) {
    const handlers = this.eventListeners[eventObj.type] || [];
    for (const h of handlers) {
      await h.call(this, eventObj);
    }
  }

  focus() {
    this.focused = true;
  }

  scrollIntoView() {}

  reset() {
    this.value = '';
    this.focused = false;
  }
}

// Add DOM classList helpers
function enhanceClassList(elem) {
  const list = elem.classList;
  return {
    add: (...tokens) => tokens.forEach(t => list.add(t)),
    remove: (...tokens) => tokens.forEach(t => list.delete(t)),
    toggle: (token) => list.has(token) ? list.delete(token) : list.add(token),
    contains: (token) => list.has(token)
  };
}

// Build Mock DOM tree replicating dist/contact/index.html form elements
function createMockEnvironment() {
  const elements = new Map();

  function register(id, tag, attrs = {}) {
    const el = new MockElement(id, tag, attrs);
    el.classList = enhanceClassList(el);
    elements.set(id, el);
    return el;
  }

  // Register all elements referenced in initContactForm
  const form = register('contact-inquiry-form', 'form', {
    action: 'https://formsubmit.co/ajax/connect@99comlabs.co.in',
    method: 'POST'
  });
  const successBox = register('form-success-container', 'div', { class: 'hidden' });
  const errorBanner = register('form-error-banner', 'div', { class: 'hidden' });
  const submitBtn = register('btn-submit-inquiry', 'button');
  const btnText = register('btn-text', 'span');
  btnText.textContent = 'Submit Project Inquiry';
  const btnArrow = register('btn-icon-arrow', 'svg');
  const btnSpinner = register('btn-spinner', 'svg', { class: 'hidden' });
  const resetBtn = register('btn-reset-form', 'button');

  const fullNameInput = register('fullName', 'input', { required: '', 'aria-invalid': 'false' });
  const emailInput = register('email', 'input', { type: 'email', required: '', 'aria-invalid': 'false' });
  const phoneInput = register('phone', 'input', { type: 'tel', required: '', 'aria-invalid': 'false' });
  const serviceInput = register('serviceCategory', 'select', { required: '', 'aria-invalid': 'false' });
  const budgetInput = register('projectBudget', 'select');
  const detailsInput = register('projectDetails', 'textarea', { required: '', 'aria-invalid': 'false' });
  const gotchaInput = register('_gotcha', 'input');
  const charCountEl = register('char-count', 'span');
  charCountEl.textContent = '0';
  const charCounterContainer = register('projectDetails-counter', 'span', { class: 'text-content-subtle' });

  const fullNameError = register('fullName-error', 'p', { class: 'hidden' });
  const emailError = register('email-error', 'p', { class: 'hidden' });
  const phoneError = register('phone-error', 'p', { class: 'hidden' });
  const serviceError = register('serviceCategory-error', 'p', { class: 'hidden' });
  const detailsError = register('projectDetails-error', 'p', { class: 'hidden' });

  // Custom form.reset
  form.reset = function() {
    [fullNameInput, emailInput, phoneInput, serviceInput, budgetInput, detailsInput, gotchaInput].forEach(inp => {
      if (inp) inp.value = '';
    });
  };

  const mockDocument = {
    getElementById: (id) => elements.get(id) || null
  };

  const fetchCalls = [];
  let mockFetchImpl = async (url, options) => {
    fetchCalls.push({ url, options });
    return { ok: true, status: 200, json: async () => ({ success: true }) };
  };

  const gtagCalls = [];
  const mockWindow = {
    gtag: (...args) => gtagCalls.push(args)
  };

  return {
    elements,
    mockDocument,
    mockWindow,
    fetchCalls,
    gtagCalls,
    setMockFetch: (fn) => { mockFetchImpl = fn; },
    getMockFetch: () => mockFetchImpl
  };
}

// Run the form script in a VM context
async function runFormHarness(setupFn) {
  const env = createMockEnvironment();
  setupFn(env);

  const context = vm.createContext({
    document: env.mockDocument,
    window: env.mockWindow,
    console: {
      warn: (...args) => {},
      error: (...args) => {},
      log: (...args) => {}
    },
    fetch: (...args) => env.getMockFetch()(...args)
  });

  vm.runInContext(formScriptCode, context);
  return env;
}

// Test Case 3.1: Empty submission trigger and visible error states
console.log('\n--- 3.1: Stress-Test Empty Submission ---');
{
  const env = await runFormHarness((e) => {
    // Leave all fields empty
  });

  const form = env.elements.get('contact-inquiry-form');
  let defaultPrevented = false;
  await form.dispatchEvent({
    type: 'submit',
    preventDefault: () => { defaultPrevented = true; }
  });

  assert(defaultPrevented, 'Form submission prevented default action on empty inputs');
  assert(env.fetchCalls.length === 0, 'No network fetch dispatched on invalid empty submission');

  // Verify error messages shown
  assert(!env.elements.get('fullName-error').classList.contains('hidden'), 'fullName-error is made visible');
  assert(env.elements.get('fullName').getAttribute('aria-invalid') === 'true', 'fullName aria-invalid set to true');

  assert(!env.elements.get('email-error').classList.contains('hidden'), 'email-error is made visible');
  assert(env.elements.get('email').getAttribute('aria-invalid') === 'true', 'email aria-invalid set to true');

  assert(!env.elements.get('phone-error').classList.contains('hidden'), 'phone-error is made visible');
  assert(env.elements.get('phone').getAttribute('aria-invalid') === 'true', 'phone aria-invalid set to true');

  assert(!env.elements.get('serviceCategory-error').classList.contains('hidden'), 'serviceCategory-error is made visible');
  assert(env.elements.get('serviceCategory').getAttribute('aria-invalid') === 'true', 'serviceCategory aria-invalid set to true');

  assert(!env.elements.get('projectDetails-error').classList.contains('hidden'), 'projectDetails-error is made visible');
  assert(env.elements.get('projectDetails').getAttribute('aria-invalid') === 'true', 'projectDetails aria-invalid set to true');

  assert(env.elements.get('fullName').focused, 'First invalid field (fullName) automatically receives focus');
  assert(env.elements.get('form-success-container').classList.contains('hidden'), 'Success container remains hidden');
}

// Test Case 3.2: Short textarea input (< 15 characters)
console.log('\n--- 3.2: Stress-Test Short Textarea Input (< 15 characters) ---');
{
  const env = await runFormHarness((e) => {});

  const detailsInput = env.elements.get('projectDetails');
  const charCountEl = env.elements.get('char-count');
  const counterContainer = env.elements.get('projectDetails-counter');

  // Populate valid required fields except details
  env.elements.get('fullName').value = 'Rahul Menon';
  env.elements.get('email').value = 'rahul@example.com';
  env.elements.get('phone').value = '9876543210';
  env.elements.get('serviceCategory').value = 'Web & Mobile Apps';

  // Set short details (10 chars < 15)
  detailsInput.value = 'Too short!';
  await detailsInput.dispatchEvent({ type: 'input' });

  assert(String(charCountEl.textContent) === '10', 'Live character counter accurately reflects input length (10)', `Counter: ${charCountEl.textContent}`);
  assert(counterContainer.classList.contains('text-amber-600'), 'Character counter container applies warning styling when < 15 chars');

  const form = env.elements.get('contact-inquiry-form');
  let defaultPrevented = false;
  await form.dispatchEvent({
    type: 'submit',
    preventDefault: () => { defaultPrevented = true; }
  });

  assert(defaultPrevented, 'Form submission prevented on short textarea (< 15 chars)');
  assert(env.fetchCalls.length === 0, 'Fetch not called when textarea is under 15 characters');
  assert(!env.elements.get('projectDetails-error').classList.contains('hidden'), 'projectDetails-error is visible');
  assert(detailsInput.getAttribute('aria-invalid') === 'true', 'projectDetails aria-invalid is true');
  assert(detailsInput.focused, 'projectDetails field receives focus as the invalid element');
}

// Test Case 3.3: Honeypot Anti-Spam Protection
console.log('\n--- 3.3: Stress-Test Honeypot Spam Bot Trap ---');
{
  const env = await runFormHarness((e) => {});

  // Simulate a spam bot populating all fields including the hidden _gotcha honeypot
  env.elements.get('fullName').value = 'Spam Bot 3000';
  env.elements.get('email').value = 'spambot@automated-junk.ru';
  env.elements.get('phone').value = '+1234567890';
  env.elements.get('serviceCategory').value = 'Web & Mobile Apps';
  env.elements.get('projectDetails').value = 'Buy cheap backlinks now from our automated portal guaranteed SEO results.';
  env.elements.get('_gotcha').value = 'automated_bot_payload'; // BOT FILL!

  const form = env.elements.get('contact-inquiry-form');
  let defaultPrevented = false;
  await form.dispatchEvent({
    type: 'submit',
    preventDefault: () => { defaultPrevented = true; }
  });

  assert(defaultPrevented, 'Submission prevented default action');
  assert(env.fetchCalls.length === 0, 'Spam honeypot SILENTLY DROPPED network request (0 fetch calls made)');
  assert(form.classList.contains('hidden'), 'Contact form hidden from view to deceive spam bot');
  assert(!env.elements.get('form-success-container').classList.contains('hidden'), 'Success container displayed to placate automated bot without spamming inbox');
  assert(env.elements.get('form-success-container').focused, 'Success container received focus');
}

// Test Case 3.4: Valid Human Submission & Success State
console.log('\n--- 3.4: Stress-Test Valid Submission with Network Mock ---');
{
  let resolveFetch;
  const fetchPromise = new Promise((resolve) => { resolveFetch = resolve; });

  const env = await runFormHarness((e) => {
    e.setMockFetch(async (url, options) => {
      e.fetchCalls.push({ url, options });
      await fetchPromise;
      return { ok: true, status: 200, json: async () => ({ success: true }) };
    });
  });

  // Populate valid form data
  env.elements.get('fullName').value = 'Deepak Varma';
  env.elements.get('email').value = 'deepak@varma-enterprises.com';
  env.elements.get('phone').value = '+91 97455 51513';
  env.elements.get('serviceCategory').value = 'IoT & Electronics';
  env.elements.get('projectBudget').value = '₹1,50,000 - ₹5,00,000';
  env.elements.get('projectDetails').value = 'We require an industrial temperature monitoring sensor with cellular fallback and cloud dashboard.';

  const form = env.elements.get('contact-inquiry-form');
  const submitBtn = env.elements.get('btn-submit-inquiry');
  const btnText = env.elements.get('btn-text');
  const btnSpinner = env.elements.get('btn-spinner');
  const btnArrow = env.elements.get('btn-icon-arrow');

  let defaultPrevented = false;
  const submitPromise = form.dispatchEvent({
    type: 'submit',
    preventDefault: () => { defaultPrevented = true; }
  });

  // Verify in-flight loading state
  assert(submitBtn.disabled, 'Submit button disabled during in-flight network dispatch');
  assert(btnText.textContent === 'Submitting Inquiry...', 'Button text updated to "Submitting Inquiry..."');
  assert(!btnSpinner.classList.contains('hidden'), 'Loading spinner is made visible');
  assert(btnArrow.classList.contains('hidden'), 'Arrow icon is hidden during loading state');

  // Complete the network call
  resolveFetch();
  await submitPromise;

  // Verify network payload
  assert(env.fetchCalls.length === 1, 'Exactly one fetch request dispatched');
  const call = env.fetchCalls[0];
  assert(call.url === 'https://formsubmit.co/ajax/connect@99comlabs.co.in', 'Dispatched to official FormSubmit endpoint');
  assert(call.options.method === 'POST', 'Dispatched via HTTP POST');
  const parsedBody = JSON.parse(call.options.body);
  assert(parsedBody.fullName === 'Deepak Varma', 'Payload contains verified fullName');
  assert(parsedBody.email === 'deepak@varma-enterprises.com', 'Payload contains verified email');
  assert(parsedBody.serviceCategory === 'IoT & Electronics', 'Payload contains verified serviceCategory');
  assert(parsedBody.projectBudget === '₹1,50,000 - ₹5,00,000', 'Payload contains verified budget');
  assert(parsedBody._subject === 'New Project Inquiry — 99COMLABS Website', 'Payload contains standardized email subject');

  // Verify GA4 Telemetry
  assert(env.gtagCalls.length === 1, 'GA4 generate_lead event dispatched');
  assert(env.gtagCalls[0][0] === 'event' && env.gtagCalls[0][1] === 'generate_lead', 'GA4 event name is generate_lead');
  assert(env.gtagCalls[0][2].form_name === 'contact_form', 'GA4 event parameter form_name is contact_form');

  // Verify Post-Submission UI States
  assert(form.classList.contains('hidden'), 'Form is hidden after successful submission');
  const successBox = env.elements.get('form-success-container');
  assert(!successBox.classList.contains('hidden'), 'Success container is visible after submission');
  assert(successBox.focused, 'Success container received focus for assistive technology');
  assert(!submitBtn.disabled, 'Submit button re-enabled in finally block');
  assert(btnText.textContent === 'Submit Project Inquiry', 'Submit button text restored');

  // Test Reset Button
  const resetBtn = env.elements.get('btn-reset-form');
  await resetBtn.dispatchEvent({ type: 'click' });
  assert(!form.classList.contains('hidden'), 'Form made visible again after reset button click');
  assert(successBox.classList.contains('hidden'), 'Success container hidden again after reset button click');
  assert(env.elements.get('fullName').focused, 'Full name input focused after reset');
}

// Test Case 3.5: Network Error Banner & Escape Hatches
console.log('\n--- 3.5: Stress-Test Network Error Fallback ---');
{
  const env = await runFormHarness((e) => {
    e.setMockFetch(async () => {
      throw new Error('Network offline or connection refused');
    });
  });

  env.elements.get('fullName').value = 'Anand Pillai';
  env.elements.get('email').value = 'anand@pillai.in';
  env.elements.get('phone').value = '9847012345';
  env.elements.get('serviceCategory').value = 'Cloud & Security';
  env.elements.get('projectDetails').value = 'Need secure cloud migration for medical laboratory diagnostic database.';

  const form = env.elements.get('contact-inquiry-form');
  await form.dispatchEvent({
    type: 'submit',
    preventDefault: () => {}
  });

  const errorBanner = env.elements.get('form-error-banner');
  assert(!errorBanner.classList.contains('hidden'), 'Error banner made visible when network error occurs');
  assert(errorBanner.focused, 'Error banner receives focus for immediate alert notification');
  assert(!form.classList.contains('hidden'), 'Form remains accessible so user does not lose entered input');
}

// -----------------------------------------------------------------------------
// SECTION 4: PRESERVED /SUPPORT/ ROUTE FUNCTIONAL TESTING
// -----------------------------------------------------------------------------
console.log('\n--- Section 4: Preserved /support/ Route Functional Parity ---');

// Check ticket ID generator in support.js
const ticketGenMatch = supportJs.match(/function\s+generateTicketId\(\)\s*\{[\s\S]*?return\s+`#99LAB-\$\{code\}`;?\s*\}/);
assert(ticketGenMatch !== null, 'support.js defines generateTicketId function');

if (ticketGenMatch) {
  const ticketGenFn = new Function('return (' + ticketGenMatch[0] + ')()');
  const samples = new Set();
  for (let i = 0; i < 50; i++) {
    const id = ticketGenFn();
    samples.add(id);
    if (!/^#99LAB-[0-9A-F]{5}$/.test(id)) {
      assert(false, `Ticket ID format invalid: "${id}"`);
      break;
    }
  }
  assert(samples.size === 50, 'Ticket ID generator produces unique random ticket numbers (#99LAB-XXXXX)', `50 samples generated, all unique`);
}

// Check Support Form Configuration in HTML
assert(supportHtml.includes('action="https://formsubmit.co/support@99comlabs.co.in"'), 'Support form configured to send to support@99comlabs.co.in');
assert(supportHtml.includes('id="ticketSuccessModal"'), 'Support confirmation modal present in DOM');
assert(supportHtml.includes('id="kbAccordionList"'), 'FAQ Knowledge base accordion present in DOM');

// -----------------------------------------------------------------------------
// FINAL SUMMARY
// -----------------------------------------------------------------------------
console.log('\n' + '='.repeat(80));
console.log('ADVERSARIAL VERIFICATION SUMMARY');
console.log('='.repeat(80));
console.log(`Total Checks Run:  ${results.passed + results.failed}`);
console.log(`Passed:            ${results.passed}`);
console.log(`Failed:            ${results.failed}`);
console.log('='.repeat(80));

if (results.failed > 0) {
  console.error('\n[VERDICT: REQUEST_CHANGES] Form validation, links, or route verification failed.');
  process.exit(1);
} else {
  console.log('\n[VERDICT: APPROVE] 100% of route, link, form validation, honeypot, and support tests PASSED.');
  process.exit(0);
}
