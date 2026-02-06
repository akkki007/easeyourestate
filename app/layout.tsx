import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'Wisteria Properties - Your Dream Property Awaits',
  description: 'Your journey to finding the perfect property begins here.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
            rel="stylesheet"
          />
        </head>
        <body className="font-display bg-background-dark text-white antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}