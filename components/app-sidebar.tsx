"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Home, LayoutGrid, LogOut, Settings, FileText } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
  const pathname = usePathname()

  const menuItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Browse Equipment",
      url: "/equipment",
      icon: LayoutGrid,
    },
    {
      title: "My Bookings",
      url: "/my-bookings",
      icon: BarChart3,
    },
    {
      title: "Department Resources",
      url: "/department-resources",
      icon: FileText,
    },
  ]

  const bottomItems = [
    {
      title: "Profile",
      url: "/profile",
      icon: Settings,
    },
    {
      title: "Logout",
      url: "/logout",
      icon: LogOut,
    },
  ]

  return (
    <Sidebar className="border-r border-gray-300 bg-white" collapsible="none">
      {/* Sidebar Header */}
      <SidebarHeader className="border-b border-gray-300 py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white font-bold text-lg">
            UR
          </div>
          <div>
            <div className="font-bold text-black text-sm">UNIVERSITY RESEARCH</div>
            <div className="text-xs text-gray-500">Equipment System</div>
          </div>
        </div>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent className="px-3 py-4">
        <SidebarMenu className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url))

            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarSeparator className="mx-4 bg-gray-300" />

      {/* Sidebar Footer */}
      <SidebarFooter className="px-3 py-4 space-y-2">
        <SidebarMenu className="space-y-1">
          {bottomItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.url

            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
