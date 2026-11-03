import fs from 'node:fs';

for (const servFile of [
  'services/index.html',
  'services/web-and-mobile-apps/index.html',
  'services/iot-and-electronics/index.html',
  'services/cloud-hosting-and-security/index.html',
  'services/digital-growth-and-branding/index.html'
]) {
  const sHtml = fs.readFileSync('99comlabs/dist/' + servFile, 'utf8');
  const sMatches = [...sHtml.matchAll(/<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  console.log(`\n=== ${servFile} ===`);
  sMatches.forEach((m, idx) => {
    console.log(`-- Schema ${idx+1} --`);
    console.log(JSON.stringify(JSON.parse(m[1]), null, 2));
  });
}
