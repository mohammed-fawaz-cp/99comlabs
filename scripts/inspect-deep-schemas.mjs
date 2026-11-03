import fs from 'node:fs';

const html = fs.readFileSync('99comlabs/dist/index.html', 'utf8');
const match = html.match(/<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
console.log('INDEX JSON-LD:\n', JSON.stringify(JSON.parse(match[1]), null, 2));

for (const blogFile of [
  'blog/cloud-hosting-vs-shared-hosting-guide/index.html',
  'blog/custom-website-cost-kerala-2026/index.html',
  'blog/iot-smart-sensors-cost-reduction-small-business/index.html',
  'blog/why-website-not-getting-leads-fixes/index.html'
]) {
  const bHtml = fs.readFileSync('99comlabs/dist/' + blogFile, 'utf8');
  const bMatches = [...bHtml.matchAll(/<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  console.log(`\n=== ${blogFile} ===`);
  bMatches.forEach(m => console.log(JSON.stringify(JSON.parse(m[1]), null, 2)));
}
