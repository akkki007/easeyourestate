import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata = {
  title: 'Estatein - Your Dream Property Awaits',
  description: 'Your journey to finding the perfect property begins here.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" 
          rel="stylesheet" 
        />
      </head>
      <body className={`${jakarta.variable} font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-300`}>
        {children}
      </body>
    </html>
  )
}
