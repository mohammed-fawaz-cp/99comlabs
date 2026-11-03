#!/usr/bin/env node
/**
 * verify-schemas.mjs — Comprehensive Google Rich Results Structured Data (JSON-LD) Validator
 * 
 * Part of 99COMLABS E2E Test Suite (Tier 1 & Tier 2)
 * Validates:
 * 1. JSON syntax of all <script type="application/ld+json"> blocks
 * 2. Conformance with Google Rich Results & Schema.org specifications:
 *    - ProfessionalService / LocalBusiness
 *    - Service
 *    - FAQPage
 *    - BreadcrumbList
 *    - Article / BlogPosting
 * 3. Page Schema Mapping: Asserts required schemas exist on appropriate pages
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

const defaultDist = path.resolve(__dirname, '..', 'dist');
const distDir = distArg ? path.resolve(process.cwd(), distArg) : defaultDist;

console.log('\n===============================================================');
console.log('  99COMLABS E2E TEST: GOOGLE RICH RESULTS JSON-LD VALIDATOR');
console.log('===============================================================');
console.log(`Target Output Directory: ${distDir}\n`);

if (!fs.existsSync(distDir)) {
  console.error(`[ERROR] Build output directory does not exist: ${distDir}`);
  console.error('Please run "npm run build" before running this schema validator.\n');
  process.exit(1);
}

// 1. Discover all HTML files
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

console.log(`Scanning ${htmlFiles.length} HTML files for JSON-LD schemas...\n`);

const errors = [];
const warnings = [];
const pageSchemas = new Map(); // relPath -> Array of schema objects

// Helper: Normalize schema entities from object, array, or @graph
function extractEntities(jsonObj) {
  if (!jsonObj) return [];
  if (Array.isArray(jsonObj)) {
    return jsonObj.flatMap(extractEntities);
  }
  if (jsonObj['@graph'] && Array.isArray(jsonObj['@graph'])) {
    return jsonObj['@graph'].flatMap(extractEntities);
  }
  return [jsonObj];
}

// 2. Extract and Parse JSON-LD scripts
for (const fullPath of htmlFiles) {
  const relPath = path.relative(distDir, fullPath).replace(/\\/g, '/');
  const content = fs.readFileSync(fullPath, 'utf8');

  const scriptRegex = /<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  const schemasForPage = [];

  while ((match = scriptRegex.exec(content)) !== null) {
    const jsonStr = match[1].trim();
    if (!jsonStr) {
      warnings.push(`[SCHEMA EMPTY] In ${relPath}: Found empty <script type="application/ld+json"> tag.`);
      continue;
    }

    try {
      const parsed = JSON.parse(jsonStr);
      const entities = extractEntities(parsed);
      schemasForPage.push(...entities);
    } catch (err) {
      errors.push(`[SCHEMA SYNTAX ERROR] In ${relPath}: Malformed JSON-LD: ${err.message}\nSnippet: ${jsonStr.slice(0, 100)}...`);
    }
  }

  pageSchemas.set(relPath, schemasForPage);
}

// 3. Schema Type Validators (Google Rich Results Specifications)

function validateProfessionalService(entity, relPath) {
  const type = entity['@type'];
  if (type !== 'ProfessionalService' && type !== 'LocalBusiness') {
    return;
  }

  // Name
  if (!entity.name || typeof entity.name !== 'string' || !entity.name.trim()) {
    errors.push(`[SCHEMA] ${relPath} (${type}): Missing required "name" property.`);
  }

  // URL
  if (!entity.url) {
    errors.push(`[SCHEMA] ${relPath} (${type}): Missing required "url" property.`);
  }

  // Telephone
  if (!entity.telephone) {
    errors.push(`[SCHEMA] ${relPath} (${type}): Missing required "telephone" property.`);
  } else {
    const cleanPhone = entity.telephone.replace(/[^0-9]/g, '');
    if (!cleanPhone.includes('9745551513')) {
      warnings.push(`[SCHEMA] ${relPath} (${type}): Telephone "${entity.telephone}" does not match 99COMLABS primary phone number (+91 9745551513).`);
    }
  }

  // Address (PostalAddress)
  if (!entity.address || typeof entity.address !== 'object') {
    errors.push(`[SCHEMA] ${relPath} (${type}): Missing required "address" object.`);
  } else {
    const addr = entity.address;
    if (!addr.addressCountry) {
      warnings.push(`[SCHEMA] ${relPath} (${type}): Address is missing "addressCountry".`);
    }
    if (!addr.postalCode || !addr.postalCode.includes('676304')) {
      warnings.push(`[SCHEMA] ${relPath} (${type}): Address postal code "${addr.postalCode}" does not match Kerala headquarters PIN (676304).`);
    }
  }
}

function validateService(entity, relPath) {
  if (entity['@type'] !== 'Service') return;

  if (!entity.name || typeof entity.name !== 'string') {
    errors.push(`[SCHEMA] ${relPath} (Service): Missing required "name" property.`);
  }
  if (!entity.description || typeof entity.description !== 'string') {
    errors.push(`[SCHEMA] ${relPath} (Service): Missing required "description" property.`);
  }
  if (!entity.provider) {
    warnings.push(`[SCHEMA] ${relPath} (Service): Missing recommended "provider" property.`);
  }
}

function validateFAQPage(entity, relPath) {
  if (entity['@type'] !== 'FAQPage') return;

  if (!entity.mainEntity || !Array.isArray(entity.mainEntity)) {
    errors.push(`[SCHEMA] ${relPath} (FAQPage): "mainEntity" must be an array of Question objects.`);
    return;
  }

  if (entity.mainEntity.length === 0) {
    errors.push(`[SCHEMA] ${relPath} (FAQPage): "mainEntity" array is empty.`);
    return;
  }

  entity.mainEntity.forEach((q, idx) => {
    if (q['@type'] !== 'Question') {
      errors.push(`[SCHEMA] ${relPath} (FAQPage): Question #${idx + 1} missing @type="Question".`);
    }
    if (!q.name || typeof q.name !== 'string' || !q.name.trim()) {
      errors.push(`[SCHEMA] ${relPath} (FAQPage): Question #${idx + 1} missing question text in "name".`);
    }
    if (!q.acceptedAnswer || typeof q.acceptedAnswer !== 'object') {
      errors.push(`[SCHEMA] ${relPath} (FAQPage): Question #${idx + 1} missing "acceptedAnswer" object.`);
    } else {
      if (q.acceptedAnswer['@type'] !== 'Answer') {
        errors.push(`[SCHEMA] ${relPath} (FAQPage): Question #${idx + 1} acceptedAnswer missing @type="Answer".`);
      }
      if (!q.acceptedAnswer.text || typeof q.acceptedAnswer.text !== 'string' || !q.acceptedAnswer.text.trim()) {
        errors.push(`[SCHEMA] ${relPath} (FAQPage): Question #${idx + 1} acceptedAnswer missing "text" content.`);
      }
    }
  });
}

function validateBreadcrumbList(entity, relPath) {
  if (entity['@type'] !== 'BreadcrumbList') return;

  if (!entity.itemListElement || !Array.isArray(entity.itemListElement)) {
    errors.push(`[SCHEMA] ${relPath} (BreadcrumbList): "itemListElement" must be an array of ListItem objects.`);
    return;
  }

  if (entity.itemListElement.length === 0) {
    errors.push(`[SCHEMA] ${relPath} (BreadcrumbList): "itemListElement" array is empty.`);
    return;
  }

  entity.itemListElement.forEach((item, idx) => {
    const expectedPos = idx + 1;
    if (item['@type'] !== 'ListItem') {
      errors.push(`[SCHEMA] ${relPath} (BreadcrumbList): Item #${expectedPos} missing @type="ListItem".`);
    }
    if (item.position !== expectedPos) {
      errors.push(`[SCHEMA] ${relPath} (BreadcrumbList): Item #${expectedPos} position mismatch: expected ${expectedPos}, found ${item.position}.`);
    }
    if (!item.name || typeof item.name !== 'string') {
      errors.push(`[SCHEMA] ${relPath} (BreadcrumbList): Item #${expectedPos} missing "name".`);
    }
    if (!item.item) {
      errors.push(`[SCHEMA] ${relPath} (BreadcrumbList): Item #${expectedPos} missing URL in "item" property.`);
    }
  });
}

function validateArticle(entity, relPath) {
  if (entity['@type'] !== 'Article' && entity['@type'] !== 'BlogPosting') return;

  if (!entity.headline || typeof entity.headline !== 'string') {
    errors.push(`[SCHEMA] ${relPath} (${entity['@type']}): Missing required "headline" property.`);
  }
  if (!entity.datePublished) {
    errors.push(`[SCHEMA] ${relPath} (${entity['@type']}): Missing required "datePublished" property.`);
  } else {
    const dateVal = Date.parse(entity.datePublished);
    if (isNaN(dateVal)) {
      errors.push(`[SCHEMA] ${relPath} (${entity['@type']}): "datePublished" is not a valid ISO 8601 date string ("${entity.datePublished}").`);
    }
  }
  if (!entity.author) {
    warnings.push(`[SCHEMA] ${relPath} (${entity['@type']}): Missing recommended "author" property.`);
  }
  if (!entity.publisher) {
    warnings.push(`[SCHEMA] ${relPath} (${entity['@type']}): Missing recommended "publisher" property.`);
  }
}

// 4. Run entity-level validation
let totalSchemasFound = 0;
for (const [relPath, schemas] of pageSchemas.entries()) {
  totalSchemasFound += schemas.length;
  for (const entity of schemas) {
    validateProfessionalService(entity, relPath);
    validateService(entity, relPath);
    validateFAQPage(entity, relPath);
    validateBreadcrumbList(entity, relPath);
    validateArticle(entity, relPath);
  }
}

// 5. Page Schema Mapping Verification (Requirements from PROJECT.md & ORIGINAL_REQUEST.md)
console.log('Verifying page-specific schema presence rules...');

for (const [relPath, schemas] of pageSchemas.entries()) {
  const types = new Set(schemas.map(s => s['@type']));

  // Home Page: Must have ProfessionalService or LocalBusiness
  if (relPath === 'index.html') {
    if (!types.has('ProfessionalService') && !types.has('LocalBusiness')) {
      errors.push(`[PAGE MAPPING] Home page (index.html) is missing "ProfessionalService" or "LocalBusiness" JSON-LD schema.`);
    }
  }

  // Dedicated Service Pages: Must have Service, FAQPage, BreadcrumbList
  if (relPath.startsWith('services/') && relPath !== 'services/index.html') {
    if (!types.has('Service')) {
      errors.push(`[PAGE MAPPING] Dedicated service page "${relPath}" is missing "Service" JSON-LD schema.`);
    }
    if (!types.has('FAQPage')) {
      errors.push(`[PAGE MAPPING] Dedicated service page "${relPath}" is missing "FAQPage" JSON-LD schema.`);
    }
    if (!types.has('BreadcrumbList')) {
      errors.push(`[PAGE MAPPING] Dedicated service page "${relPath}" is missing "BreadcrumbList" JSON-LD schema.`);
    }
  }

  // Blog Article Pages: Must have Article or BlogPosting, and BreadcrumbList
  if (relPath.startsWith('blog/') && relPath !== 'blog/index.html') {
    if (!types.has('Article') && !types.has('BlogPosting')) {
      errors.push(`[PAGE MAPPING] Blog article "${relPath}" is missing "Article" or "BlogPosting" JSON-LD schema.`);
    }
    if (!types.has('BreadcrumbList')) {
      errors.push(`[PAGE MAPPING] Blog article "${relPath}" is missing "BreadcrumbList" JSON-LD schema.`);
    }
  }
}

// 6. Summary Report
console.log('\n===============================================================');
console.log('  GOOGLE RICH RESULTS JSON-LD VALIDATION SUMMARY');
console.log('===============================================================');
console.log(`Total HTML Pages Audited:    ${htmlFiles.length}`);
console.log(`Total Valid JSON-LD Blocks:  ${totalSchemasFound}`);
console.log(`Total Errors Detected:       ${errors.length}`);
console.log(`Total Warnings Detected:     ${warnings.length}`);
console.log('---------------------------------------------------------------');
console.log('Pages Schema Coverage:');
for (const [relPath, schemas] of pageSchemas.entries()) {
  const schemaList = schemas.map(s => s['@type']).join(', ') || '(none)';
  console.log(`  • ${relPath.padEnd(38)} -> [${schemaList}]`);
}
console.log('===============================================================\n');

if (warnings.length > 0) {
  console.log('WARNINGS:');
  warnings.forEach(w => console.log(`  ⚠ ${w}`));
  console.log();
}

if (errors.length > 0) {
  console.error('FAILURES & ERRORS:');
  errors.forEach(e => console.error(`  ✖ ${e}`));
  console.error('\n[RESULT] Schema Verification FAILED. Please correct the schema issues listed above.\n');
  process.exit(1);
} else {
  console.log('[RESULT] All JSON-LD schemas PASSED Google Rich Results validation!\n');
  process.exit(0);
}
