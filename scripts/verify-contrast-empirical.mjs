// scripts/verify-contrast-empirical.mjs
// Adversarial test oracle for WCAG 2.1 relative luminance and color contrast ratios

function sRGBtoLin(c) {
  const v = c / 255.0;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function relLuminance(hex) {
  const cleanHex = hex.replace('#', '').trim();
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return 0.2126 * sRGBtoLin(r) + 0.7152 * sRGBtoLin(g) + 0.0722 * sRGBtoLin(b);
}

function contrastRatio(hex1, hex2) {
  const l1 = relLuminance(hex1);
  const l2 = relLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const testMatrix = [
  {
    name: 'Primary Text (#0F172A) vs White (#FFFFFF)',
    foreground: '#0F172A',
    background: '#FFFFFF',
    minRequired: 15.6,
    targetStandard: 'WCAG AAA (Enhanced >= 7:1) & Project Spec (>= 15.6:1)'
  },
  {
    name: 'Slate 700 (#334155) vs White (#FFFFFF)',
    foreground: '#334155',
    background: '#FFFFFF',
    minRequired: 7.0,
    targetStandard: 'WCAG AAA (Enhanced >= 7:1)'
  },
  {
    name: 'WhatsApp Floating Action Button (#128C7E) vs White (#FFFFFF)',
    foreground: '#FFFFFF',
    background: '#128C7E',
    minRequired: 3.0,
    targetStandard: 'WCAG 2.1 Non-text Contrast (UI Component >= 3:1)'
  },
  {
    name: 'WhatsApp Hover State (#075E54) vs White (#FFFFFF)',
    foreground: '#FFFFFF',
    background: '#075E54',
    minRequired: 4.5,
    targetStandard: 'WCAG AA & AAA (>= 4.5:1)'
  },
  {
    name: 'Brand 700 Primary Button (#1D4ED8) vs White (#FFFFFF)',
    foreground: '#FFFFFF',
    background: '#1D4ED8',
    minRequired: 4.5,
    targetStandard: 'WCAG AA (Normal Text >= 4.5:1)'
  },
  {
    name: 'Brand 600 Focus Outline (#2563EB) vs White (#FFFFFF)',
    foreground: '#2563EB',
    background: '#FFFFFF',
    minRequired: 3.0,
    targetStandard: 'WCAG 2.1 Non-text Contrast (UI component >= 3:1)'
  },
  {
    name: 'Slate 600 Muted Text (#475569) vs White (#FFFFFF)',
    foreground: '#475569',
    background: '#FFFFFF',
    minRequired: 4.5,
    targetStandard: 'WCAG AA (Normal Text >= 4.5:1)'
  },
  {
    name: 'Slate 500 Subtle Text (#64748B) vs White (#FFFFFF)',
    foreground: '#64748B',
    background: '#FFFFFF',
    minRequired: 4.5,
    targetStandard: 'WCAG AA (Normal Text >= 4.5:1)'
  },
  {
    name: 'Active Nav Link: Brand 700 (#1D4ED8) vs Brand 50 (#EFF6FF)',
    foreground: '#1D4ED8',
    background: '#EFF6FF',
    minRequired: 4.5,
    targetStandard: 'WCAG AA (Normal Text >= 4.5:1)'
  },
  {
    name: 'Footer Body: Slate 300 (#CBD5E1) vs Slate 900 (#0F172A)',
    foreground: '#CBD5E1',
    background: '#0F172A',
    minRequired: 4.5,
    targetStandard: 'WCAG AA & AAA'
  },
  {
    name: 'Footer Muted: Slate 400 (#94A3B8) vs Slate 900 (#0F172A)',
    foreground: '#94A3B8',
    background: '#0F172A',
    minRequired: 4.5,
    targetStandard: 'WCAG AA (Normal Text >= 4.5:1)'
  },
  {
    name: 'Footer White Links/Headings (#FFFFFF) vs Slate 900 (#0F172A)',
    foreground: '#FFFFFF',
    background: '#0F172A',
    minRequired: 4.5,
    targetStandard: 'WCAG AAA (Enhanced >= 7:1)'
  },
  {
    name: 'Footer Emerald 400 (#34D399) vs Slate 900 (#0F172A)',
    foreground: '#34D399',
    background: '#0F172A',
    minRequired: 4.5,
    targetStandard: 'WCAG AA & AAA'
  },
  {
    name: 'Helpdesk Badge: Emerald 800 (#065F46) vs Emerald 100 (#D1FAE5)',
    foreground: '#065F46',
    background: '#D1FAE5',
    minRequired: 4.5,
    targetStandard: 'WCAG AA & AAA'
  }
];

console.log('='.repeat(80));
console.log('WCAG 2.1 MATHEMATICAL COLOR CONTRAST RATIO EMPIRICAL TEST ORACLE');
console.log('='.repeat(80));

let totalFailed = 0;

for (const test of testMatrix) {
  const cr = contrastRatio(test.foreground, test.background);
  const lFg = relLuminance(test.foreground);
  const lBg = relLuminance(test.background);
  const passed = cr >= test.minRequired;
  if (!passed) totalFailed++;

  const wcagAA = cr >= 4.5 ? 'PASS (AA)' : (cr >= 3.0 ? 'PASS (AA Large)' : 'FAIL (AA)');
  const wcagAAA = cr >= 7.0 ? 'PASS (AAA)' : 'FAIL (AAA)';

  console.log(`\nTest: ${test.name}`);
  console.log(`  Foreground: ${test.foreground} (L = ${lFg.toFixed(5)})`);
  console.log(`  Background: ${test.background} (L = ${lBg.toFixed(5)})`);
  console.log(`  Computed Contrast Ratio: ${cr.toFixed(3)}:1`);
  console.log(`  Target Requirement:      >= ${test.minRequired.toFixed(1)}:1 (${test.targetStandard})`);
  console.log(`  Evaluation:              [${passed ? 'PASS' : 'FAIL'}] | ${wcagAA} | ${wcagAAA}`);
}

console.log('\n' + '='.repeat(80));
console.log(`SUMMARY: ${testMatrix.length - totalFailed} passed, ${totalFailed} failed out of ${testMatrix.length} checks.`);
console.log('='.repeat(80));

if (totalFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
