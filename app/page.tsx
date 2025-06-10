"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, ClipboardList, Database, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="space-y-16 text-center">
          {/* Header Section */}
            <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="inline-block bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 bg-clip-text text-transparent pb-4">
              Equipment Booking System
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 md:text-xl leading-relaxed">
              Central University of Rajasthan - School of Life Sciences
            </p>
            </div>

          {/* Navigation Cards */}
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="group relative overflow-hidden border-0 bg-gray-50/50 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-white">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="flex-col items-center text-center space-y-4 p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md group-hover:shadow-lg transition-shadow duration-300">
                    <Database className="h-8 w-8 text-gray-700" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-lg font-semibold text-gray-900">Equipment</CardTitle>
                    <CardDescription className="text-gray-600">Browse available equipment</CardDescription>
                  </div>
                </CardHeader>
                <CardFooter className="p-6 pt-0">
                  <Link href="/equipment" className="w-full">
                    <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white transition-all duration-300 hover:shadow-lg relative overflow-hidden group">
                      <span className="relative z-10">View Equipment</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="group relative overflow-hidden border-0 bg-gray-50/50 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-white">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="flex-col items-center text-center space-y-4 p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md group-hover:shadow-lg transition-shadow duration-300">
                    <CalendarDays className="h-8 w-8 text-gray-700" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-lg font-semibold text-gray-900">Booking</CardTitle>
                    <CardDescription className="text-gray-600">Schedule equipment usage</CardDescription>
                  </div>
                </CardHeader>
                <CardFooter className="p-6 pt-0">
                  <Link href="/booking" className="w-full">
                    <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white transition-all duration-300 hover:shadow-lg relative overflow-hidden group">
                      <span className="relative z-10">Book Now</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="group relative overflow-hidden border-0 bg-gray-50/50 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-white">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="flex-col items-center text-center space-y-4 p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md group-hover:shadow-lg transition-shadow duration-300">
                    <ClipboardList className="h-8 w-8 text-gray-700" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-lg font-semibold text-gray-900">My Bookings</CardTitle>
                    <CardDescription className="text-gray-600">Manage your reservations</CardDescription>
                  </div>
                </CardHeader>
                <CardFooter className="p-6 pt-0">
                  <Link href="/my-bookings" className="w-full">
                    <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white transition-all duration-300 hover:shadow-lg relative overflow-hidden group">
                      <span className="relative z-10">View Bookings</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="group relative overflow-hidden border-0 bg-gray-50/50 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-white">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="flex-col items-center text-center space-y-4 p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md group-hover:shadow-lg transition-shadow duration-300">
                    <Users className="h-8 w-8 text-gray-700" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-lg font-semibold text-gray-900">Guidelines</CardTitle>
                    <CardDescription className="text-gray-600">Usage policies and SOPs</CardDescription>
                  </div>
                </CardHeader>
                <CardFooter className="p-6 pt-0">
                  <Link href="/guidelines" className="w-full">
                    <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white transition-all duration-300 hover:shadow-lg relative overflow-hidden group">
                      <span className="relative z-10">View Guidelines</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* About Section */}
          <div className="mx-auto max-w-4xl">
            <div className="space-y-8">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-white rounded-full animate-[breathing_4s_ease-in-out_infinite] opacity-20" />
                  <div className="relative bg-white rounded-full p-6 shadow-lg animate-[breathing_4s_ease-in-out_infinite]">
                    <img
                      src="/images/dbt-logo.png"
                      alt="Department of Biotechnology"
                      className="w-20 h-20 md:w-24 md:h-24 object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                  About DBT BUILDER Project
                </h2>
                <div className="max-w-3xl mx-auto">
                  <p className="text-lg text-gray-600 leading-relaxed">
                    The DBT BUILDER project provides advanced research equipment for faculty, researchers, and students
                    at Central University of Rajasthan. This booking system ensures systematic, fair, and efficient use
                    of this valuable research equipment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes breathing {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}
