import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, ClipboardList, Database, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Equipment Booking System
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
            Central University of Rajasthan - School of Life Sciences
          </p>
        </div>
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="flex flex-col items-center bg-gray-50 justify-between shadow-lg">
              <CardHeader className="flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white mb-2">
                  <Database className="h-10 w-10 text-gray-600" />
                </div>
                <CardTitle>Equipment</CardTitle>
                <CardDescription>Browse available equipment</CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href="/equipment" passHref>
                  <Button className="w-full">View Equipment</Button>
                </Link>
              </CardFooter>
            </Card>
            <Card className="flex flex-col items-center bg-gray-50 justify-between shadow-lg">
              <CardHeader className="flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white mb-2">
                  <CalendarDays className="h-10 w-10 text-gray-600" />
                </div>
                <CardTitle>Booking</CardTitle>
                <CardDescription>Schedule equipment usage</CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href="/booking" passHref>
                  <Button className="w-full">Book Now</Button>
                </Link>
              </CardFooter>
            </Card>
            <Card className="flex flex-col items-center bg-gray-50 justify-between shadow-lg">
              <CardHeader className="flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white mb-2">
                  <ClipboardList className="h-10 w-10 text-gray-600" />
                </div>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>Manage your reservations</CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href="/my-bookings" passHref>
                  <Button className="w-full">View Bookings</Button>
                </Link>
              </CardFooter>
            </Card>
            <Card className="flex flex-col items-center bg-gray-50 justify-between shadow-lg">
              <CardHeader className="flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white mb-2">
                  <Users className="h-10 w-10 text-gray-600" />
                </div>
                <CardTitle>Guidelines</CardTitle>
                <CardDescription>Usage policies and SOPs</CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href="/guidelines" passHref>
                  <Button className="w-full">View Guidelines</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
        <div className="mx-auto max-w-2xl mt-12 p-6 rounded-lg shadow-xl">
          <div className="flex items-center justify-center">
            <img
              src="/images/dbt-logo.png"
              alt="Department of Biotechnology"
              className="mb-4"
              width={100}
              height={100}
              style={{ flexShrink: 0 }}
            />            
          </div>
          <h2 className="text-xl font-bold mb-4">About DBT BUILDER Project</h2>
          <p className="text-gray-600">
            The DBT BUILDER project provides advanced research equipment for faculty, researchers, and students at Central University of Rajasthan. This booking system ensures systematic, fair, and
            efficient use of this valuable research equipment.
          </p>
        </div>
      </div>
    </div>
  )
}
