"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useMobile } from "@/hooks/use-mobile"
import Image from "next/image"

export function MainNav() {
  const isMobile = useMobile()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: "/equipment", label: "Equipment" },
    { href: "/booking", label: "Book Equipment" },
    { href: "/my-bookings", label: "My Bookings" },
    { href: "/guidelines", label: "Guidelines" },
  ]

  if (isMobile) {
    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Image
            src="/images/curaj-logo.png"
            alt="Central University of Rajasthan"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <Link href="/" className="flex items-center">
            <span className="font-bold text-sm">DBT BUILDER</span>
          </Link>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 p-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <div className="flex flex-col gap-4 py-4">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                <Image
                  src="/images/curaj-logo.png"
                  alt="Central University of Rajasthan"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
                <div>
                  <div className="font-bold">DBT BUILDER</div>
                  <div className="text-xs text-muted-foreground">Equipment Booking System</div>
                </div>
              </div>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-base font-medium transition-colors hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <Image
            src="/images/curaj-logo.png"
            alt="Central University of Rajasthan"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <Link href="/" className="flex items-center">
            <div>
              <div className="font-bold text-lg">DBT BUILDER</div>
              <div className="text-xs text-muted-foreground hidden sm:block">Equipment Booking System</div>
            </div>
          </Link>
        </div>
        <nav className="hidden gap-6 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium transition-colors hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Image src="/images/naac-logo.png" alt="NAAC A++" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="text-xs font-medium text-muted-foreground">NAAC A++</span>
        </div>
        <div className="flex items-center gap-2">
          <Image
            src="/images/dbt-logo.png"
            alt="Department of Biotechnology"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <span className="text-xs font-medium text-muted-foreground">DBT</span>
        </div>
      </div>
    </div>
  )
}
