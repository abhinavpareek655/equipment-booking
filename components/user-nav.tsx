"use client"

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { usePathname } from "next/navigation";

interface UserData {
  name: string;
  email: string;
  role: string;
  department: string;
}

export function UserNav() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null);

  const pathname = usePathname();
  useEffect(() => {
    // On mount, call /api/auth/me to check for a valid JWT
    fetch("/api/auth/me", {
      method: "GET",
      credentials: "include", // include HTTP-only cookies
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data: UserData) => {
        setIsLoggedIn(true);
        setUserData(data);
      })
      .catch(() => {
        setIsLoggedIn(false);
        setUserData(null);
      })
      .finally(() => {
        setIsCheckingAuth(false);
      });
  }, [pathname]);

  if (isCheckingAuth) {
    return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
  }
  return isLoggedIn ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/images/user.png" alt="User" />
            <AvatarFallback>US</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userData?.name?.split(" ")[0] || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {userData?.email || "user@curaj.ac.in"}
            </p>
            </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link href="/profile" className="w-full">
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/my-bookings" className="w-full">
              My Bookings
            </Link>
          </DropdownMenuItem>
          {/* For admins/staff */}
          {userData !== null && (userData.role === "Admin" || "Super-admin") && (
              <DropdownMenuItem>
                <Link href="/admin/dashboard" className="w-full">
                  Admin Dashboard
                </Link>
              </DropdownMenuItem>
            )}
          {/* For super admin/developer */}
          {userData !== null && userData.role === "Super-admin" && (
              <DropdownMenuItem>
                <Link href="/super-admin/dashboard" className="w-full">
                  Super-admin Dashboard
                </Link>
              </DropdownMenuItem>
            )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
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
            // Then clear client state
            setIsLoggedIn(false);
            setUserData(null);
          }}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Link href="/login">
      <Button variant="outline">
        Log In
      </Button>
    </Link>
  )
}
