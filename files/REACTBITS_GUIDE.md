# Reactbits Integration Guide

This guide shows you how to integrate components from Reactbits.dev into your Estatein Next.js project.

## What is Reactbits?

Reactbits is a collection of copy-paste React components and templates built with Tailwind CSS. Unlike component libraries that require npm installation, Reactbits components are copied directly into your project.

## How to Use Reactbits Components

### Step 1: Browse Components

Visit [reactbits.dev](https://reactbits.dev) and browse their component library.

### Step 2: Copy the Component

1. Click on a component you like
2. Copy the code provided
3. Create a new file in your `components/` folder
4. Paste the code

### Step 3: Import and Use

Import the component in your page or other components:

```javascript
import ReactbitsComponent from '@/components/ReactbitsComponent'

export default function Page() {
  return <ReactbitsComponent />
}
```

## Example Integrations

### Example 1: Adding a Reactbits Card

```javascript
// components/ReactbitsCard.js
export default function ReactbitsCard({ title, description, icon }) {
  return (
    <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-2xl p-6 hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-primary">{icon}</span>
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  )
}

// Usage in app/page.js
import ReactbitsCard from '@/components/ReactbitsCard'

<ReactbitsCard 
  title="Modern Design" 
  description="Beautiful components" 
  icon="palette"
/>
```

### Example 2: Adding a Reactbits Button Component

```javascript
// components/ReactbitsButton.js
export default function ReactbitsButton({ 
  children, 
  variant = 'primary', 
  size = 'md',
  onClick 
}) {
  const baseStyles = 'font-medium rounded-xl transition-all'
  
  const variants = {
    primary: 'bg-primary text-white hover:opacity-90',
    secondary: 'border border-border-dark bg-card-dark hover:bg-white/5',
    outline: 'border border-gray-200 dark:border-border-dark hover:bg-gray-50 dark:hover:bg-white/5'
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

// Usage
<ReactbitsButton variant="primary" size="lg">
  Get Started
</ReactbitsButton>
```

### Example 3: Adding a Reactbits Modal

```javascript
// components/ReactbitsModal.js
'use client'

import { useEffect } from 'react'

export default function ReactbitsModal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// Usage
'use client'

import { useState } from 'react'
import ReactbitsModal from '@/components/ReactbitsModal'

export default function Page() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      
      <ReactbitsModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        title="Contact Us"
      >
        <p>Modal content goes here...</p>
      </ReactbitsModal>
    </>
  )
}
```

## Adapting Reactbits to Estatein Theme

When copying Reactbits components, you may need to adapt them to match the Estatein color scheme:

### Color Mapping

Replace Reactbits colors with Estatein colors:

```javascript
// Reactbits might use:
'bg-blue-500'      → 'bg-primary'
'border-gray-300'  → 'border-gray-200 dark:border-border-dark'
'bg-gray-100'      → 'bg-gray-50 dark:bg-card-dark'
'text-gray-600'    → 'text-gray-500 dark:text-gray-400'
```

### Example Conversion

**Original Reactbits Component:**
```javascript
<div className="bg-blue-500 text-white p-4 rounded-lg">
  Content
</div>
```

**Adapted for Estatein:**
```javascript
<div className="bg-primary text-white p-4 rounded-xl">
  Content
</div>
```

## Best Practices

1. **Consistent Styling**: Match Reactbits components to Estatein's design system
2. **Component Folder**: Keep all components organized in `components/`
3. **Reusability**: Make components flexible with props
4. **Dark Mode**: Always include dark mode variants
5. **Tailwind Classes**: Use Estatein's custom Tailwind configuration

## Useful Reactbits Component Types

### For Estatein Project:

1. **Cards** - For property listings, testimonials
2. **Forms** - Contact forms, property search
3. **Navigation** - Breadcrumbs, tabs, menus
4. **Modals** - Property details, image galleries
5. **Buttons** - CTA buttons, navigation buttons
6. **Inputs** - Search bars, filters
7. **Badges** - Property tags, status indicators
8. **Grids** - Property grids, image galleries

## Creating Your Own Reactbits-Style Components

Follow this pattern:

```javascript
// components/MyComponent.js
export default function MyComponent({ 
  // Props with defaults
  variant = 'default',
  size = 'md',
  children 
}) {
  // Define style variants
  const variants = {
    default: 'bg-white dark:bg-card-dark',
    primary: 'bg-primary text-white',
    secondary: 'bg-gray-50 dark:bg-[#1A1A1A]'
  }
  
  // Define size variants
  const sizes = {
    sm: 'p-4 text-sm',
    md: 'p-6 text-base',
    lg: 'p-8 text-lg'
  }
  
  return (
    <div className={`
      border border-gray-200 dark:border-border-dark rounded-2xl
      ${variants[variant]} 
      ${sizes[size]}
    `}>
      {children}
    </div>
  )
}
```

## Additional Resources

- Reactbits Documentation: https://reactbits.dev/docs
- Tailwind CSS: https://tailwindcss.com
- Next.js: https://nextjs.org
- Material Symbols: https://fonts.google.com/icons

---

Happy coding! 🚀
