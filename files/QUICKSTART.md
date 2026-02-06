# Quick Start Guide - Estatein Next.js

## Option 1: Start from Scratch

```bash
# 1. Create Next.js app
npx create-next-app@latest estatein

# When prompted:
# ✓ Would you like to use TypeScript? No
# ✓ Would you like to use ESLint? Yes
# ✓ Would you like to use Tailwind CSS? Yes
# ✓ Would you like to use `src/` directory? No
# ✓ Would you like to use App Router? Yes
# ✓ Would you like to customize the default import alias? Yes (@/*)

# 2. Navigate to project
cd estatein

# 3. Install additional dependencies
npm install clsx tailwind-merge
npm install -D @tailwindcss/forms @tailwindcss/typography

# 4. Copy all provided files into your project

# 5. Run development server
npm run dev
```

## Option 2: Use Provided Files

If you already have all the files:

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev
```

## File Checklist

Make sure you have copied these files:

### App Directory
- [ ] `app/layout.js`
- [ ] `app/page.js`
- [ ] `app/globals.css`

### Components Directory
- [ ] `components/Navbar.js`
- [ ] `components/Hero.js`
- [ ] `components/Features.js`
- [ ] `components/Properties.js`
- [ ] `components/Testimonials.js`
- [ ] `components/FAQ.js`
- [ ] `components/CTA.js`
- [ ] `components/Footer.js`

### Other Files
- [ ] `lib/utils.js`
- [ ] `tailwind.config.js`
- [ ] `package.json`

## Verification

After running `npm run dev`, visit `http://localhost:3000`

You should see:
✅ Dark themed real estate landing page
✅ Navbar with "Estatein" logo
✅ Hero section with purple gradient
✅ Property listings
✅ Testimonials
✅ FAQ section
✅ Footer

## Common Issues

### Issue: Tailwind styles not working
**Solution**: Make sure `tailwind.config.js` has the correct content paths:
```javascript
content: [
  './pages/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
  './app/**/*.{js,ts,jsx,tsx,mdx}',
]
```

### Issue: Material icons not showing
**Solution**: Check that the Google Fonts link is in `app/layout.js`:
```html
<link 
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" 
  rel="stylesheet" 
/>
```

### Issue: Images not loading
**Solution**: The template uses external image URLs. For production:
1. Download images to `public/images/`
2. Update image src in components
3. Use Next.js `<Image>` component for optimization

## Next Steps

1. **Customize Content**: Edit text, images, and data in components
2. **Add Pages**: Create new pages in the `app/` directory
3. **Add Reactbits**: Copy components from reactbits.dev
4. **Add Routing**: Create `app/about/page.js`, `app/properties/page.js`, etc.
5. **Connect API**: Add data fetching for properties, testimonials
6. **Deploy**: Deploy to Vercel, Netlify, or your preferred platform

## Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Resources

- Next.js Docs: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Reactbits: https://reactbits.dev
- Material Symbols: https://fonts.google.com/icons

---

Need help? Check the full README.md for detailed documentation.
