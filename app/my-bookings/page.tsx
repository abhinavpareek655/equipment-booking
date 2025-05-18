"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Calendar, Clock, MapPin } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Mock data for bookings
const bookings = [
  {
    id: 1,
    equipment: "Flow Cytometer",
    date: "2025-05-20",
    timeSlot: "10:00 - 11:00",
    location: "Lab 101",
    status: "Approved",
    purpose: "Cell sorting for cancer research project",
  },
  {
    id: 2,
    equipment: "PCR Thermal Cycler",
    date: "2025-05-22",
    timeSlot: "14:00 - 15:00",
    location: "Lab 103",
    status: "Pending",
    purpose: "DNA amplification for genomic analysis",
  },
  {
    id: 3,
    equipment: "HPLC System",
    date: "2025-05-25",
    timeSlot: "09:00 - 10:00",
    location: "Lab 106",
    status: "Rejected",
    reason: "Equipment scheduled for maintenance",
    purpose: "Protein purification",
  },
  {
    id: 4,
    equipment: "Ultra-centrifuge",
    date: "2025-05-18",
    timeSlot: "11:00 - 12:00",
    location: "Lab 104",
    status: "Completed",
    purpose: "Membrane isolation",
  },
]

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming")

  // Filter bookings based on tab
  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "upcoming") {
      return booking.status === "Approved" || booking.status === "Pending"
    } else if (activeTab === "completed") {
      return booking.status === "Completed"
    } else if (activeTab === "rejected") {
      return booking.status === "Rejected"
    }
    return true // All bookings tab
  })

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

      <Tabs defaultValue="upcoming" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredBookings.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No bookings found</AlertTitle>
              <AlertDescription>You don't have any {activeTab} bookings at the moment.</AlertDescription>
            </Alert>
          ) : (
            filteredBookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{booking.equipment}</CardTitle>
                      <CardDescription>Booking #{booking.id}</CardDescription>
                    </div>
                    <Badge
                      variant={
                        booking.status === "Approved"
                          ? "default"
                          : booking.status === "Pending"
                            ? "secondary"
                            : booking.status === "Completed"
                              ? "outline"
                              : "destructive"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                      <span>{new Date(booking.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-gray-500" />
                      <span>{booking.timeSlot}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                      <span>{booking.location}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">Purpose:</h4>
                    <p className="text-sm text-gray-600">{booking.purpose}</p>
                  </div>

                  {booking.status === "Rejected" && booking.reason && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Rejection Reason</AlertTitle>
                      <AlertDescription>{booking.reason}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  {booking.status === "Pending" && (
                    <Button variant="destructive" size="sm">
                      Cancel Request
                    </Button>
                  )}
                  {booking.status === "Approved" && (
                    <>
                      <Button variant="destructive" size="sm">
                        Cancel Booking
                      </Button>
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                    </>
                  )}
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
