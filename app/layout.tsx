import type { ReactNode } from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import Image from "next/image"
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
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 w-full border-b bg-background">
              <div className="container px-4 sm:px-6 lg:px-8 flex h-16 items-center">
                <MainNav />
                <div className="flex items-center ml-4">
                  <UserNav />
                </div>
              </div>
            </header>
            <main className="flex-1 container px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">{children}</main>
            <footer className="border-t py-4 sm:py-6">
              <div className="container px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
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
                      <span className="text-xs text-muted-foreground">CURAJ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Image
                      src="/images/naac-logo.png"
                      alt="NAAC A++"
                      width={24}
                      height={24}
                      className="h-6 w-6 object-contain"
                      />
                      <span className="text-xs text-muted-foreground">NAAC A++</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Image
                        src="/images/dbt-logo.png"
                        alt="Department of Biotechnology"
                        width={24}
                        height={24}
                        className="h-6 w-6 object-contain"
                      />
                      <span className="text-xs text-muted-foreground">DBT</span>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
