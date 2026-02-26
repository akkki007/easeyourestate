// import { auth, currentUser } from "@clerk/nextjs/server"
// import { redirect } from "next/navigation"

// type User = NonNullable<Awaited<ReturnType<typeof currentUser>>>

// export interface AuthResult {
//   userId: string
//   user: User
//   isOnboarded: boolean
// }

// /**
//  * Server-side auth proxy for protected pages
//  * Handles authentication and onboarding checks in one place
//  */
// export async function requireAuth(): Promise<AuthResult> {
//   const { userId } = await auth()

//   if (!userId) {
//     redirect("/demoone")
//   }

//   const user = await currentUser()

//   if (!user) {
//     redirect("/demoone")
//   }

//   const isOnboarded = user.unsafeMetadata?.onboarded === true

//   return {
//     userId,
//     user,
//     isOnboarded,
//   }
// }

// /**
//  * Require auth and ensure user has completed onboarding
//  * Redirects to onboarding if not completed
//  */
// export async function requireOnboarded(): Promise<AuthResult> {
//   const authResult = await requireAuth()

//   if (!authResult.isOnboarded) {
//     redirect("/onboarding")
//   }

//   return authResult
// }

// /**
//  * Get auth status without redirecting
//  * Useful for pages that need to conditionally render based on auth
//  */
// export async function getAuthStatus(): Promise<AuthResult | null> {
//   const { userId } = await auth()

//   if (!userId) {
//     return null
//   }

//   const user = await currentUser()

//   if (!user) {
//     return null
//   }

//   const isOnboarded = user.unsafeMetadata?.onboarded === true

//   return {
//     userId,
//     user,
//     isOnboarded,
//   }
// }
