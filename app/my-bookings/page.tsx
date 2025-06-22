"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Calendar, Clock, MapPin } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface Booking {
  id: string
  equipment: string
  equipmentId: string
  date: string
  startTime: string
  duration: number
  timeSlot: string
  location: string
  status: string
  purpose: string
  reason?: string
}

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const handleCancel = async (id: string) => {
    try {
      const res = await fetch(`/api/booking/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error(await res.text())
      setBookings((prev) => prev.filter((b) => b.id !== id))
      toast({ title: "Booking cancelled" })
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to cancel booking" })
    }
  }

  useEffect(() => {
    setLoading(true)
    fetch("/api/booking/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((b: any) => {
          const [startHour] = b.startTime.split(":").map(Number)
          const endHour = startHour + b.duration
          const status =
            b.status === "approved" && new Date(b.date) < new Date()
              ? "Completed"
              : b.status
          return {
            id: b.id,
            equipment: b.equipment,
            equipmentId: b.equipmentId,
            date: b.date,
            startTime: b.startTime,
            duration: b.duration,
            timeSlot: `${b.startTime} - ${endHour.toString().padStart(2, "0")}:00`,
            location: b.location || "N/A",
            status,
            purpose: b.purpose,
            reason: b.reason,
          }
        })
        setBookings(mapped)
      })
      .catch((err) => console.error("Failed to fetch bookings:", err))
      .finally(() => setLoading(false))
  }, [])

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "upcoming") {
      return booking.status === "approved" || booking.status === "pending"
    } else if (activeTab === "completed") {
      return booking.status === "Completed"
    } else if (activeTab === "rejected") {
      return booking.status === "rejected"
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
          <TabsTrigger value="rejected">rejected</TabsTrigger>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="h-4 w-32 rounded skeleton-shimmer" />
                      <div className="h-3 w-24 rounded skeleton-shimmer" />
                    </div>
                    <div className="h-4 w-16 rounded skeleton-shimmer" />
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full skeleton-shimmer" />
                      <div className="h-3 w-24 rounded skeleton-shimmer" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full skeleton-shimmer" />
                      <div className="h-3 w-24 rounded skeleton-shimmer" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full skeleton-shimmer" />
                      <div className="h-3 w-24 rounded skeleton-shimmer" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="h-3 w-20 rounded skeleton-shimmer" />
                    <div className="h-4 w-32 rounded skeleton-shimmer" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <div className="h-8 w-24 rounded skeleton-shimmer" />
                  <div className="h-8 w-24 rounded skeleton-shimmer" />
                </CardFooter>
              </Card>
            ))
          ) : filteredBookings.length === 0 ? (
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
                        booking.status === "approved"
                          ? "default"
                          : booking.status === "pending"
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

                  {booking.status === "rejected" && booking.reason && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Rejection Reason</AlertTitle>
                      <AlertDescription>{booking.reason}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  {booking.status === "pending" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancel(booking.id)}
                    >
                      Cancel Request
                    </Button>
                  )}
                  {booking.status === "approved" && (
                    <>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancel(booking.id)}
                      >
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
