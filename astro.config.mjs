import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://99comlabs.co.in',
  trailingSlash: 'always',
  output: 'static',
  build: {
    format: 'directory',
    assets: '_astro',
    inlineStylesheets: 'auto'
  },
  compressHTML: true,
  integrations: [
    tailwind({
      applyBaseStyles: true
    }),
    sitemap({
      filter: (page) => !page.includes('/404')
    })
  ]
});

