"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, FilterIcon, XCircle, CalendarIcon, User, History } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"

// Define TypeScript interfaces for our data
interface UserHistory {
  date: string
  equipment: string
  status: string
}

interface Booking {
  id: number
  user: string
  userEmail: string
  department: string
  supervisor: string
  equipment: string
  equipmentId: string
  date: string
  timeSlot: string
  duration: number
  purpose: string
  userHistory: UserHistory[]
  status?: string
  reason?: string
}


interface EquipmentInfo {
  id: string;
  name: string;
  location: string;
  category: string;
  totalHours: number;
  maintenanceHours: number;
  uptime: string;
}


const assignedInstruments: Instrument[] = [
  { id: 2, name: "Confocal Microscope" },
]
interface Instrument {
  id: number
  name: string
}


export default function AdminDashboardPage() {
  const [tab, setTab] = useState("pending")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [approvalDate, setApprovalDate] = useState<Date | undefined>(new Date())
  const [approvalStartTime, setApprovalStartTime] = useState<string>("")
  const [approvalDuration, setApprovalDuration] = useState<number>(1)
  const [rejectionReason, setRejectionReason] = useState<string>("")
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
  const [showUserHistoryDialog, setShowUserHistoryDialog] = useState(false)
  const [filterInstrument, setFilterInstrument] = useState("all")
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([])
  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [equipmentStats, setEquipmentStats] = useState<EquipmentInfo[]>([])

  useEffect(() => {
    Promise.all([
      fetch("/api/booking").then(res => res.json()),
      fetch("/api/equipment").then(res => res.json())
    ])
      .then(([bookings, equipmentList]) => {
        const equipmentMap = new Map<string, EquipmentInfo>(
          equipmentList.map((eq: any) => [
            eq._id,
            {
              id: eq._id,
              name: eq.name,
              location: eq.location,
              category: eq.category,
              totalHours: eq.totalHours ?? 0,
              maintenanceHours: eq.maintenanceHours ?? 0,
              uptime: eq.uptime ?? "--"
            }
          ])
        );

        const mapped = bookings.map((b: any) => {
          // handle populated vs. unpopulated equipmentId
          const equipmentIdStr =
            typeof b.equipmentId === "object"
              ? b.equipmentId._id
              : b.equipmentId;
          const equipmentInfo = equipmentMap.get(equipmentIdStr) || {
            id: "",
            name: "Unknown",
            location: "",
            category: "",
            totalHours: 0,
            maintenanceHours: 0,
            uptime: "--"
          };

          const startHour = parseInt(b.startTime.split(":")[0], 10);
          const endHour = startHour + b.duration;

          return {
            id: b._id,
            user: b.userEmail
              .split("@")[0]
              .replace(".", " ")
              .replace(/\b\w/g, (l: string) => l.toUpperCase()),
            userEmail: b.userEmail,
            department: b.department,
            supervisor: b.supervisor,
            equipment: equipmentInfo.name,
            equipmentId: equipmentIdStr,
            date: b.date,
            timeSlot: `${b.startTime} - ${endHour
              .toString()
              .padStart(2, "0")}:00`,
            duration: b.duration,
            purpose: b.purpose,
            status: b.status ?? "Pending",
            userHistory: []
          };
        });

        setAllBookings(mapped);
        setPendingBookings(
          mapped.filter((b: Booking) => (b.status ?? "").toLowerCase() === "pending")
        );
        setEquipmentStats(
          equipmentList.map((eq: any) => ({
            id: eq._id.toString(),
            name: eq.name,
            location: eq.location,
            category: eq.category,
            totalHours: eq.totalHours ?? 0,
            maintenanceHours: eq.maintenanceHours ?? 0,
            uptime: eq.uptime ?? "--"
          }))
        );
      })
      .catch(err =>
        console.error("Failed to fetch bookings or equipment:", err)
      );
    }, []);


  // Filter bookings based on assigned instruments
  const filteredPendingBookings = pendingBookings.filter(
    (booking) =>
      filterInstrument === "all" ||
      assignedInstruments.some((instrument) => instrument.id.toString() === booking.equipmentId),
  )

  const handleApprove = (booking: Booking) => {
    setSelectedBooking(booking)
    setApprovalDate(new Date(booking.date))
    setApprovalStartTime(booking.timeSlot.split(" - ")[0])
    setApprovalDuration(booking.duration)
    setShowApprovalDialog(true)
  }

  const handleReject = (booking: Booking) => {
    setSelectedBooking(booking)
    setRejectionReason("")
    setShowRejectionDialog(true)
  }

  const handleViewUserHistory = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowUserHistoryDialog(true)
  }

  const confirmApproval = async () => {
    if (!selectedBooking) return;
    console.debug("🛠️ confirmApproval called for booking:", selectedBooking);

    try {
      const payload = {
        status: "approved",
        date: approvalDate!.toISOString().slice(0, 10),
        startTime: approvalStartTime,
        duration: approvalDuration,
      };
      console.debug("📤 PATCH payload:", payload);

      const res = await fetch(`/api/booking/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.debug("📥 Response status:", res.status);

      if (!res.ok) {
        const err = await res.json();
        console.error("❌ Failed to approve booking:", err);
        return;
      }
      const updatedBooking = await res.json();
      console.debug("✅ Booking approved:", updatedBooking);

      // update local state
      setPendingBookings(prev =>
        prev.filter(b => b.id !== selectedBooking.id)
      );
      setAllBookings(prev =>
        prev.map(b =>
          b.id === selectedBooking.id ? { ...b, status: "Approved" } : b
        )
      );
    } catch (error) {
      console.error("❌ Error in confirmApproval:", error);
    } finally {
      setShowApprovalDialog(false);
    }
  };

  const confirmRejection = async () => {
    if (!selectedBooking) return;
    console.debug("🛠️ confirmRejection called for booking:", selectedBooking);

    try {
      const payload = {
        status: "rejected",
        reason: rejectionReason,
      };
      console.debug("📤 PATCH payload:", payload);

      const res = await fetch(`/api/booking/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.debug("📥 Response status:", res.status);

      if (!res.ok) {
        const err = await res.json();
        console.error("❌ Failed to reject booking:", err);
        return;
      }
      const updatedBooking = await res.json();
      console.debug("✅ Booking rejected:", updatedBooking);

      // update local state
      setPendingBookings(prev =>
        prev.filter(b => b.id !== selectedBooking.id)
      );
      setAllBookings(prev =>
        prev.map(b =>
          b.id === selectedBooking.id
            ? { ...b, status: "Rejected", reason: rejectionReason }
            : b
        )
      );
    } catch (error) {
      console.error("❌ Error in confirmRejection:", error);
    } finally {
      setShowRejectionDialog(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Manage equipment bookings and monitor usage</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredPendingBookings.length}</div>
            <p className="text-sm text-gray-500">Requests awaiting approval</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" onClick={() => setTab("pending")}>
              Review All
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Today's Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5</div>
            <p className="text-sm text-gray-500">Scheduled for today</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              View Schedule
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">My Assigned Instruments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{assignedInstruments.length}</div>
            <p className="text-sm text-gray-500">Instruments you manage</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              View Instruments
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Booking Requests</CardTitle>
              <CardDescription>Manage equipment booking requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending" className="space-y-4" onValueChange={setTab}>
                <TabsList>
                  <TabsTrigger value="pending">Pending ({filteredPendingBookings.length})</TabsTrigger>
                  <TabsTrigger value="all">All Bookings</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FilterIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Filter by:</span>
                      <Select defaultValue="all" value={filterInstrument} onValueChange={setFilterInstrument}>
                        <SelectTrigger className="h-8 w-[180px]">
                          <SelectValue placeholder="Equipment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Assigned Instruments</SelectItem>
                          {assignedInstruments.map((instrument) => (
                            <SelectItem key={instrument.id} value={instrument.id.toString()}>
                              {instrument.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {filteredPendingBookings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No pending requests for your assigned instruments
                    </div>
                  ) : (
                    filteredPendingBookings.map((booking) => (
                      <Card key={booking.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{booking.equipment}</CardTitle>
                              <CardDescription>Request #{booking.id}</CardDescription>
                            </div>
                            <Badge variant="secondary">{booking.status}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <div>
                                <Label className="text-xs text-gray-500">Requested by</Label>
                                <p className="text-sm">{booking.user}</p>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Department</Label>
                              <p className="text-sm">{booking.department}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Supervisor</Label>
                              <p className="text-sm">{booking.supervisor}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-gray-500" />
                              <div>
                                <Label className="text-xs text-gray-500">Date & Time</Label>
                                <p className="text-sm">
                                  {new Date(booking.date).toLocaleDateString()} | {booking.timeSlot}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <Label className="text-xs text-gray-500">Purpose</Label>
                            <p className="text-sm">{booking.purpose}</p>
                          </div>

                          <div className="mt-3 flex items-center">
                            <History className="h-4 w-4 text-gray-500 mr-1" />
                            <Label className="text-xs text-gray-500">User History:</Label>
                            <span className="text-xs ml-1">
                              {booking.userHistory.length === 0
                                ? "No previous bookings"
                                : `${booking.userHistory.length} previous bookings`}
                            </span>
                            {booking.userHistory.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-6 ml-1"
                                onClick={() => handleViewUserHistory(booking)}
                              >
                                View
                              </Button>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                          <Button variant="destructive" size="sm" onClick={() => handleReject(booking)}>
                            <XCircle className="mr-1 h-4 w-4" /> Reject
                          </Button>
                          <Button size="sm" onClick={() => handleApprove(booking)}>
                            <CheckCircle className="mr-1 h-4 w-4" /> Approve
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="all" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FilterIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Filter by:</span>
                      <Select defaultValue="all">
                        <SelectTrigger className="h-8 w-[180px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {allBookings.slice(0, 4).map((booking) => (
                    <Card key={booking.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{booking.equipment}</CardTitle>
                            <CardDescription>Request #{booking.id}</CardDescription>
                          </div>
                          <Badge
                            variant={
                              booking.status === "Pending"
                                ? "secondary"
                                : booking.status === "Approved"
                                  ? "default"
                                  : booking.status === "Completed"
                                    ? "outline"
                                    : "destructive"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <div>
                              <Label className="text-xs text-gray-500">Requested by</Label>
                              <p className="text-sm">{booking.user}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-gray-500" />
                            <div>
                              <Label className="text-xs text-gray-500">Date & Time</Label>
                              <p className="text-sm">
                                {new Date(booking.date).toLocaleDateString()} | {booking.timeSlot}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Equipment Usage</CardTitle>
              <CardDescription>Usage statistics for the current month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {equipmentStats
                  .filter((equipment) => assignedInstruments.some((instrument) => instrument.id.toString() === equipment.id))
                  .map((equipment, index, arr) => (
                    <div key={equipment.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{equipment.name}</span>
                        <span className="text-sm text-gray-500">{equipment.totalHours} hours</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{ width: `${(equipment.totalHours / 60) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Uptime: {equipment.uptime}</span>
                        <span>Maintenance: {equipment.maintenanceHours}h</span>
                      </div>
                      {index !== arr.length - 1 && <Separator className="my-3" />}
                    </div>
                  ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                View Full Report
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Approve Booking Request</DialogTitle>
            <DialogDescription>Set the final date and time for this booking</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>User</Label>
                <div className="flex items-center mt-1">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt={selectedBooking?.user} />
                    <AvatarFallback>{selectedBooking?.user?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{selectedBooking?.user}</p>
                    <p className="text-xs text-gray-500">{selectedBooking?.userEmail}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Equipment</Label>
                <p className="text-sm mt-1">{selectedBooking?.equipment}</p>
              </div>

              <div>
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !approvalDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {approvalDate ? format(approvalDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={approvalDate} onSelect={setApprovalDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Start Time</Label>
                <Select value={approvalStartTime} onValueChange={setApprovalStartTime}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">09:00</SelectItem>
                    <SelectItem value="10:00">10:00</SelectItem>
                    <SelectItem value="11:00">11:00</SelectItem>
                    <SelectItem value="12:00">12:00</SelectItem>
                    <SelectItem value="13:00">13:00</SelectItem>
                    <SelectItem value="14:00">14:00</SelectItem>
                    <SelectItem value="15:00">15:00</SelectItem>
                    <SelectItem value="16:00">16:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Duration (hours)</Label>
                <Select
                  value={approvalDuration.toString()}
                  onValueChange={(value) => setApprovalDuration(Number(value))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="1.5">1.5 hours</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="2.5">2.5 hours</SelectItem>
                    <SelectItem value="3">3 hours</SelectItem>
                    <SelectItem value="3.5">3.5 hours</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmApproval}>Approve Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reject Booking Request</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this booking request</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>User</Label>
              <div className="flex items-center mt-1">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt={selectedBooking?.user} />
                  <AvatarFallback>{selectedBooking?.user?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{selectedBooking?.user}</p>
                  <p className="text-xs text-gray-500">{selectedBooking?.userEmail}</p>
                </div>
              </div>
            </div>

            <div>
              <Label>Equipment</Label>
              <p className="text-sm mt-1">{selectedBooking?.equipment}</p>
            </div>

            <div>
              <Label htmlFor="reason">Reason for Rejection</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this booking is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRejection}>
              Reject Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User History Dialog */}
      <Dialog open={showUserHistoryDialog} onOpenChange={setShowUserHistoryDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>User Booking History</DialogTitle>
            <DialogDescription>Previous bookings for {selectedBooking?.user}</DialogDescription>
          </DialogHeader>
          <div>
            <div className="flex items-center mb-4">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt={selectedBooking?.user} />
                <AvatarFallback>{selectedBooking?.user?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedBooking?.user}</p>
                <p className="text-sm text-gray-500">{selectedBooking?.userEmail}</p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedBooking?.userHistory.map((history, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(history.date).toLocaleDateString()}</TableCell>
                    <TableCell>{history.equipment}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          history.status === "Completed"
                            ? "default"
                            : history.status === "Cancelled"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {history.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {selectedBooking?.userHistory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                      No booking history found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowUserHistoryDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
