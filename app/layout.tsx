import type { ReactNode } from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { UserNav } from "@/components/user-nav"
import Image from "next/image"
import { Toaster } from "@/components/ui/toaster"
import { SidebarProvider } from "@/components/ui/sidebar"

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
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              {/* Sidebar */}
              <AppSidebar />
              
              {/* Main Content */}
              <div className="flex flex-1 flex-col w-full">
                <header className="sticky top-0 z-40 border-b border-gray-300 bg-white">
                  <div className="flex h-16 items-center justify-end px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center">
                      <UserNav />
                    </div>
                  </div>
                </header>
                <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 bg-white">{children}</main>
                <footer className="border-t border-gray-300 py-4 sm:py-6 bg-white">
                  <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                        © {new Date().getFullYear()} Central University of Rajasthan. All rights reserved.
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Image
                            src="/images/curaj-logo.png"
                            alt="Central University of Rajasthan"
                            width={24}
                            height={24}
                            className="h-6 w-6 object-contain"
                          />
                          <span className="text-xs text-gray-600">CURAJ</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Image
                          src="/images/naac-logo.png"
                          alt="NAAC A++"
                          width={24}
                          height={24}
                          className="h-6 w-6 object-contain"
                          />
                          <span className="text-xs text-gray-600">NAAC A++</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Image
                            src="/images/dbt-logo.png"
                            alt="Department of Biotechnology"
                            width={24}
                            height={24}
                            className="h-6 w-6 object-contain"
                          />
                          <span className="text-xs text-gray-600">DBT</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </footer>
              </div>
            </div>
          </SidebarProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
