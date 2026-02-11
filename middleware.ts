import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/demoone',
  '/signup',
  '/sso-callback',
  '/',
])

const isOnboardingRoute = createRouteMatcher(['/onboarding'])

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth()

  // If not signed in and trying to access protected route, allow Clerk to handle
  if (!userId && !isPublicRoute(request)) {
    return NextResponse.redirect(new URL('/demoone', request.url))
  }

  // If signed in
  if (userId) {
    const metadata = sessionClaims?.metadata as { onboarded?: boolean } | undefined
    const isMetadataOnboarded = metadata?.onboarded
    const isCookieOnboarded = request.cookies.get('onboarded')?.value === 'true'
    const isOnboarded = isMetadataOnboarded || isCookieOnboarded

    // If user is not onboarded and not already on onboarding page
    if (!isOnboarded && !isOnboardingRoute(request)) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // If user is onboarded and trying to access onboarding page, redirect to dashboard
    if (isOnboarded && isOnboardingRoute(request)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Do NOT redirect "/" to dashboard — landing page (/) is for everyone.
    // Sign-in and sign-up redirect URLs handle sending users to dashboard or onboarding.
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
