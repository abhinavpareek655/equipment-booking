import type { ReactNode } from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { MainNav } from "@/components/main-nav"
import Image from "next/image"
import Link from "next/link"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const themeColor = "#ffffff";

export const metadata = {
  title: "DBT BUILDER Equipment Booking System",
  description: "Equipment booking system for the School of Life Sciences, Central University of Rajasthan",
  generator: "Next.js",
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel='icon' href='/images/curaj-logo-low.png'/>
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <div className="flex min-h-screen w-full">
            {/* Sidebar - Desktop only */}
            <MainNav />
            
            {/* Main Content */}
            <div className="flex flex-1 flex-col w-full md:ml-64">
              <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 bg-white">{children}</main>
              <footer className="border-t border-gray-300 bg-white">
                <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                  <div className="grid gap-8 md:grid-cols-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src="/images/curaj-logo.png"
                          alt="Central University of Rajasthan"
                          width={32}
                          height={32}
                          className="h-8 w-8 object-contain"
                        />
                        <div>
                          <div className="text-sm font-semibold text-gray-900">DBT BUILDER</div>
                          <div className="text-xs text-gray-600">Equipment Booking System</div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">
                        Central University of Rajasthan, School of Life Sciences
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Image
                            src="/images/NAAC5.jpeg"
                            alt="NAAC A++"
                            width={24}
                            height={24}
                            className="h-12 w-12 object-contain"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Image
                            src="images/NIRF_Logo.jpeg"
                            alt="NIRF Rank 89"
                            width={24}
                            height={24}
                            className="h-12 w-12 object-contain"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Image
                            src="/images/dbt-logo.png"
                            alt="Department of Biotechnology"
                            width={24}
                            height={24}
                            className="h-12 w-12 object-contain"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-gray-900">Quick Links</div>
                      <div className="grid gap-2 text-sm">
                        <Link href="/" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                        <Link href="/equipment" className="text-gray-600 hover:text-gray-900">Browse Equipment</Link>
                        <Link href="/booking" className="text-gray-600 hover:text-gray-900">Book Equipment</Link>
                        <Link href="/my-bookings" className="text-gray-600 hover:text-gray-900">My Bookings</Link>
                        <Link href="/guidelines" className="text-gray-600 hover:text-gray-900">Guidelines</Link>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-gray-900">Account</div>
                      <div className="grid gap-2 text-sm">
                        <Link href="/profile" className="text-gray-600 hover:text-gray-900">Profile</Link>
                        <Link href="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
                        <Link href="/register" className="text-gray-600 hover:text-gray-900">Register</Link>
                        <Link href="/forgot-password" className="text-gray-600 hover:text-gray-900">Forgot Password</Link>
                      </div>
                    </div>

                    <div className="space-y-3">
                        <div className="text-xs text-gray-600">Developer</div>
                        <div className="text-sm font-medium text-gray-900">Abhinav Pareek</div>
                        <a
                          href="https://github.com/abhinavpareek655"
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-gray-600 hover:text-gray-900"
                        >
                          github.com/abhinavpareek655
                        </a>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-gray-200 pt-4">
                    <p className="text-xs text-gray-600">
                      © {new Date().getFullYear()} Central University of Rajasthan. All rights reserved.
                    </p>
                  </div>
                </div>
              </footer>
              </div>
            </div>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
