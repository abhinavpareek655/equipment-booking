"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Settings2, AlertCircle, CalendarRange, History, Info } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useEffect } from "react"

type EquipmentItem = {
  id: string
  name: string
  model: string
  category: string
  location: string
  status: string
  lastMaintenance: string
  nextMaintenance: string
  description: string
}

// Maintenance history mock data
const maintenanceHistory = [
  {
    id: 1,
    equipmentId: "682a33140458651e2f380ea3",
    date: "2025-04-10",
    type: "Scheduled",
    technician: "Raj Kumar",
    notes: "Laser alignment and fluidics system cleaning",
  },
  {
    id: 2,
    equipmentId: "682a33140458651e2f380ea3",
    date: "2025-02-15",
    type: "Scheduled",
    technician: "Raj Kumar",
    notes: "Filter replacement and calibration",
  },
  {
    id: 3,
    equipmentId: "682a33140458651e2f380ea4",
    date: "2025-05-01",
    type: "Repair",
    technician: "Suresh Patel",
    notes: "Laser module replacement due to failure",
  },
  {
    id: 4,
    equipmentId: "682a33140458651e2f380ea5",
    date: "2025-03-15",
    type: "Scheduled",
    technician: "Anita Singh",
    notes: "Calibration and software update",
  },
]

export default function EquipmentManagementPage() {
  const [activeTab, setActiveTab] = useState("inventory")
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null)
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]) 
  
  const handleMaintenanceRequest = (equipmentId: string) => {
    setSelectedEquipment(equipmentId)
    // In a real application, you would open a maintenance request dialog
    alert(`Maintenance request submitted for equipment ID: ${equipmentId}`)
  }

  useEffect(() => {
    console.log("📦 Fetching equipment from /api/equipment")
    fetch("/api/equipment")
      .then(async (res) => {
        const text = await res.text()
        console.log("📄 Raw response:", text)
        if (!res.ok) throw new Error(`❌ Status ${res.status}`)
        return JSON.parse(text)
      })
      .then((data) => {
        const mapped = data.map((item: any) => ({
          id: item._id,
          name: item.name,
          model: item.model || "Unknown",
          category: item.category || "Uncategorized",
          location: item.location || "N/A",
          status: item.status || "Unknown",
          lastMaintenance: item.lastMaintenance || new Date().toISOString(),
          nextMaintenance: item.nextMaintenance || new Date().toISOString(),
          description: item.description || "No description",
        }))
        setEquipment(mapped)
      })
      .catch((err) => console.error("🚨 Fetch error:", err))
  }, [])

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Equipment Management</h1>
      <p className="text-gray-500 mb-8">Manage equipment inventory, maintenance schedules, and status</p>

      <Tabs defaultValue="inventory" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inventory">Equipment Inventory</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Equipment Inventory</h2>
              <p className="text-gray-500">Manage all DBT BUILDER equipment</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Equipment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Equipment</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new equipment to add it to the inventory.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Equipment Name</Label>
                      <Input id="name" placeholder="Enter equipment name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input id="model" placeholder="Enter model number" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="microscopy">Microscopy</SelectItem>
                          <SelectItem value="molecular">Molecular Biology</SelectItem>
                          <SelectItem value="separation">Separation</SelectItem>
                          <SelectItem value="analysis">Analysis</SelectItem>
                          <SelectItem value="chromatography">Chromatography</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" placeholder="Enter location (e.g., Lab 101)" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Enter equipment description" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Equipment</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {equipment.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{item.name}</CardTitle>
                      <CardDescription>{item.model}</CardDescription>
                    </div>
                    <Badge
                      variant={
                        item.status === "Available"
                          ? "default"
                          : item.status === "Reserved"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <Label className="text-xs text-gray-500">Category</Label>
                      <p className="text-sm">{item.category}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Location</Label>
                      <p className="text-sm">{item.location}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Last Maintenance</Label>
                      <p className="text-sm">{new Date(item.lastMaintenance).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Next Maintenance</Label>
                      <p className="text-sm">{new Date(item.nextMaintenance).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Description</Label>
                    <p className="text-sm">{item.description}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Info className="mr-1 h-4 w-4" /> Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>{item.name}</DialogTitle>
                        <DialogDescription>{item.model}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-gray-500">Category</Label>
                            <p>{item.category}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Location</Label>
                            <p>{item.location}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Status</Label>
                            <Badge
                              variant={
                                item.status === "Available"
                                  ? "default"
                                  : item.status === "Reserved"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {item.status}
                            </Badge>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Next Maintenance</Label>
                            <p>{new Date(item.nextMaintenance).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500">Description</Label>
                          <p>{item.description}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold mb-2">Maintenance History</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Technician</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {maintenanceHistory
                                .filter((mh) => mh.equipmentId === item.id)
                                .map((history) => (
                                  <TableRow key={history.id}>
                                    <TableCell>{new Date(history.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{history.type}</TableCell>
                                    <TableCell>{history.technician}</TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleMaintenanceRequest(item.id)}>
                      <Settings2 className="mr-1 h-4 w-4" /> Maintenance
                    </Button>
                    <Button variant="outline" size="sm">
                      <History className="mr-1 h-4 w-4" /> Usage Log
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Maintenance Schedule</h2>
              <p className="text-gray-500">Upcoming and past maintenance activities</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <CalendarRange className="mr-2 h-4 w-4" />
                  Schedule Maintenance
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Schedule Maintenance</DialogTitle>
                  <DialogDescription>Schedule maintenance for an equipment</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="equipment">Select Equipment</Label>
                    <Select>
                      <SelectTrigger id="equipment">
                        <SelectValue placeholder="Select equipment" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipment.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name} ({item.model})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Maintenance Date</Label>
                      <Input id="date" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Maintenance Type</Label>
                      <Select>
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled Maintenance</SelectItem>
                          <SelectItem value="repair">Repair</SelectItem>
                          <SelectItem value="calibration">Calibration</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="technician">Technician Name</Label>
                    <Input id="technician" placeholder="Enter technician name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" placeholder="Enter maintenance details" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Schedule</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Attention Required</AlertTitle>
                <AlertDescription>
                  The Confocal Microscope is currently under maintenance until May 20, 2025.
                </AlertDescription>
              </Alert>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Flow Cytometer</TableCell>
                    <TableCell>BD FACSCanto II</TableCell>
                    <TableCell>Scheduled</TableCell>
                    <TableCell>June 10, 2025</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>PCR Thermal Cycler</TableCell>
                    <TableCell>Bio-Rad CFX96</TableCell>
                    <TableCell>Calibration</TableCell>
                    <TableCell>June 15, 2025</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Ultra-centrifuge</TableCell>
                    <TableCell>Beckman Coulter Optima XPN</TableCell>
                    <TableCell>Scheduled</TableCell>
                    <TableCell>July 22, 2025</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceHistory.map((history) => {
                    const equipmentInfo = equipment.find((e) => e.id === history.equipmentId)
                    return (
                      <TableRow key={history.id}>
                        <TableCell>{equipmentInfo?.name}</TableCell>
                        <TableCell>{new Date(history.date).toLocaleDateString()}</TableCell>
                        <TableCell>{history.type}</TableCell>
                        <TableCell>{history.technician}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{history.notes}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
