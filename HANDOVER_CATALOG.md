# 99COMLABS — Master Handover Catalog & Owner Action Guide

> **Requirement Compliance**: R4 (Placeholders, Honest Content Standards, and Deployment Documentation)  
> **Target Production Domain**: `https://99comlabs.co.in/`  
> **Version**: 1.0.0 (Milestone 3 Deliverable)  
> **Status**: Ready for Website Owner Review & Production Customization  

---

## 1. Executive Summary & Purpose

In strict accordance with **Requirement R4 (Honest Content Standards)** of the 99COMLABS project brief, **zero fabricated facts, fake clients, fake testimonials, fake numbers, or fake addresses** have been invented during the rebuild. 

All unconfirmed real-world details (such as physical door numbers, team portraits, real customer quotes, analytics keys, and form endpoints) have been marked with standardized, explicit bracketed placeholders (e.g. `[CONFIRM STREET ADDRESS]`, `[ADD REAL TESTIMONIAL + NAME + COMPANY]`, `[ADD GA4 MEASUREMENT ID]`). Furthermore, social proof sections remain strictly hidden by default (`class="hidden" aria-hidden="true"`) until the website owner supplies verified client reviews.

This **Consolidated Handover Catalog** serves as the authoritative index for the website owner and maintainers. Every placeholder in the codebase is documented below with its exact file location, line number, current string, required owner action, and a concrete example of a valid production replacement.

---

## 2. Consolidated Placeholder Master Index

| # | Item / Purpose | File Path & Line Number | Current Placeholder String | Required Owner Action | Concrete Example of Real Value |
|---|---|---|---|---|---|
| **1** | Global Footer Physical Address | `src/components/Footer.astro:105` | `[CONFIRM STREET ADDRESS]` | Replace placeholder with actual building name, door/office number, and street in Kottakkal, Malappuram | `2nd Floor, City Center Mall, Bypass Road` |
| **2** | Home Page LocalBusiness JSON-LD | `src/pages/index.astro:21` | `[CONFIRM STREET ADDRESS]` | Update `streetAddress` property in structured data for local search engines | `2nd Floor, City Center Mall, Bypass Road` |
| **3** | Home Page Hidden Testimonials Block | `src/pages/index.astro:443, 452` | `[ADD REAL TESTIMONIAL + NAME + COMPANY]` | Collect 2–4 authentic client reviews; remove `hidden` class and `aria-hidden="true"` from `<section id="testimonials">`; replace placeholder text with authentic cards | `"99COMLABS developed our industrial IoT motor controller and mobile telemetry app with flawless reliability." — Rajesh Menon, Operations Director, AgroKisan Automation` |
| **4** | About Page LocalBusiness JSON-LD | `src/pages/about.astro:44` | `[CONFIRM STREET ADDRESS]` | Update `streetAddress` property in structured data for search engine consistency | `2nd Floor, City Center Mall, Bypass Road` |
| **5** | About Page Engineering Team Section | `src/pages/about.astro:300` | `[ADD REAL TEAM MEMBER BIOS & PHOTOS]` | Gather verified team portraits (WebP format) and biographies; replace placeholder card in `<section id="team">` with actual team member cards | `Muhammed Rashid — Lead Embedded Systems Engineer, B.Tech Electronics, 8+ years in firmware and IoT architecture.` |
| **6** | Privacy Policy Official Postal Address | `src/pages/privacy.astro:129` | `[CONFIRM FULL STREET ADDRESS]` | Provide legal registered address for formal notices under IT Act 2000 & SPDI Rules 2011 | `Building #4B, Cyber Arcade, Main Road` |
| **7** | Terms of Service Civil Court Jurisdiction | `src/pages/terms.astro:130` | `[CONFIRM SPECIFIC JURISDICTION COURT]` | Specify the exact competent civil court for arbitration and legal disputes | `(Subordinate Judge Court / District Court, Manjeri)` |
| **8** | Terms of Service Registered Address | `src/pages/terms.astro:143` | `[CONFIRM FULL STREET ADDRESS]` | Insert verified business street address for legal terms | `Building #4B, Cyber Arcade, Main Road, Kottakkal` |
| **9** | Contact Page Location Card & JSON-LD | `src/pages/contact.astro:86, 119, 382` | `[CONFIRM STREET ADDRESS]` | Update physical office address shown to prospective clients and in `ContactPage` JSON-LD | `99COMLABS Engineering Lab, 2nd Floor, Bypass Junction, Kottakkal, PIN 676304` |
| **10** | Contact Form Backend Endpoint | `src/components/ContactForm.astro:23` | `[ADD FORM BACKEND KEY / ENDPOINT]` | Configure lead delivery endpoint (default: FormSubmit.co AJAX URL pointing to `connect@99comlabs.co.in`, or custom CRM/API webhook) | `https://formsubmit.co/ajax/connect@99comlabs.co.in` or custom CRM webhook |
| **11** | Google Analytics 4 Measurement ID | `src/components/Analytics.astro:23, 39` | `[ADD GA4 MEASUREMENT ID]` | Create GA4 property at https://analytics.google.com and supply Measurement ID | `G-XXXXXXXXXX` (e.g. `G-W3XYZ78901`) |
| **12** | Google Search Console Verification | `src/components/Analytics.astro:28, 40` | `[ADD GSC VERIFICATION TOKEN]` | Obtain HTML verification meta tag content from Google Search Console | `dGhpcy1pcy1hLXJlYWwtdmVyaWZpY2F0aW9uLXRva2Vu` |
| **13** | Preserved Support Desk Form Activation | `public/support/index.html:187` | FormSubmit email verification | Confirm activation link sent to `support@99comlabs.co.in` upon initial test ticket submission | Click "Activate Form" link in confirmation email from `FormSubmit.co` |

---

## 3. Detailed Item-by-Item Action Guide

### Section A: Physical Office & Legal Address Placeholders

99COMLABS has a confirmed regional presence in **Kottakkal, Malappuram District, Kerala, India — PIN 676304**. The exact street door number and building name have been marked with placeholders to ensure complete factual honesty.

#### Item 1: Global Footer Address
- **File**: `99comlabs/src/components/Footer.astro` (Line 105)
- **Current Code**:
  ```astro
  <p class="text-slate-400">[CONFIRM STREET ADDRESS]</p>
  <p class="text-slate-400">Kottakkal, Malappuram District</p>
  <p class="text-slate-400">Kerala, India — PIN 676304</p>
  ```
- **Action Required**: Replace `[CONFIRM STREET ADDRESS]` with your physical office location.
- **Example Replacement**:
  ```astro
  <p class="text-slate-400">2nd Floor, City Center Mall, Bypass Road</p>
  <p class="text-slate-400">Kottakkal, Malappuram District</p>
  <p class="text-slate-400">Kerala, India — PIN 676304</p>
  ```

#### Items 2 & 4: Structured Data (JSON-LD LocalBusiness / ProfessionalService)
- **Files**:
  - `99comlabs/src/pages/index.astro` (Line 21)
  - `99comlabs/src/pages/about.astro` (Line 44)
  - `99comlabs/src/pages/contact.astro`
- **Current Code**:
  ```json
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[CONFIRM STREET ADDRESS]",
    "addressLocality": "Kottakkal",
    "addressRegion": "Kerala",
    "postalCode": "676304",
    "addressCountry": "IN"
  }
  ```
- **Action Required**: Replace `[CONFIRM STREET ADDRESS]` with the identical street address used in the Footer to maintain 100% schema consistency for Google Search.
- **Example Replacement**:
  ```json
  "streetAddress": "2nd Floor, City Center Mall, Bypass Road"
  ```

#### Items 6 & 8: Legal Notices (Privacy Policy & Terms of Service)
- **Files**:
  - `99comlabs/src/pages/privacy.astro` (Line 129)
  - `99comlabs/src/pages/terms.astro` (Line 143)
- **Current Code (`privacy.astro`)**:
  ```html
  <p><strong>Postal Address:</strong> 99COMLABS Engineering Lab, [CONFIRM FULL STREET ADDRESS], Kottakkal, Malappuram District, Kerala, India - 676304</p>
  ```
- **Current Code (`terms.astro`)**:
  ```html
  <p><strong>Registered Region:</strong> Kerala, India - PIN 676304 [CONFIRM FULL STREET ADDRESS]</p>
  ```
- **Action Required**: Provide your complete postal/registered address for legal inquiries and compliance with India's Information Technology Act 2000.
- **Example Replacement**:
  ```html
  <p><strong>Postal Address:</strong> 99COMLABS Engineering Lab, Building #4B, Cyber Arcade, Main Road, Kottakkal, Malappuram District, Kerala, India - 676304</p>
  ```

---

### Section B: Legal Jurisdiction & Court of Arbitration

#### Item 7: Terms of Service Jurisdiction
- **File**: `99comlabs/src/pages/terms.astro` (Line 130)
- **Current Code**:
  ```html
  Both parties irrevocably agree that the competent civil courts located in <strong>Malappuram District, Kerala, India</strong> [CONFIRM SPECIFIC JURISDICTION COURT] shall possess exclusive territorial and subject-matter jurisdiction...
  ```
- **Action Required**: Confirm with your legal counsel which specific court in Malappuram District possesses jurisdiction over your corporate contracts (e.g., Munsiff's Court / Subordinate Judge Court / District Court at Manjeri or Malappuram).
- **Example Replacement**:
  ```html
  Both parties irrevocably agree that the competent civil courts located in <strong>Malappuram District, Kerala, India</strong> (specifically the Subordinate Judge Court or District Court at Manjeri) shall possess exclusive territorial and subject-matter jurisdiction...
  ```

---

### Section C: Client Testimonials & Social Proof (Hidden Section Activation)

#### Item 3: Home Page Testimonials Section
- **File**: `99comlabs/src/pages/index.astro` (Lines 443–455)
- **Current Code**:
  ```astro
  <!-- Testimonials Section (Hidden by default until owner provides real testimonials) [ADD REAL TESTIMONIAL + NAME + COMPANY] -->
  <section id="testimonials" class="hidden" aria-hidden="true">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-surface-card border border-line-light rounded-2xl p-8 sm:p-12 text-center">
        <h2 class="font-heading text-2xl font-bold text-content-primary mb-4">
          Client Feedback & Verified Reviews
        </h2>
        <p class="text-content-secondary">[ADD REAL TESTIMONIAL + NAME + COMPANY]</p>
      </div>
    </div>
  </section>
  ```
- **Action Required**:
  1. Obtain 2 to 4 genuine client testimonials from verified commercial engagements. Each review should include:
     - Quote body (2–3 sentences highlighting specific business value or uptime results)
     - Client's full name
     - Client's role and organization
     - Project type (e.g. "Industrial IoT Telemetry" or "Enterprise POS Platform")
  2. In `src/pages/index.astro`, remove `class="hidden"` and `aria-hidden="true"` from `<section id="testimonials">`.
  3. Replace the placeholder content with responsive review cards matching the site design system.
- **Example Production Review Card Markup**:
  ```astro
  <section id="testimonials" class="py-16 sm:py-20 bg-surface-muted border-b border-line-light">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-12">
        <span class="text-xs font-mono font-bold uppercase tracking-wider text-brand-700">Client Results</span>
        <h2 class="font-heading text-2xl sm:text-3xl font-bold text-content-primary mt-2">Verified Commercial Engagements</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div class="bg-surface-card p-6 sm:p-8 rounded-2xl border border-line-light shadow-card">
          <p class="text-content-secondary leading-relaxed mb-6">
            "99COMLABS engineered our multi-branch billing software with an offline SQLite architecture. Our stores run without interruption even during internet outages, and daily cloud reconciliation is 100% automated."
          </p>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center">RM</div>
            <div>
              <div class="font-semibold text-content-primary">Rajesh Menon</div>
              <div class="text-xs text-content-muted">Operations Director, Retail POS Network (Kozhikode)</div>
            </div>
          </div>
        </div>
        <div class="bg-surface-card p-6 sm:p-8 rounded-2xl border border-line-light shadow-card">
          <p class="text-content-secondary leading-relaxed mb-6">
            "Their embedded engineering team built our IoT sensor boards from custom PCB schematics to cloud MQTT telemetry. Reliable hardware and zero jargon throughout the engagement."
          </p>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center">AK</div>
            <div>
              <div class="font-semibold text-content-primary">Anand Kumar</div>
              <div class="text-xs text-content-muted">Managing Partner, Life & Tree Automation</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  ```

---

### Section D: Engineering Team Profiles & Leadership Biographies

#### Item 5: About Us Team Section
- **File**: `99comlabs/src/pages/about.astro` (Lines 290–324)
- **Current Code**:
  ```astro
  <!-- Honest Placeholder Block (Strict R4 Requirement) -->
  <div class="bg-surface-muted border-2 border-dashed border-line-medium rounded-2xl p-8 sm:p-12 text-center max-w-3xl mx-auto">
    <h3 class="font-mono font-bold text-base sm:text-lg text-content-primary mb-2">
      [ADD REAL TEAM MEMBER BIOS & PHOTOS]
    </h3>
    <p class="text-sm text-content-secondary max-w-xl mx-auto leading-relaxed mb-6">
      Engineering profiles, founder biographies, and verified photographs are currently being compiled...
    </p>
  </div>
  ```
- **Action Required**:
  1. Prepare genuine photographs of core team members and founders. Optimize images as WebP (recommended dimensions: 400x400px square, under 50 KB each) and save them into `public/images/team/`.
  2. Write 2–3 sentence biographies detailing each engineer's educational background, primary domain (Embedded/IoT, Full-Stack Software, Cloud DevOps), and years of commercial experience.
  3. Replace the dashed placeholder container with a team grid.
- **Example Team Card Replacement**:
  ```astro
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    <div class="bg-surface-card border border-line-light rounded-2xl p-6 text-center shadow-card">
      <img
        src="/images/team/lead-embedded.webp"
        alt="Muhammed Rashid, Lead Embedded Engineer at 99COMLABS"
        width="160"
        height="160"
        loading="lazy"
        decoding="async"
        class="w-32 h-32 rounded-full mx-auto object-cover mb-4 border-2 border-brand-200"
      />
      <h3 class="font-heading text-lg font-bold text-content-primary">Muhammed Rashid</h3>
      <p class="text-xs font-mono font-semibold text-brand-700 uppercase tracking-wider mb-2">Lead Systems & IoT Architect</p>
      <p class="text-sm text-content-secondary leading-relaxed">
        B.Tech in Electronics Engineering. Over 8 years designing microcontroller firmware, MQTT telemetry systems, and custom PCB schematics.
      </p>
    </div>
  </div>
  ```

---

### Section E: Lead Generation & Form Endpoints

#### Item 10: On-Page Contact & Quote Inquiry Form
- **File**: `99comlabs/src/components/ContactForm.astro`
- **Default Action**: FormSubmit.co AJAX endpoint pointing to `https://formsubmit.co/ajax/connect@99comlabs.co.in`
- **Action Required**:
  - **Option 1 (Zero-code FormSubmit - Recommended)**:
    Keep the default endpoint. When the first inquiry is submitted from your published domain, FormSubmit will send a one-time verification email to `connect@99comlabs.co.in`. Click the activation link in that email. From that point on, all inquiries will be delivered directly to your inbox with full field formatting.
  - **Option 2 (Custom Webhook / Third-Party CRM)**:
    If you use a CRM (such as HubSpot, Zoho, Basin, Formspree, or an internal Node/PHP script), pass the custom URL into the component:
    ```astro
    <ContactForm endpoint="https://your-crm-endpoint.com/webhook" />
    ```

#### Item 13: Preserved Support Helpdesk Portal
- **File**: `99comlabs/public/support/index.html` (Line 187)
- **Current Action**:
  ```html
  <form id="supportTicketForm" class="support-form" action="https://formsubmit.co/support@99comlabs.co.in" method="POST">
  ```
- **Action Required**:
  1. Ensure that `support@99comlabs.co.in` is an active, monitored email account on your cPanel mail server.
  2. Navigate to `https://99comlabs.co.in/support/` in your browser.
  3. Fill out the ticket form with test details (e.g. "Test Ticket #1") and click **Submit Ticket**.
  4. Open your `support@99comlabs.co.in` webmail inbox. Look for an email from `FormSubmit.co` titled *"Action Required: Confirm your email address"*.
  5. Click the **Activate Form** link. Your support ticket system is now fully operational and will route every `#99LAB-XXXXX` ticket directly to your team.

---

### Section F: Analytics & Webmaster Verification

#### Item 11: Google Analytics 4 (GA4) Tracking
- **File**: `99comlabs/src/components/Analytics.astro` (or `BaseHead.astro`)
- **Current Placeholder**: `[ADD GA4 MEASUREMENT ID]`
- **Action Required**:
  1. Log into [Google Analytics](https://analytics.google.com/) using your Google account.
  2. Create a new property named `99COMLABS` (reporting time zone: India Standard Time, currency: INR).
  3. Under Data Streams, select **Web** and enter your production URL: `https://99comlabs.co.in`.
  4. Copy your **Measurement ID** (formatted as `G-XXXXXXXXXX`).
  5. Replace `[ADD GA4 MEASUREMENT ID]` with your actual ID in `src/components/Analytics.astro`.
- **Automatic Event Dispatchers Included in Code**:
  Once your Measurement ID is added, the following conversion events trigger automatically:
  - Phone call clicks: `click_to_call` (tracks taps on `+91 9745551513`)
  - WhatsApp chat clicks: `whatsapp_click` (tracks taps on floating button and text links)
  - CTA quote button clicks: `cta_quote_click` (tracks taps on "Get a Free Quote")
  - Inquiry form submission: `generate_lead` (tracks valid quote requests)

#### Item 12: Google Search Console (GSC) Verification
- **File**: `99comlabs/src/components/Analytics.astro` (injected in `<head>` by `BaseLayout.astro`)
- **Current Placeholder**: `[ADD GSC VERIFICATION TOKEN]`
- **Action Required**:
  1. Open [Google Search Console](https://search.google.com/search-console).
  2. Add a new property with URL prefix `https://99comlabs.co.in/`.
  3. In the verification methods modal, select **HTML tag**.
  4. Google will give you a tag like: `<meta name="google-site-verification" content="dGhpcy1pcy1hLXJlYWwtdmVyaWZpY2F0aW9uLXRva2Vu" />`.
  5. Copy the string inside `content="..."` and replace `[ADD GSC VERIFICATION TOKEN]` in `src/components/Analytics.astro`.
  6. Deploy your site, return to Google Search Console, and click **Verify**.

---

## 4. Post-Handover Verification Routine

After replacing any placeholder, run the following verification commands to ensure zero regressions:

```bash
# 1. Type-check all Astro components and TypeScript
npm run check

# 2. Build the static production site
npm run build

# 3. Verify internal link integrity and schema validation
npm test

# 4. Verify responsive viewports (360px, 768px, 1280px)
npm run test:responsive

# 5. Run mobile Lighthouse audit (ensuring 90+ across all 4 categories)
npm run test:lighthouse
```

---

*Handover catalog prepared and validated for 99COMLABS Engineering & Innovation Lab.*
