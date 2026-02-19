import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/demoone',
  '/signup',
  '/sso-callback',
  '/',
  '/api/webhooks/(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  // For public routes, allow access
  if (isPublicRoute(request)) {
    return NextResponse.next()
  }

  // For protected routes, require authentication
  // This will redirect to sign-in if not authenticated
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.redirect(new URL('/demoone', request.url))
  }

  // Let the pages handle onboarding logic to avoid metadata mismatch issues
  // Pages have access to the full user object with unsafeMetadata
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
