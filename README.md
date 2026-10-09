# Ayyaappa Painting Works — Website

A production-ready, responsive, single-page landing website for **Ayyaappa Painting Works** — a professional painting contractor. The design combines subtle Indian heritage elegance with a modern premium aesthetic, built with vanilla HTML, CSS, and JavaScript, with Supabase for project gallery and customer reviews.

> Traditional Craftsmanship. Beautiful Finishes. Trusted Service.

---

## ✨ Features

- 🏛️ **Subtle Indian ethnic design** — deep maroon, warm ivory, muted gold, with traditional ornamental dividers
- 📱 **Fully responsive** — mobile, tablet, and desktop optimized
- 🖼️ **Horizontal scrolling gallery** with lightbox preview, keyboard navigation, and mobile swipe
- ⭐ **Customer reviews** loaded dynamically from Supabase with a moderated submission form
- 💬 **Floating WhatsApp button** with one-click chat from anywhere on the page
- 🚀 **Lightweight** — no frameworks, no build step, instant deploys
- 🔒 **Secure by default** — only public Supabase anon key is exposed, RLS policies protect data
- ♿ **Accessible** — semantic HTML, ARIA labels, keyboard navigation, focus states, reduced motion
- 🔎 **SEO ready** — proper meta tags, Open Graph, structured data for local business

---

## 📂 Project Structure

```
ayyaappa-painting-works/
├── index.html                 # Main HTML entry
├── css/
│   ├── style.css              # Main stylesheet
│   └── responsive.css         # Responsive breakpoints
├── js/
│   ├── config.js              # ⚙️ EDIT THIS - business & Supabase config
│   ├── supabase.js            # Supabase client wrapper
│   ├── gallery.js             # Gallery + lightbox
│   ├── reviews.js             # Reviews + submission form
│   └── main.js                # Navigation, scroll, contact links
├── assets/
│   ├── logo/                  # Replace with real logo
│   ├── images/                # Replace with real photos
│   └── icons/                 # Optional custom icons
├── supabase/
│   └── schema.sql             # ⬅ Run this in Supabase SQL editor
├── .env.example               # Environment variable template
├── .gitignore
└── README.md                  # This file
```

---

## 🚀 Quick Start (Local)

The site is 100% static — no build step required.

### Option 1: Open directly
1. Open `index.html` in any modern browser. That's it.
2. **Note:** some browsers block JS modules from `file://`. If you see errors, use Option 2.

### Option 2: Local server (recommended)
Use any static server. Pick one:

```bash
# Python (built-in)
python -m http.server 5500

# Node (npx)
npx serve .

# PHP
php -S localhost:5500
```

Then open `http://localhost:5500` in your browser.

The site will work fully without Supabase configured — sample data will be shown.

---

## ⚙️ Configuration

All business information lives in **one file**: [`js/config.js`](js/config.js).

```javascript
const BUSINESS_CONFIG = {
    name: "Ayyaappa Painting Works",
    contractorName: "CONTRACTOR NAME",       // ← Replace
    phone: "919876543210",                    // ← Replace (no '+' for tel/wa.me)
    phoneDisplay: "+91 98765 43210",          // ← Display version
    whatsapp: "919876543210",                 // ← Replace
    email: "",
    location: "Your City, State",             // ← Replace
    workingHours: "Mon - Sat, 9:00 AM - 7:00 PM",
    experience: "10+",                        // ← Replace with real number
    projectsCompleted: "100+",                // ← Replace with real number
    whatsappMessage: "Hello, I am interested in your painting services. I would like to discuss my project."
};
```

The same file also holds Supabase settings:

```javascript
const SUPABASE_CONFIG = {
    url: "https://YOUR_PROJECT_REF.supabase.co",   // ← Replace
    anonKey: "YOUR_SUPABASE_ANON_KEY"              // ← Replace
};
```

> ⚠️ **Never put the Supabase SERVICE ROLE key in this file.** The anon key is safe to expose.

---

## 🗄️ Supabase Setup

### 1. Create a Supabase project
1. Go to [supabase.com](https://supabase.com/) and create a new project.
2. Wait for the project to finish provisioning (~1 minute).
3. Note your **Project URL** and **anon public key** from **Project Settings > API**.

### 2. Create the database tables
1. Open the **SQL Editor** in the Supabase dashboard.
2. Copy the entire contents of [`supabase/schema.sql`](supabase/schema.sql).
3. Paste and run the query.

This will create:
- `projects` table with RLS (public read)
- `reviews` table with RLS (public read of approved, public insert of unapproved)
- A `projects` storage bucket (public read)
- Triggers for `updated_at` and forcing `approved = false` on review insert
- A few clearly-marked **sample** projects and reviews for development

### 3. Update Supabase config
Open `js/config.js` and replace `url` and `anonKey` with your real values.

### 4. Add real project images
1. Go to **Storage** in the Supabase dashboard.
2. Open the `projects` bucket.
3. Upload your project photos.
4. Copy the public URL of each image.
5. Insert a row in the `projects` table (Table Editor > projects > Insert row):
   - `title`: e.g. "Modern Living Room"
   - `description`: short description
   - `image_url`: the public URL from step 4
   - `category`: Interior / Exterior / Residential / Commercial / Texture / Renovation / Other
   - `featured`: `true` for one project to show as the featured work

### 5. Approve customer reviews
Submitted reviews are inserted with `approved = false`. To make a review public:
1. Open the `reviews` table in the Supabase dashboard.
2. Find the review you want to publish.
3. Set `approved` to `true`.
4. Save. The review will appear on the website on the next page load.

---

## 🖼️ Replacing Placeholder Images

The site uses local image paths. Replace these files in `assets/images/`:

| File path | Used for | Recommended size |
|---|---|---|
| `assets/images/hero.jpg` (or `.svg`) | Hero background | 1920×1080 |
| `assets/images/contractor.jpg` | About section portrait | 800×1000 |
| `assets/images/featured.jpg` | Featured project (fallback) | 1600×900 |
| `assets/images/work-1.jpg` … `work-8.jpg` | Sample gallery (only used without Supabase) | 1200×800 |

The site ships with SVG placeholders (`hero.svg`, `placeholder-portrait.svg`, `placeholder-project.svg`) so it looks good even before you add real photos. To replace, just drop a file with the same name (and update CSS for hero, or HTML `src` for photos).

> The samples in `js/gallery.js` are only used **when Supabase is not configured**. Once you add real projects in Supabase, those will be displayed instead.

### Logo
The current logo is built with inline SVG (a stylized "A"). To replace it with a real logo:
1. Drop your logo file in `assets/logo/` (e.g. `logo.png`).
2. Open `index.html` and replace the `.logo-mark` block in the navbar with:
   ```html
   <img src="assets/logo/logo.png" alt="Ayyaappa Painting Works" class="logo-mark" />
   ```

---

## 🚢 Deployment to Vercel

The fastest way to deploy:

### Option A: Vercel Dashboard
1. Push this folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com/) → **Add New Project**.
3. Import the GitHub repo.
4. **Framework Preset:** select **"Other"**.
5. **Build Command:** leave empty.
6. **Output Directory:** leave empty (or set to `.`).
7. Click **Deploy**. Done — your site is live.

### Option B: Vercel CLI
```bash
npm i -g vercel
cd ayyaappa-painting-works
vercel
```

Follow the prompts. The site will be deployed in under a minute.

### Custom domain
In Vercel: **Project Settings > Domains** → add your custom domain (e.g. `ayyaappapainting.com`) and follow the DNS instructions.

### ⚠️ Note about environment variables
This is a static frontend, so environment variables are **not** automatically injected into your JS at build time. The site reads from `js/config.js` directly. To change config in production:
- Edit `js/config.js` in your repo, OR
- Use Vercel environment variables + a small build script (out of scope for V1 — keep it simple).

---

## 🛠️ Customization Guide

| What to change | Where to edit |
|---|---|
| Contractor name | `js/config.js` → `contractorName` |
| Phone number | `js/config.js` → `phone` and `phoneDisplay` |
| WhatsApp number | `js/config.js` → `whatsapp` |
| WhatsApp pre-filled message | `js/config.js` → `whatsappMessage` |
| Location / city | `js/config.js` → `location` |
| Working hours | `js/config.js` → `workingHours` |
| Years of experience | `js/config.js` → `experience` |
| Projects completed | `js/config.js` → `projectsCompleted` |
| Logo | `assets/logo/` (replace `.logo-mark` in `index.html`) |
| Hero background | `assets/images/hero.jpg` |
| Contractor photo | `assets/images/contractor.jpg` |
| Project gallery | Supabase `projects` table |
| Customer reviews | Supabase `reviews` table |
| Service titles & descriptions | `index.html` (search for `service-card`) |
| Colors | `css/style.css` → `:root` (CSS variables) |
| Fonts | `index.html` → Google Fonts `<link>` |
| Footer copyright year | auto-updated via JS |

---

## 🧪 Browser Support

Tested on:
- ✅ Chrome / Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest, including iOS)
- ✅ Samsung Internet
- ✅ Mobile Chrome & Safari

Graceful degradation:
- `IntersectionObserver` → reveals are applied immediately
- `backdrop-filter` → falls back to solid background

---

## 🔮 Future Roadmap (V2)

This site is intentionally simple. The architecture leaves room for:

- 🔐 Owner login (Supabase Auth)
- 🛠️ Owner dashboard (manage projects, approve reviews, update business info)
- 🖼️ Drag-and-drop image upload to Supabase Storage
- 📊 View counts & simple analytics
- 🌐 Multi-language (English / Telugu / Hindi / Tamil)

The `js/supabase.js` module is already structured for easy extension.

---

## 📝 License

This project is proprietary and intended for **Ayyaappa Painting Works** use.

---

## 🙏 Credits

- Typography: [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) and [Poppins](https://fonts.google.com/specimen/Poppins) via Google Fonts
- Icons: hand-drawn inline SVGs
- Backend: [Supabase](https://supabase.com)
- Hosting: [Vercel](https://vercel.com)
