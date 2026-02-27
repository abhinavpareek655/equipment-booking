"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Menu, Home, LayoutGrid, BarChart3, FileText, LogOut, Shield, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useMobile } from "@/hooks/use-mobile"
import Image from "next/image"
import { UserNav } from "@/components/user-nav"

interface UserData {
  role: string;
}

export function MainNav() {
  const isMobile = useMobile()
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data: UserData) => {
        setUserRole(data.role);
      })
      .catch(() => {
        setUserRole("");
      });
  }, [pathname]);

  const menuItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "My Bookings",
      url: "/my-bookings",
      icon: BarChart3,
    },
    {
      title: "Book Equipment",
      url: "/booking",
      icon: LayoutGrid,
    },
    {
      title: "Guidlines",
      url: "/guidelines",
      icon: FileText,
    },
  ]

  // Add admin dashboards based on role
  const adminMenuItems = []
  if (userRole === "Admin") {
    adminMenuItems.push({
      title: "Admin Dashboard",
      url: "/admin/dashboard",
      icon: Shield,
    })
  }
  if (userRole === "Super-admin") {
    adminMenuItems.push(
      {
      title: "Admin Dashboard",
      url: "/admin/dashboard",
      icon: Shield,
    },
    {
      title: "Super Admin Dashboard",
      url: "/super-admin/dashboard",
      icon: ShieldCheck,
    })
  }

  const allMenuItems = [...menuItems, ...adminMenuItems]

  const bottomItems = [
    {
      title: "Logout",
      url: "/logout",
      icon: LogOut,
    },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <Link href={'/'} >
      <div className="border-b border-gray-300 py-4 px-6">
        <div className="flex items-center gap-3">
          <Image
            src="/images/curaj-logo.png"
            alt="Central University of Rajasthan"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <div>
            <div className="text-sm font-bold text-gray-900">DBT BUILDER</div>
            <div className="text-xs text-gray-600">Equipment Booking System</div>
          </div>
        </div>
      </div>
      </Link>

      {/* Main Menu */}
      <div className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {allMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url))

            return (
              <Link
                key={item.url}
                href={item.url}
                onClick={() => isMobile && setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Separator */}
      <div className="mx-4 h-px bg-gray-300" />

      {/* Bottom Menu */}
      <div className="px-3 py-4 space-y-2">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md transition-colors text-gray-700 hover:bg-gray-100">
          <UserNav />
        </div>
        
        <nav className="space-y-1">
          {bottomItems.filter(item => item.url === "/logout").map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.url

            return (
                <div
                key={item.url}
                onClick={async () => {
                  // ask for confirmation
                  if (!window.confirm("Are you sure you want to log out?")) {
                  return;
                  }
                  // Tell the server to clear the cookie
                  await fetch("/api/auth/logout", {
                  method: "POST",
                  credentials: "include",
                  });
                  // Then clear client state and close mobile menu
                  isMobile && setIsOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors cursor-pointer ${
                  isActive
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-gray-100"
                }`}
                >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.title}</span>
                </div>
            )
          })}
        </nav>
      </div>
    </div>
  )

  // Mobile view with Sheet
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 p-0">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0 bg-white">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop view with permanent sidebar
  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 border-r border-gray-300 bg-white flex-col">
      <SidebarContent />
    </aside>
  )
}
