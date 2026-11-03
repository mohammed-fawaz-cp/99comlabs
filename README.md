# 99COMLABS — Official Website Production Architecture & Deployment Guide

> **Production Domain**: `https://99comlabs.co.in/`  
> **Framework**: Astro v4.16.19 LTS + Tailwind CSS v3.4.17/19  
> **Output Architecture**: Pure Static Site Generation (SSG) in `dist/`  
> **Client Runtime Overhead**: 0 KB JavaScript by default (Lighthouse 90–100)  
> **Preserved Legacy Portal**: Verbatim `/support/` client ticketing helpdesk  

---

## 1. Project Overview & Architecture

This repository contains the complete source code for the **99COMLABS Engineering & Innovation Lab** official web platform. Built to serve business owners seeking custom software, embedded electronics, IoT telemetry, and cloud infrastructure, the platform is engineered for immediate five-second clarity, extreme performance, accessible usability (WCAG 2.1 AA), and robust local SEO.

### Key Architectural Pillars

- **Pure Static Export (Zero-JS Runtime Overhead)**:  
  Unlike heavy single-page application (SPA) frameworks that force browsers to download megabytes of JavaScript, 99COMLABS compiles directly to clean, minified, semantic HTML and CSS in `dist/`. No client-side React, Vue, or Angular hydration runtime is required. This guarantees instant First Contentful Paint (<0.8s) and mobile Lighthouse scores of **90–100 across Performance, Accessibility, Best Practices, and SEO**.
- **WCAG 2.1 AA Accessible Design System**:  
  Engineered with high-contrast color tokens (slate-900 `#0f172a` body text yielding a **15.6:1 contrast ratio** against white surfaces), 16px body typography with 1.6 line height, 44px+ minimum touch targets, visible keyboard focus indicators (`:focus-visible`), and `prefers-reduced-motion` compliance.
- **Conversion Flow**:  
  Every page features an accessible floating WhatsApp button linked to `+91 9745551513`, click-to-call phone links, visible plain-text email (`connect@99comlabs.co.in`), and direct access to the on-page quote inquiry form.
- **Verbatim Legacy Route Preservation**:  
  The pre-existing client support portal (`/support/`) is preserved verbatim in `public/support/`. It retains its ticket ID generator (`#99LAB-XXXXX`), FormSubmit email dispatcher, FAQ accordions, and confirmation modal without code alteration.
- **Technical SEO & Structured Data**:  
  Every page includes an optimized title (<60 chars), meta description (<160 chars with Kerala/India keywords), Open Graph/Twitter Card tags, self-referencing canonicals, automated `sitemap.xml`, `robots.txt`, and Google Rich Results JSON-LD schemas (`ProfessionalService`, `LocalBusiness`, `Service`, `FAQPage`, `BreadcrumbList`, `Article`).
- **Strict Honest Content Standard (R4)**:  
  Zero fabricated testimonials, fake clients, or fake employee photos exist. Social proof is kept hidden until the business owner provides authentic reviews, and all unconfirmed details are indexed in `HANDOVER_CATALOG.md`.

---

## 2. Tech Stack & Repository Structure

```
99comlabs/
├── astro.config.mjs               # Astro static export configuration & sitemap integration
├── package.json                   # Dependencies & verification scripts
├── tailwind.config.mjs            # WCAG AA design tokens, typography, and color palette
├── tsconfig.json                  # TypeScript compiler settings
├── .cpanel.yml                    # Automated cPanel Git deployment script
├── HANDOVER_CATALOG.md            # Comprehensive index of owner placeholders & actions
├── public/
│   ├── favicon.svg                # Brand vector favicon
│   ├── robots.txt                 # Search crawler rules pointing to sitemap
│   ├── _redirects                 # 301 redirect rules for Netlify & Cloudflare Pages
│   ├── .htaccess                  # 301 redirects, compression & caching for cPanel Apache
│   ├── images/
│   │   ├── logo.svg               # Vector brand logo
│   │   └── og-share.png           # 1200x630 social share card
│   └── support/                   # PRESERVED CLIENT SUPPORT DESK VERBATIM
│       ├── index.html             # Support ticket portal & FAQs
│       ├── support.css            # Helpdesk styling
│       └── support.js             # FormSubmit dispatcher & #99LAB-XXXXX generator
├── src/
│   ├── components/
│   │   ├── BaseHead.astro         # SEO metadata, Open Graph, canonicals, GA4 & GSC tags
│   │   ├── Header.astro           # Accessible navbar, mobile menu & skip-link
│   │   ├── Footer.astro           # Multi-column footer with contact details & legal links
│   │   ├── Breadcrumb.astro       # Accessible breadcrumb trail navigation
│   │   ├── WhatsAppFloat.astro    # Floating WhatsApp CTA button (+91 9745551513)
│   │   ├── ContactForm.astro      # Validated on-page quote inquiry form with honeypot
│   │   └── Analytics.astro        # GA4 conversion tracking & telemetry dispatchers
│   ├── layouts/
│   │   └── BaseLayout.astro       # Shared master HTML layout
│   └── pages/
│       ├── index.astro            # 1. Home (5-second pitch, services, process, projects)
│       ├── services/
│       │   ├── index.astro        # 2. Services Overview & technical matrix
│       │   ├── web-and-mobile-apps.astro         # 3. Custom Web & Mobile Apps
│       │   ├── iot-and-electronics.astro         # 4. Embedded IoT & Electronics
│       │   ├── cloud-hosting-and-security.astro  # 5. Cloud Hosting & Cyber Security
│       │   └── digital-growth-and-branding.astro # 6. Digital Growth & Local SEO
│       ├── projects.astro         # 7. Projects (3 authentic case studies)
│       ├── about.astro            # 8. About Us & Kerala engineering ethos
│       ├── contact.astro          # 9. Dedicated Contact & Quote Request Page
│       ├── blog/
│       │   ├── index.astro        # 10. Blog Index & knowledge base
│       │   ├── custom-website-cost-kerala-2026.astro
│       │   ├── iot-smart-sensors-cost-reduction-small-business.astro
│       │   ├── cloud-hosting-vs-shared-hosting-guide.astro
│       │   └── why-website-not-getting-leads-fixes.astro
│       ├── privacy.astro          # 11. Privacy Policy (IT Act 2000 compliant)
│       ├── terms.astro            # 12. Terms of Service & Kerala jurisdiction
│       └── 404.astro              # 13. Custom 404 Error Recovery Page
└── scripts/
    ├── verify-links.mjs           # E2E Link spider, HTML checker & /support/ route verifier
    ├── verify-schemas.mjs         # E2E Google Rich Results JSON-LD validator
    ├── verify-responsive.mjs      # E2E Responsive overflow tester (360px, 768px, 1280px)
    └── verify-lighthouse.mjs      # E2E Mobile Lighthouse audit runner (threshold >= 90)
```

---

## 3. Local Development & Build Commands

### Prerequisites
- **Node.js**: `v18.17.0+` or `v20.0.0+` (LTS v20 recommended)
- **npm**: `v9.0.0+` or `v10.0.0+`

### Installation & Execution

```bash
# 1. Clone repository and navigate to project folder
git clone https://gitlab.com/99comlabs/landingpage.git
cd 99comlabs

# 2. Install dependencies
npm install

# 3. Start local development server with hot module reload
npm run dev
# The site is now accessible at http://localhost:4321/

# 4. Type-check all Astro components and TypeScript files
npm run check

# 5. Compile static production build
npm run build
# Outputs pure static HTML, CSS, images, and sitemaps to dist/

# 6. Preview the compiled production build locally
npm run preview
# Serves dist/ at http://localhost:4321/ to verify production output
```

---

## 4. Automated E2E Verification Suite

The repository includes a four-tier automated verification suite in `scripts/` to validate links, structured data, viewport responsiveness, and mobile performance before deployment.

### Running Verification Tests

```bash
# Run both link crawler and schema tests (recommended before git commit)
npm test

# 1. HTML Syntax, Broken Links & Route Preservation
npm run test:links
# Discovers all HTML files in dist/, crawls every internal link, ensures 0 broken
# anchor fragments, checks image alt text, and confirms /support/ route parity.

# 2. Google Rich Results Structured Data Validator
npm run test:schemas
# Parses all <script type="application/ld+json"> blocks and asserts strict
# conformance with Google Search requirements for LocalBusiness, Service,
# FAQPage, BreadcrumbList, and Article.

# 3. Responsive Layout & Horizontal Overflow Test
npm run test:responsive
# Spawns a headless browser test across 3 viewports:
# - Mobile: 360px x 640px (asserts zero horizontal scroll: scrollWidth <= innerWidth)
# - Tablet: 768px x 1024px
# - Desktop: 1280px x 800px
# Asserts touch targets >= 44x44px and verifies floating WhatsApp button visibility.

# 4. Mobile Lighthouse Audit
npm run test:lighthouse
# Runs headless Chrome under throttled mobile conditions (simulated 4G, 4x CPU slowdown).
# Enforces a minimum score of 90/100 across Performance, Accessibility, Best Practices, and SEO.
```

---

## 5. Production Deployment Guides

### Guide A: cPanel Shared / VPS Hosting (Current Environment for `99comlabs.co.in`)

The current production hosting for `99comlabs.co.in` is an Apache-based cPanel account located under `/home/comlabsc/`.

#### Deployment Path & Architecture
- **Server User**: `comlabsc`
- **Web Document Root**: `/home/comlabsc/public_html/`
- **Deployment Hook**: `.cpanel.yml` (located at repository root)

#### How `.cpanel.yml` Operates
When you push to or pull within cPanel Git Version Control, cPanel executes `.cpanel.yml`:
```yaml
---
deployment:
  tasks:
    - export DEPLOYPATH=/home/comlabsc/public_html/
    # Ensure deployment destination directory exists
    - /bin/mkdir -p $DEPLOYPATH
    # Copy all compiled static files, directories, and hidden dotfiles (.htaccess)
    - /bin/cp -R dist/. $DEPLOYPATH
    # Ensure standard readable file permissions
    - /bin/chmod -R 755 $DEPLOYPATH
    - /bin/chmod 644 $DEPLOYPATH/.htaccess 2>/dev/null || true
```

#### Step-by-Step cPanel Deployment Process

**Option 1: Local / CI Build & Push (Recommended)**
1. On your local machine, run `npm run build`.
2. Commit the updated `dist/` directory to Git:
   ```bash
   git add dist/ -f
   git commit -m "chore: compile production build for deployment"
   git push origin main
   ```
3. Log into your **cPanel Dashboard** (`https://99comlabs.co.in:2083`).
4. Navigate to **Files > Git™ Version Control**.
5. Select your repository and click **Manage > Pull or Deploy**.
6. Click **Update from Remote** to pull latest commits, then click **Deploy HEAD Commit**.
7. cPanel will copy all files in `dist/` directly into `/home/comlabsc/public_html/` with correct permissions.

**Option 2: Terminal / SSH Build directly on cPanel**
If your cPanel account has SSH access with Node.js installed:
```bash
ssh comlabsc@99comlabs.co.in
cd repositories/landingpage
git pull origin main
npm install
npm run build
# Trigger cPanel deployment task manually
/usr/local/cpanel/bin/git-deploy
```

#### Apache `.htaccess` Configuration
A production `.htaccess` is located in `public/.htaccess` and is automatically copied to `dist/.htaccess` during build. It handles:
- **HTTPS Enforcement**: Redirects all plain HTTP traffic to `https://99comlabs.co.in/` (301 Permanent).
- **Canonical Non-WWW**: Redirects `www.99comlabs.co.in` to `https://99comlabs.co.in/` (301 Permanent).
- **Clean URLs**: Redirects legacy `.html` requests (e.g. `/index.html`, `/services.html`) to clean directory URLs with trailing slashes.
- **Support Route**: Preserves `/support/` without interference.
- **Compression**: Enables `mod_deflate` for gzip compression on HTML, CSS, JS, SVG, and JSON.
- **Browser Caching**: Sets 1-year cache headers for immutable static assets (`/_astro/*`, images) and 1-hour cache for HTML.
- **Custom 404**: Routes missing pages to `/404.html`.

---

### Guide B: Netlify Deployment

1. Connect your repository to Netlify via the Netlify web dashboard or CLI.
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Environment variable**: `NODE_VERSION = 20`
3. Netlify automatically reads `public/_redirects` (copied to `dist/_redirects`), which enforces:
   ```text
   /index.html   /   301
   /services.html   /services/   301
   /*   /404.html   404
   ```
4. Optional `netlify.toml` file configuration:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [build.environment]
     NODE_VERSION = "20"

   [[headers]]
     for = "/_astro/*"
     [headers.values]
       Cache-Control = "public, max-age=31536000, immutable"
   ```

---

### Guide C: Vercel Deployment

1. Import your Git repository into Vercel.
2. Vercel automatically detects Astro. Confirm these settings:
   - **Framework Preset**: `Astro`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Create a `vercel.json` at the root if custom trailing slash enforcement is needed:
   ```json
   {
     "cleanUrls": true,
     "trailingSlash": true
   }
   ```

---

### Guide D: Cloudflare Pages Deployment

1. In Cloudflare Dashboard, go to **Workers & Pages > Create application > Pages > Connect to Git**.
2. Select repository and set:
   - **Framework preset**: `Astro`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Environment variable**: `NODE_VERSION = 20`
3. Cloudflare Pages automatically respects `_redirects` and `_headers` generated in `dist/`.

---

## 6. Post-Launch Verification Checklist

After deploying to production, execute this 10-point checklist to confirm 100% operational readiness:

- [ ] **1. DNS & SSL Certificate**:
  Verify that `https://99comlabs.co.in/` loads with a valid SSL padlock and zero browser security warnings.
- [ ] **2. 301 Permanent Redirects**:
  Test URL redirects in your browser or with `curl -I`:
  - `http://99comlabs.co.in` → redirects to `https://99comlabs.co.in/`
  - `https://www.99comlabs.co.in/` → redirects to `https://99comlabs.co.in/`
  - `https://99comlabs.co.in/index.html` → redirects to `https://99comlabs.co.in/`
  - `https://99comlabs.co.in/services.html` → redirects to `https://99comlabs.co.in/services/`
- [ ] **3. Preserved Support Helpdesk**:
  Visit `https://99comlabs.co.in/support/`. Verify ticket form styling, accordion functionality, and submit a test ticket. Confirm receipt of the ticket email at `support@99comlabs.co.in`.
- [ ] **4. On-Page Contact Form**:
  Submit a test inquiry via `/contact/` and the Home page quote form. Confirm that the success banner appears and the notification is received at `connect@99comlabs.co.in`.
- [ ] **5. Floating WhatsApp Button**:
  Click the floating WhatsApp button on both mobile and desktop. Verify that WhatsApp opens with pre-filled text addressing `+91 9745551513`.
- [ ] **6. Click-to-Call Link**:
  Tap `+91 9745551513` in the header or footer on a mobile phone to confirm your device dialer opens correctly.
- [ ] **7. Google Search Console Sitemap Submission**:
  Log into Google Search Console, navigate to **Sitemaps**, and submit `https://99comlabs.co.in/sitemap-index.xml` (or `/sitemap.xml`). Confirm "Success" status.
- [ ] **8. Google Rich Results Structured Data**:
  Test your production URLs using the [Google Rich Results Test](https://search.google.com/test/rich-results). Confirm valid schemas for `LocalBusiness`, `Service`, `FAQPage`, `BreadcrumbList`, and `Article`.
- [ ] **9. Google Analytics 4 Realtime Events**:
  Open GA4 Realtime DebugView. Visit the site, click the WhatsApp CTA, click phone number, and submit a form to confirm `whatsapp_click`, `click_to_call`, and `generate_lead` events fire.
- [ ] **10. Mobile Lighthouse Audit**:
  Run Chrome DevTools Lighthouse audit in Mobile mode. Verify scores of **90+ in Performance, Accessibility, Best Practices, and SEO**.

---

## 7. Customization & Maintenance Guide

Refer to `HANDOVER_CATALOG.md` for the exhaustive inventory of all placeholders. Use this quick reference guide to locate and update common site assets:

### Updating Brand Colors & Design Tokens
- **File**: `tailwind.config.mjs`
- **Primary Brand Colors**: Modify `theme.extend.colors.brand` (shades 50–950).
- **Text & Contrast Tokens**: Modify `theme.extend.colors.content` (ensure contrast against white remains >= 7:1 for text).
- **Surface Backgrounds**: Modify `theme.extend.colors.surface`.
- **WhatsApp Accent**: Modify `theme.extend.colors.whatsapp`.

### Updating Phone & WhatsApp Numbers
To change the company phone or WhatsApp contact number:
1. `src/components/Header.astro`: Search for `9745551513` and update the display text and `tel:+919745551513`.
2. `src/components/Footer.astro`: Update display number and `tel:` link.
3. `src/components/WhatsAppFloat.astro`: Update WhatsApp URL `https://wa.me/919745551513`.
4. `src/pages/contact.astro`: Update phone and WhatsApp card links.
5. `src/pages/about.astro`: Update phone link in the team section.
6. `public/support/index.html`: Update emergency support contact link.

### Updating Official Email Addresses
- **General Inquiries (`connect@99comlabs.co.in`)**:
  - `src/components/Footer.astro`
  - `src/pages/contact.astro`
  - `src/pages/about.astro`
  - `src/pages/privacy.astro`
  - `src/pages/terms.astro`
  - `src/components/ContactForm.astro` (default recipient)
- **Support Tickets (`support@99comlabs.co.in`)**:
  - `public/support/index.html` (FormSubmit action attribute)
  - `src/pages/contact.astro`

### Activating Client Testimonials
- **File**: `src/pages/index.astro`
- In lines 443–455, remove `class="hidden"` and `aria-hidden="true"` from `<section id="testimonials">`.
- Insert genuine customer quotes, company names, and project deliverables (see `HANDOVER_CATALOG.md` Section C for example code).

### Adding Team Photos & Biographies
- **File**: `src/pages/about.astro`
- Place portrait photos (WebP format, 400x400px) in `public/images/team/`.
- Replace the placeholder block in lines 290–324 with genuine team member cards (see `HANDOVER_CATALOG.md` Section D for markup).

---

## 8. License & Ownership

**100% Client Code & Asset Ownership**:  
In accordance with 99COMLABS engineering principles, all source code, database structures, styles, markup, and visual assets are the exclusive intellectual property of **99COMLABS Engineering Lab**. Zero vendor lock-in, zero recurring proprietary platform licenses.
