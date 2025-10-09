# 🚀 Deployment Guide

This guide covers deploying the Bento Grid Generator to Netlify and other platforms.

## 📋 Table of Contents
- [Netlify Deployment](#netlify-deployment)
- [Vercel Deployment](#vercel-deployment)
- [GitHub Pages](#github-pages)
- [Environment Setup](#environment-setup)
- [SEO Configuration](#seo-configuration)

---

## 🌐 Netlify Deployment (Recommended)

### Quick Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/aruntemme/bento-generator)

### Manual Deployment

1. **Build the Project**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy to Netlify**
   - Install Netlify CLI (optional):
     ```bash
     npm install -g netlify-cli
     ```
   
   - Login to Netlify:
     ```bash
     netlify login
     ```
   
   - Deploy:
     ```bash
     netlify deploy --prod
     ```

### Netlify Configuration

The project includes a `netlify.toml` file with optimized settings:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
```

Key features configured:
- ✅ SPA routing via `_redirects`
- ✅ Security headers
- ✅ Cache optimization
- ✅ Automatic builds on push

### Connect GitHub Repository

1. Go to [Netlify](https://app.netlify.com/)
2. Click "New site from Git"
3. Choose "GitHub" and authorize
4. Select the `bento-generator` repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18 or higher
6. Click "Deploy site"

Your site will be live at `https://[your-site-name].netlify.app`

### Custom Domain

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow the DNS configuration instructions
4. Enable HTTPS (automatic with Netlify)

---

## ▲ Vercel Deployment

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aruntemme/bento-generator)

### Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Production Deployment**
   ```bash
   vercel --prod
   ```

### Vercel Configuration

Create `vercel.json` (optional):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 📄 GitHub Pages

1. **Update `vite.config.ts`**
   ```typescript
   export default defineConfig({
     base: '/bento-generator/', // Your repo name
     plugins: [react()],
   });
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   git add dist -f
   git commit -m "Deploy to GitHub Pages"
   git subtree push --prefix dist origin gh-pages
   ```

3. **Enable GitHub Pages**
   - Go to Settings → Pages
   - Select `gh-pages` branch
   - Click Save

---

## 🔧 Environment Setup

### Required Environment Variables

Currently, this project doesn't require environment variables. If you add features that need them:

1. Create `.env` file:
   ```env
   VITE_API_URL=your_api_url
   VITE_ANALYTICS_ID=your_analytics_id
   ```

2. Add to `.gitignore`:
   ```
   .env
   .env.local
   ```

3. Configure in Netlify:
   - Site settings → Build & deploy → Environment
   - Add each variable

---

## 📊 SEO Configuration

### Files Included

The project includes comprehensive SEO setup:

✅ **`index.html`** - Meta tags, Open Graph, Twitter Cards, JSON-LD
✅ **`robots.txt`** - Search engine crawler instructions
✅ **`sitemap.xml`** - Site structure for search engines
✅ **`manifest.json`** - PWA configuration
✅ **`_redirects`** - SPA routing for Netlify

### Update Before Deployment

1. **Update Domain** in `index.html`:
   ```html
   <!-- Change all instances of: -->
   https://bento-generator.com/
   <!-- To your actual domain -->
   ```

2. **Update `sitemap.xml`**:
   ```xml
   <loc>https://your-domain.com/</loc>
   <lastmod>2025-10-09</lastmod>
   ```

3. **Update `robots.txt`**:
   ```
   Sitemap: https://your-domain.com/sitemap.xml
   ```

4. **Add Open Graph Image**:
   - Create a 1200×630px image
   - Save as `public/og-image.png`
   - Should showcase the app's UI

### Analytics Setup (Optional)

Add Google Analytics to `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🎯 Performance Optimization

### Build Optimization

The project is already optimized with:
- ✅ Vite for fast builds
- ✅ Code splitting
- ✅ Tree shaking
- ✅ Minification
- ✅ Image optimization via Unsplash CDN

### Lighthouse Scores Target

Aim for these scores:
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 100

### Monitoring

1. **Netlify Analytics** (paid): Built-in traffic analytics
2. **Google Search Console**: Monitor SEO performance
3. **Cloudflare Analytics** (free): If using Cloudflare

---

## 🔒 Security Headers

The `netlify.toml` includes security headers:

- `X-Frame-Options`: Prevents clickjacking
- `X-Content-Type-Options`: Prevents MIME sniffing
- `X-XSS-Protection`: XSS attack protection
- `Referrer-Policy`: Controls referrer information

---

## 📝 Deployment Checklist

Before deploying to production:

- [ ] Update domain URLs in `index.html`
- [ ] Update `sitemap.xml` with actual domain
- [ ] Update `robots.txt` sitemap URL
- [ ] Create and add `og-image.png` (1200×630px)
- [ ] Test build locally: `npm run build && npm run preview`
- [ ] Check for console errors
- [ ] Test on mobile devices
- [ ] Run Lighthouse audit
- [ ] Verify all links work
- [ ] Test social sharing preview
- [ ] Set up analytics (optional)
- [ ] Configure custom domain (optional)
- [ ] Enable HTTPS

---

## 🆘 Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Routes Not Working

Ensure `_redirects` file is in `public/` folder:
```
/*    /index.html   200
```

### Images Not Loading

Check that images are in `public/` or properly imported in components.

### 404 on Refresh

This is usually a routing issue. Verify:
1. `_redirects` file exists in `public/`
2. File contains: `/*    /index.html   200`

---

## 📞 Support

If you encounter issues:

1. Check [GitHub Issues](https://github.com/aruntemme/bento-generator/issues)
2. Review [Netlify Documentation](https://docs.netlify.com/)
3. Open a new issue with deployment logs

---

## 🎉 Post-Deployment

After successful deployment:

1. **Submit to Search Engines**
   - [Google Search Console](https://search.google.com/search-console)
   - [Bing Webmaster Tools](https://www.bing.com/webmasters)

2. **Share Your Site**
   - Post on social media
   - Submit to design communities
   - Add to your portfolio

3. **Monitor Performance**
   - Set up uptime monitoring
   - Check analytics regularly
   - Monitor Core Web Vitals

---

Made with ❤️ by the Bento Grid Generator community

