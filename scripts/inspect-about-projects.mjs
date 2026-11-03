import fs from 'node:fs';

for (const f of ['99comlabs/dist/about/index.html', '99comlabs/dist/projects/index.html']) {
  const html = fs.readFileSync(f, 'utf8');
  const m = [...html.matchAll(/<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  console.log(`\n=== ${f} ===`);
  m.forEach((x, i) => console.log(`Block ${i+1}:\n`, JSON.stringify(JSON.parse(x[1].trim()), null, 2)));
}
