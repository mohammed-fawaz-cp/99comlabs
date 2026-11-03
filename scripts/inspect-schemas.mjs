import fs from 'node:fs';
import path from 'node:path';

const distDir = '99comlabs/dist';
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
console.log('--- DETAILED JSON-LD INSPECTION ---');
let count = 0;
for (const f of files) {
  const rel = path.relative(distDir, f).replace(/\\/g, '/');
  const html = fs.readFileSync(f, 'utf8');
  const matches = [...html.matchAll(/<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (matches.length > 0) {
    console.log('\nPAGE:', rel, `(${matches.length} blocks)`);
    for (const [i, m] of matches.entries()) {
      count++;
      try {
        const obj = JSON.parse(m[1].trim());
        const type = obj['@type'] || (Array.isArray(obj) ? obj.map(x=>x['@type']).join(',') : 'unknown');
        console.log(`  [Block ${i+1}] Type: ${type}`);
        if (type === 'ProfessionalService') {
          console.log('    Name:', obj.name);
          console.log('    URL:', obj.url);
          console.log('    Phone:', obj.telephone);
          console.log('    Address:', JSON.stringify(obj.address));
          console.log('    PriceRange:', obj.priceRange);
        } else if (type === 'Service') {
          console.log('    Name:', obj.name);
          console.log('    Provider:', obj.provider?.name);
        } else if (type === 'FAQPage') {
          console.log('    Questions Count:', obj.mainEntity?.length);
          obj.mainEntity?.forEach((q, qi) => console.log(`      Q${qi+1}: ${q.name.slice(0, 50)}...`));
        } else if (type === 'Article') {
          console.log('    Headline:', obj.headline);
          console.log('    DatePublished:', obj.datePublished);
          console.log('    Author:', JSON.stringify(obj.author));
          console.log('    Publisher:', obj.publisher?.name);
        } else if (type === 'BreadcrumbList') {
          console.log('    Breadcrumbs Count:', obj.itemListElement?.length);
          obj.itemListElement?.forEach((b, bi) => console.log(`      B${bi+1}: ${b.name} -> ${b.item}`));
        }
      } catch (e) {
        console.error('    PARSE ERROR:', e.message);
      }
    }
  }
}
console.log('\nTotal JSON-LD blocks checked:', count);
