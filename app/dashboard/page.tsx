import { requireOnboarded } from "@/lib/auth/proxy"
import { UserButton } from "@clerk/nextjs"
import Link from "next/link"

export default async function DashboardPage() {
  const { user } = await requireOnboarded()

  const userName = user.firstName || "User"
  const userEmail = user.emailAddresses[0]?.emailAddress || ""
  const userRole = (user.unsafeMetadata?.role as string) || "user"

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <header className="border-b border-gray-800 bg-background-dark/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            EaseYourEstate
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden sm:block">
              {userEmail}
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {userName}!
            </h1>
            <p className="text-gray-400">
              You are signed in as a{" "}
              <span className="text-primary capitalize">{userRole}</span>
            </p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats Card */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Properties</span>
                  <span className="text-white font-medium">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Listings</span>
                  <span className="text-white font-medium">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Messages</span>
                  <span className="text-white font-medium">0</span>
                </div>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Recent Activity
              </h3>
              <p className="text-gray-400 text-sm">
                No recent activity to show.
              </p>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full py-2 px-4 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors text-sm">
                  Add Property
                </button>
                <button className="w-full py-2 px-4 bg-gray-800 text-white border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-sm">
                  View Listings
                </button>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="mt-8 p-4 bg-green-900/20 border border-green-800/30 rounded-lg">
            <p className="text-green-400 text-sm">
              Your account is set up and ready to go!
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
