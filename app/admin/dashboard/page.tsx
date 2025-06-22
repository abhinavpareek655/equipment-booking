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
import { isSameDay, isToday, parse } from "date-fns";

// Define TypeScript interfaces for our data
interface UserHistory {
  date: string
  equipment: string
  status: string
  timeSlot: string
}

interface Booking {
  id: string
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
  lastUsed?: string | null
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


interface Instrument {
  id: string
  name: string
  location?: string
  category?: string
}


export default function AdminDashboardPage() {
  const [tab, setTab] = useState("pending")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [approvalDate, setApprovalDate] = useState<Date | null>(new Date())
  const [approvalStartTime, setApprovalStartTime] = useState<string>("")
  const [approvalDuration, setApprovalDuration] = useState<number>(1)
  const [rejectionReason, setRejectionReason] = useState<string>("")
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
  const [showUserHistoryDialog, setShowUserHistoryDialog] = useState(false)
  const [filterInstrument, setFilterInstrument] = useState("all")
  const [pendingBookings, setpendingBookings] = useState<Booking[]>([])
  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [equipmentStats, setEquipmentStats] = useState<EquipmentInfo[]>([])
  const [bookedSlotsByDate, setBookedSlotsByDate] = useState<{ [equipmentId: string]: { [date: string]: string[] } }>({});
  const [slotLoading, setSlotLoading] = useState(false);
  const [assignedEquipment, setAssignedEquipment] = useState<Instrument[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
  setLoading(true);
  Promise.all([
    fetch("/api/admin/bookings").then((res) => res.json()),
    fetch("/api/equipment").then((res) => res.json()),
    fetch("/api/admin/me").then((res) => res.json()),
  ])
    .then(([bookings, equipmentList, adminInfo]: [any[], any[], any]) => {
      const mapped = bookings.map((b) => {
        const [startHour] = b.startTime.split(":").map(Number);
        const endHour = startHour + b.duration;

        return {
          id:           b.id,
          user:         b.userName,
          userEmail:    b.userEmail,
          department:   b.department,
          supervisor:   b.supervisor,
          equipment:    b.equipment,
          equipmentId:  b.equipmentId ?? "",
          date:         b.date,
          startTime:    b.startTime, // Save raw startTime for later lookup
          timeSlot:     `${b.startTime} - ${endHour.toString().padStart(2, "0")}:00`,
          duration:     b.duration,
          purpose:      b.purpose,
          status:       b.status,
          userHistory:  b.userHistory ?? [],
          lastUsed:     b.lastUsed ?? null,
        };
      });

      setAllBookings(mapped);
      setpendingBookings(mapped.filter((b) => b.status === "pending"));

      setAssignedEquipment(
        (adminInfo.equipment || []).map((eq: any) => ({
          id: eq.id,
          name: eq.name,
          location: eq.location,
          category: eq.category,
        }))
      );

      // Collect all booked slots by equipmentId and date
      const slots: { [equipmentId: string]: { [date: string]: string[] } } = {};
      mapped.forEach((b) => {
        if (b.status !== "approved") return;
        if (!slots[b.equipmentId]) slots[b.equipmentId] = {};
        if (!slots[b.equipmentId][b.date]) slots[b.equipmentId][b.date] = [];

        // push the start time and subsequent slots based on duration
        const [startHour] = b.startTime.split(":").map(Number);
        for (let i = 0; i < Math.ceil(b.duration); i++) {
          const slotHour = startHour + i;
          const slot = `${slotHour.toString().padStart(2, "0")}:00`;
          if (!slots[b.equipmentId][b.date].includes(slot)) {
            slots[b.equipmentId][b.date].push(slot);
          }
        }
      });
      setBookedSlotsByDate(slots);

      setEquipmentStats(
        equipmentList.map((eq) => ({
          id:               eq._id.toString(),
          name:             eq.name,
          location:         eq.location,
          category:         eq.category,
          totalHours:       eq.totalHours ?? 0,
          maintenanceHours: eq.maintenanceHours ?? 0,
          uptime:           eq.uptime ?? "--",
        }))
      );
    })
    .catch((err) => console.error("Failed to fetch bookings or equipment:", err))
    .finally(() => setLoading(false));
}, []);


  // Filter bookings based on assigned equipment
  const filteredpendingBookings = pendingBookings.filter(
    (booking) =>
      filterInstrument === "all" ||
      assignedEquipment.some((instrument) => instrument.id.toString() === booking.equipmentId),
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

  const fetchLatestBookingsAndEquipment = async () => {
    setLoading(true);
    try {
      const [bookingsRes, equipmentRes, adminRes] = await Promise.all([
        fetch("/api/admin/bookings"),
        fetch("/api/equipment"),
        fetch("/api/admin/me"),
      ]);
      const bookings = await bookingsRes.json();
      const equipmentList = await equipmentRes.json();
      const adminInfo = await adminRes.json();

      const mapped = bookings.map((b: any) => {
        const [startHour] = b.startTime.split(":").map(Number);
        const endHour = startHour + b.duration;

        return {
          id:           b.id,
          user:         b.userName,
          userEmail:    b.userEmail,
          department:   b.department,
          supervisor:   b.supervisor,
          equipment:    b.equipment,
          equipmentId:  b.equipmentId ?? "",
          date:         b.date,
          startTime:    b.startTime,
          timeSlot:     `${b.startTime} - ${endHour.toString().padStart(2, "0")}:00`,
          duration:     b.duration,
          purpose:      b.purpose,
          status:       b.status,
          userHistory:  b.userHistory ?? [],
          lastUsed:     b.lastUsed ?? null,
        };
      });

      setAllBookings(mapped);
      setpendingBookings(mapped.filter((b: any) => b.status === "pending"));

      setAssignedEquipment(
        (adminInfo.equipment || []).map((eq: any) => ({
          id: eq.id,
          name: eq.name,
          location: eq.location,
          category: eq.category,
        }))
      );

      // Collect all booked slots by equipmentId and date
      const slots: { [equipmentId: string]: { [date: string]: string[] } } = {};
      mapped.forEach((b: any) => {
        if (b.status !== "approved") return;
        if (!slots[b.equipmentId]) slots[b.equipmentId] = {};
        if (!slots[b.equipmentId][b.date]) slots[b.equipmentId][b.date] = [];

        const [startHour] = b.startTime.split(":").map(Number);
        for (let i = 0; i < Math.ceil(b.duration); i++) {
          const slotHour = startHour + i;
          const slot = `${slotHour.toString().padStart(2, "0")}:00`;
          if (!slots[b.equipmentId][b.date].includes(slot)) {
            slots[b.equipmentId][b.date].push(slot);
          }
        }
      });
      setBookedSlotsByDate(slots);

      setEquipmentStats(
        equipmentList.map((eq: any) => ({
          id:               eq._id.toString(),
          name:             eq.name,
          location:         eq.location,
          category:         eq.category,
          totalHours:       eq.totalHours ?? 0,
          maintenanceHours: eq.maintenanceHours ?? 0,
          uptime:           eq.uptime ?? "--",
        }))
      );
    } catch (err) {
      console.error("Failed to fetch bookings or equipment:", err);
    } finally {
      setLoading(false);
    }
  };

  const confirmApproval = async () => {
    if (!selectedBooking) return;
    setLoading(true);
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

      await fetchLatestBookingsAndEquipment();

      // update local state
      setpendingBookings(prev =>
        prev.filter(b => b.id !== selectedBooking.id)
      );
      setAllBookings(prev =>
        prev.map(b =>
          b.id === selectedBooking.id ? { ...b, status: "approved" } : b
        )
      );
    } catch (error) {
      console.error("❌ Error in confirmApproval:", error);
      setLoading(false)
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
      setpendingBookings(prev =>
        prev.filter(b => b.id !== selectedBooking.id)
      );
      setAllBookings(prev =>
        prev.map(b =>
          b.id === selectedBooking.id
            ? { ...b, status: "rejected", reason: rejectionReason }
            : b
        )
      );
    } catch (error) {
      console.error("❌ Error in confirmRejection:", error);
    } finally {
      setShowRejectionDialog(false);
    }
  };
  const selectedEquipmentId = selectedBooking?.equipmentId ?? "";
  // Get already booked slots for the selected equipment and date
  const bookedSlots =
    approvalDate && selectedEquipmentId
      ? (bookedSlotsByDate[selectedEquipmentId]?.[format(approvalDate, "yyyy-MM-dd")] || [])
      : [];

  // Only disable slots for the selected equipment that are already booked or in the past (if today)
  const now = new Date();
  const isToday =
    approvalDate &&
    format(approvalDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");

  const allSlots = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00"];
  const disabledSlots = allSlots.filter((slot) => {
    // Disable if already booked for this equipment
    if (bookedSlots.includes(slot)) return true;
    // Disable if today and slot is before now
    if (isToday) {
      const [hour, minute] = slot.split(":").map(Number);
      if (hour < now.getHours() || (hour === now.getHours() && minute <= now.getMinutes())) {
        return true;
      }
    }
    return false;
  });

  // Disable dates before today in the calendar
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Only mark dates as fully booked if all slots for the selected equipment are booked
  const bookingsForEquip = bookedSlotsByDate[selectedEquipmentId] || {};
  const fullyBookedDates = Object.entries(bookingsForEquip)
    .filter(([_, slots]) => slots.length >= allSlots.length)
    .map(([dateStr]) => new Date(dateStr));

  // --- SHIMMER SKELETON UTILS ---
  // Use skeleton-shimmer and skeleton-avatar from global CSS for shimmer effect
  const Skeleton = ({ className = "", style = {}, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={`skeleton-shimmer ${className}`} style={style} {...props} />
  );
  const SkeletonAvatar = ({ className = "", style = {}, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={`skeleton-avatar ${className}`} style={style} {...props} />
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Manage equipment bookings and monitor usage</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div
                className="
                  w-5 h-5
                  border-2 border-gray-200
                  border-t-2 border-t-blue-600
                  rounded-full
                  animate-spin
                  mr-2
                "
              />
            ) : (
              <div className="text-3xl font-bold mr-2">
                {filteredpendingBookings.length}
              </div>
            )}
            <p className="text-sm text-gray-500">Requests awaiting approval</p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setTab("pending");
                // Scroll to the Booking Requests card
                const card = document.getElementById("booking-requests-card");
                if (card) {
                  card.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
            >
              Review All
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Today's Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div
                className="
                  w-5 h-5
                  border-2 border-gray-200
                  border-t-2 border-t-blue-600
                  rounded-full
                  animate-spin
                  mr-2
                "
              />
            ) : (
            <div className="text-3xl font-bold">
              {
                allBookings.filter(
                  (b) =>
                    new Date(b.date).toDateString() === new Date().toDateString()
                ).length
              }
            </div>
            )}
            <p className="text-sm text-gray-500">Scheduled for today</p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setTab("all");
                // Scroll to the Booking Requests card
                const card = document.getElementById("booking-requests-card");
                if (card) {
                  card.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
            >
              View Schedule
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">My Assigned Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            {assignedEquipment.length === 0 ? (
              <p className="text-sm text-gray-500">No equipment assigned</p>
            ) : (
              <ul className="text-sm space-y-1">
                {assignedEquipment.map((eq) => (
                  <li key={eq.id} className="flex justify-between">
                    <span>{eq.name}</span>
                    {eq.location && (
                      <span className="text-gray-500">{eq.location}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card id="booking-requests-card">
            <CardHeader>
              <CardTitle>Booking Requests</CardTitle>
              <CardDescription>Manage equipment booking requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending" className="space-y-4" onValueChange={setTab}>
                <TabsList>
                  <TabsTrigger value="pending">pending ({filteredpendingBookings.length})</TabsTrigger>
                  <TabsTrigger value="all">All Bookings</TabsTrigger>
                </TabsList>

                <TabsContent key="pending" value="pending" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FilterIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Filter by:</span>
                      <Select
                        defaultValue="all"
                        value={filterInstrument}
                        onValueChange={setFilterInstrument}
                      >
                        <SelectTrigger className="h-8 w-[180px]">
                          <SelectValue placeholder="Equipment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Assigned Equipment</SelectItem>
                          {assignedEquipment.map((instrument) => (
                            <SelectItem key={instrument.id} value={instrument.id.toString()}>
                              {instrument.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {loading ? (
                    // Skeleton loaders
                    [1, 2, 3, 4].map((i) => (
                      <Card key={i} className="overflow-hidden">
                        {/* Header skeleton */}
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
                          </div>
                        </CardHeader>

                        {/* Content skeleton */}
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse" />
                              <div className="space-y-1">
                                <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
                                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
                              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                            </div>
                            <div className="space-y-1">
                              <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
                              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse" />
                              <div className="space-y-1">
                                <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
                                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 space-y-1">
                            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                          </div>
                        </CardContent>

                        {/* Footer skeleton */}
                        <CardFooter className="flex justify-end gap-2">
                          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                        </CardFooter>
                      </Card>
                    ))
                  ) : filteredpendingBookings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No pending requests for your assigned equipment
                    </div>
                  ) : (
                    filteredpendingBookings.map((booking) => (
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
                                <p className="text-xs text-gray-500">{booking.userEmail}</p>
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
                            {booking.lastUsed && (
                              <span className="text-xs ml-2 text-gray-500">
                                Last used on {new Date(booking.lastUsed).toLocaleDateString()}
                              </span>
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
                <TabsContent key="all" value="all" className="space-y-4">
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
                          <SelectItem value="pending">pending</SelectItem>
                          <SelectItem value="approved">approved</SelectItem>
                          <SelectItem value="rejected">rejected</SelectItem>
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
                              booking.status === "pending"
                                ? "secondary"
                                : booking.status === "approved" || "approved"
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
                  .filter((equipment) => assignedEquipment.some((instrument) => instrument.id.toString() === equipment.id))
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
                    <Calendar
                      selected={approvalDate}
                      onChange={setApprovalDate}
                      minDate={new Date()}
                      excludeDates={fullyBookedDates}
                      placeholderText="Select a date"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Start Time</Label>
                <Select value={approvalStartTime} onValueChange={setApprovalStartTime}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                {loading ? (
                  <div className="space-y-2 p-2">
                    {allSlots.map((_, i) => (
                      <div key={i} className="h-8 rounded bg-gray-200 animate-pulse" />
                    ))}
                  </div>
                ) : (
                <SelectContent>
                  {allSlots.map((slot) => {
                    // build the slot’s DateTime
                    const slotDateTime = parse(
                      `${format(approvalDate || new Date(), "yyyy-MM-dd")} ${slot}`,
                      "yyyy-MM-dd HH:mm",
                      new Date()
                    );

                    // true if approvalDate is today AND the slot time has already passed
                    const isApprovalDateToday =
                      approvalDate != null &&
                      isSameDay(approvalDate, new Date());

                    const isPast = isApprovalDateToday && slotDateTime < new Date();

                    return (
                      <SelectItem
                        key={slot}
                        value={slot}
                        disabled={disabledSlots.includes(slot) || isPast}
                      >
                        {slot}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
                )}
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
            <Button
              onClick={confirmApproval}
              disabled={
              !approvalDate ||
              !approvalStartTime ||
              disabledSlots.includes(approvalStartTime) ||
              isDateDisabled(approvalDate)
              }
            >
              Approve Booking
            </Button>
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
                  <TableHead>Time Slot</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedBooking?.userHistory.map((history, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(history.date).toLocaleDateString()}</TableCell>
                    <TableCell>{history.timeSlot}</TableCell>
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
                    <TableCell colSpan={4} className="text-center py-4 text-gray-500">
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
