# Estatein - Real Estate Landing Page

A modern, responsive real estate landing page built with Next.js 14, Tailwind CSS, and React components.

## 🚀 Features

- ✅ Modern, clean design with dark mode support
- ✅ Fully responsive layout
- ✅ Optimized with Next.js 14 App Router
- ✅ Tailwind CSS for styling
- ✅ Google Fonts (Plus Jakarta Sans)
- ✅ Material Symbols icons
- ✅ Reusable React components
- ✅ Smooth animations and transitions

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.x or higher
- npm or yarn package manager

## 🛠️ Installation

1. **Create a new Next.js project** (if starting fresh):
```bash
npx create-next-app@latest estatein
cd estatein
```

2. **Install dependencies**:
```bash
npm install clsx tailwind-merge
npm install -D @tailwindcss/forms @tailwindcss/typography
```

3. **Copy the project files** into your Next.js project:
   - Copy all files from the `/app` folder
   - Copy all files from the `/components` folder
   - Copy the `tailwind.config.js` file
   - Copy the `lib/utils.js` file

## 📁 Project Structure

```
estatein/
├── app/
│   ├── layout.js          # Root layout with font configuration
│   ├── page.js            # Main home page
│   └── globals.css        # Global styles and Tailwind
├── components/
│   ├── Navbar.js          # Navigation component
│   ├── Hero.js            # Hero section
│   ├── Features.js        # Feature cards
│   ├── Properties.js      # Property listings
│   ├── Testimonials.js    # Client testimonials
│   ├── FAQ.js             # FAQ section
│   ├── CTA.js             # Call-to-action
│   └── Footer.js          # Footer component
├── lib/
│   └── utils.js           # Utility functions
├── tailwind.config.js     # Tailwind configuration
└── package.json           # Dependencies
```

## 🎨 Color Scheme

The project uses a custom color palette defined in `tailwind.config.js`:

```javascript
colors: {
  primary: '#703BF7',           // Purple brand color
  'background-light': '#FFFFFF',
  'background-dark': '#0B0B0B',
  'card-dark': '#141414',
  'border-dark': '#262626',
}
```

## 🚦 Running the Project

1. **Development mode**:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

2. **Production build**:
```bash
npm run build
npm start
```

## 🧩 Components Overview

### Navbar
- Sticky navigation with backdrop blur
- Dismissible top banner
- Desktop navigation menu
- Contact button

### Hero
- Large heading with gradient background
- Two CTA buttons
- Statistics cards (200+ customers, 10k+ properties, 16+ years)
- Featured image with animated badge

### Features
- Four feature cards in a grid
- Hover effects
- Material icons

### Properties
- Grid of property cards
- Image hover zoom effect
- Property details (bedrooms, bathrooms, type)
- Price and view details button
- Pagination controls

### Testimonials
- 5-star ratings display
- Client testimonials with avatars
- Pagination controls

### FAQ
- Three FAQ cards
- Read more buttons
- Pagination controls

### CTA
- Large call-to-action section
- Purple gradient background
- Explore properties button

### Footer
- Newsletter subscription
- Footer links in multiple columns
- Social media icons
- Copyright information

## 🔧 Customization

### Change Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: '#YOUR_COLOR',
  // ... other colors
}
```

### Add More Properties
Edit `components/Properties.js` and add to the `properties` array:
```javascript
{
  image: 'YOUR_IMAGE_URL',
  title: 'Property Title',
  description: 'Description...',
  bedrooms: 3,
  bathrooms: 2,
  type: 'Villa',
  typeIcon: 'villa',
  price: '$450,000',
}
```

### Modify Content
Each component is self-contained and can be easily modified. Just edit the corresponding file in the `components/` folder.

## 🎯 Using with Reactbits

To integrate Reactbits components:

1. Visit [reactbits.dev](https://reactbits.dev)
2. Browse their component library
3. Copy the component code
4. Paste into a new file in your `components/` folder
5. Import and use in your pages

Example:
```javascript
// components/ReactbitsCard.js
export default function ReactbitsCard() {
  // Paste Reactbits component code here
}

// app/page.js
import ReactbitsCard from '@/components/ReactbitsCard'
```

## 📱 Responsive Design

The site is fully responsive with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🌙 Dark Mode

Dark mode is enabled by default with the `class="dark"` on the `<html>` tag in `app/layout.js`. To toggle:

```javascript
// Remove or add the "dark" class
<html lang="en" className="dark">
```

## 📦 Dependencies

- **next**: ^14.2.5
- **react**: ^18
- **react-dom**: ^18
- **tailwindcss**: ^3.4.4
- **clsx**: ^2.1.1
- **tailwind-merge**: ^2.5.2
- **@tailwindcss/forms**: ^0.5.7
- **@tailwindcss/typography**: ^0.5.13

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Design inspired by modern real estate platforms
- Icons from Google Material Symbols
- Font: Plus Jakarta Sans from Google Fonts

---

Built with ❤️ using Next.js and Tailwind CSS
