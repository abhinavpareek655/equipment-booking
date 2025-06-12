"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Settings, Users, Calendar, BarChart3, Search, Edit, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// TypeScript interface matching the Equipment model
interface Equipment {
  id: number
  name: string
  department: string
  category: string
  location: string
  status: string
  description?: string
  contact?: string
  imageUrl?: string
  totalHours?: number
  maintenanceHours?: number
  uptime?: string
  admins: { id: number; name: string; email: string }[]
}

// Mock data for equipment
const equipmentList: Equipment[] = [
  {
    id: 1,
    name: "Flow Cytometer",
    department: "BD FACSCanto II",
    category: "Cell Analysis",
    location: "Lab 101",
    status: "Available",
    admins: [
      { id: 1, name: "Dr. Anjali Patel", email: "anjali.patel@curaj.ac.in" },
      { id: 2, name: "Dr. Vikram Mehra", email: "vikram.mehra@curaj.ac.in" },
    ],
  },
  {
    id: 2,
    name: "Confocal Microscope",
    department: "Zeiss LSM 880",
    category: "Microscopy",
    location: "Lab 102",
    status: "Maintenance",
    admins: [{ id: 3, name: "Dr. Rajesh Malhotra", email: "rajesh.malhotra@curaj.ac.in" }],
  },
  {
    id: 3,
    name: "PCR Thermal Cycler",
    department: "Bio-Rad CFX96",
    category: "Molecular Biology",
    location: "Lab 103",
    status: "Available",
    admins: [
      { id: 2, name: "Dr. Vikram Mehra", email: "vikram.mehra@curaj.ac.in" },
      { id: 4, name: "Dr. Shobha Rao", email: "shobha.rao@curaj.ac.in" },
    ],
  },
  {
    id: 4,
    name: "Ultra-centrifuge",
    department: "Beckman Coulter Optima XPN",
    category: "Separation",
    location: "Lab 104",
    status: "Available",
    admins: [{ id: 1, name: "Dr. Anjali Patel", email: "anjali.patel@curaj.ac.in" }],
  },
  {
    id: 5,
    name: "Mass Spectrometer",
    department: "Thermo Scientific Q Exactive",
    category: "Analysis",
    location: "Lab 105",
    status: "Available",
    admins: [{ id: 5, name: "Dr. Sanjay Kumar", email: "sanjay.kumar@curaj.ac.in" }],
  },
  {
    id: 6,
    name: "HPLC System",
    department: "Agilent 1260 Infinity II",
    category: "Chromatography",
    location: "Lab 106",
    status: "Available",
    admins: [
      { id: 4, name: "Dr. Shobha Rao", email: "shobha.rao@curaj.ac.in" },
      { id: 5, name: "Dr. Sanjay Kumar", email: "sanjay.kumar@curaj.ac.in" },
    ],
  },
]

// Mock data for all faculty/staff who can be admins
const allPotentialAdmins = [
  { id: 1, name: "Dr. Anjali Patel", email: "anjali.patel@curaj.ac.in", department: "Biochemistry" },
  { id: 2, name: "Dr. Vikram Mehra", email: "vikram.mehra@curaj.ac.in", department: "Molecular Biology" },
  { id: 3, name: "Dr. Rajesh Malhotra", email: "rajesh.malhotra@curaj.ac.in", department: "Genetics" },
  { id: 4, name: "Dr. Shobha Rao", email: "shobha.rao@curaj.ac.in", department: "Microbiology" },
  { id: 5, name: "Dr. Sanjay Kumar", email: "sanjay.kumar@curaj.ac.in", department: "Biotechnology" },
  { id: 6, name: "Dr. Priya Singh", email: "priya.singh@curaj.ac.in", department: "Biochemistry" },
  { id: 7, name: "Dr. Rahul Sharma", email: "rahul.sharma@curaj.ac.in", department: "Molecular Biology" },
  { id: 8, name: "Dr. Neha Gupta", email: "neha.gupta@curaj.ac.in", department: "Genetics" },
]

export default function SuperAdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("equipment")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddEquipmentDialog, setShowAddEquipmentDialog] = useState(false)
  const [showEditEquipmentDialog, setShowEditEquipmentDialog] = useState(false)
  const [showAssignAdminsDialog, setShowAssignAdminsDialog] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null)
  const [selectedAdmins, setSelectedAdmins] = useState<any[]>([])
  const [adminSearchOpen, setAdminSearchOpen] = useState(false)

  // New equipment form state
  const [newEquipment, setNewEquipment] = useState({
    name: "",
    department: "",
    category: "",
    location: "",
    description: "",
  })

  // Filter equipment based on search term
  const filteredEquipment = equipmentList.filter(
    (equipment) =>
      equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddEquipment = () => {
    // In a real app, you would send this to your backend
    console.log("Adding new equipment:", newEquipment)
    setShowAddEquipmentDialog(false)
    // Reset form
    setNewEquipment({
      name: "",
      department: "",
      category: "",
      location: "",
      description: "",
    })
  }

  const handleEditEquipment = (equipment: any) => {
    setSelectedEquipment(equipment)
    setShowEditEquipmentDialog(true)
  }

  const handleAssignAdmins = (equipment: any) => {
    setSelectedEquipment(equipment)
    setSelectedAdmins(equipment.admins || [])
    setShowAssignAdminsDialog(true)
  }

  const handleSaveAdmins = () => {
    // In a real app, you would send this to your backend
    console.log("Saving admins for equipment:", selectedEquipment?.id, selectedAdmins)
    setShowAssignAdminsDialog(false)
  }

  const toggleAdmin = (admin: any) => {
    if (selectedAdmins.some((a) => a.id === admin.id)) {
      setSelectedAdmins(selectedAdmins.filter((a) => a.id !== admin.id))
    } else {
      // Only allow up to 2 admins
      if (selectedAdmins.length < 2) {
        setSelectedAdmins([...selectedAdmins, admin])
      }
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Super Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Manage equipment, assign admins, and monitor system usage</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Total Equipment</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="text-3xl font-bold">{equipmentList.length}</div>
            <p className="text-sm text-gray-500">Registered equipment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Active Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{allPotentialAdmins.length}</div>
            <p className="text-sm text-gray-500">Equipment administrators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">42</div>
            <p className="text-sm text-gray-500">Registered researchers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Monthly Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">128</div>
            <p className="text-sm text-gray-500">Bookings this month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="equipment" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="equipment">
            <Settings className="h-4 w-4 mr-2" />
            Equipment
          </TabsTrigger>
          <TabsTrigger value="admins">
            <Users className="h-4 w-4 mr-2" />
            Admins
          </TabsTrigger>
          <TabsTrigger value="bookings">
            <Calendar className="h-4 w-4 mr-2" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="reports">
            <BarChart3 className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equipment" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search equipment..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={showAddEquipmentDialog} onOpenChange={setShowAddEquipmentDialog}>
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
                    Enter the details of the new equipment to add it to the system.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Equipment Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter equipment name"
                        value={newEquipment.name}
                        onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        placeholder="Enter department"
                        value={newEquipment.department}
                        onChange={(e) => setNewEquipment({ ...newEquipment, department: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newEquipment.category}
                        onValueChange={(value) => setNewEquipment({ ...newEquipment, category: value })}
                      >
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
                      <Input
                        id="location"
                        placeholder="Enter location (e.g., Lab 101)"
                        value={newEquipment.location}
                        onChange={(e) => setNewEquipment({ ...newEquipment, location: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter equipment description"
                      value={newEquipment.description}
                      onChange={(e) => setNewEquipment({ ...newEquipment, description: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddEquipmentDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEquipment}>Add Equipment</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admins</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.map((equipment) => (
                  <TableRow key={equipment.id}>
                    <TableCell className="font-medium">{equipment.name}</TableCell>
                    <TableCell>{equipment.department}</TableCell>
                    <TableCell>{equipment.category}</TableCell>
                    <TableCell>{equipment.location}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          equipment.status === "Available"
                            ? "default"
                            : equipment.status === "Reserved"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {equipment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                        {equipment.admins.map((admin, index) => (
                          <Avatar key={admin.id} className="h-8 w-8 border-2 border-background">
                            <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ))}
                        {equipment.admins.length === 0 && (
                          <span className="text-sm text-gray-500">No admins assigned</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditEquipment(equipment)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleAssignAdmins(equipment)}>
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEquipment.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No equipment found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Assigned Equipment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allPotentialAdmins.map((admin) => {
                  const assignedEquipment = equipmentList.filter((equipment) =>
                    equipment.admins.some((a) => a.id === admin.id),
                  )

                  return (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {admin.name}
                        </div>
                      </TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>{admin.department}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {assignedEquipment.map((equipment) => (
                            <Badge key={equipment.id} variant="outline" className="mr-1">
                              {equipment.name}
                            </Badge>
                          ))}
                          {assignedEquipment.length === 0 && (
                            <span className="text-sm text-gray-500">No equipment assigned</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          Manage Access
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Booking Overview</CardTitle>
              <CardDescription>System-wide booking statistics and management</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">This section will display booking statistics and management tools.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>System Reports</CardTitle>
              <CardDescription>Generate and view system-wide reports</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">This section will provide reporting and analytics tools.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Equipment Dialog */}
      <Dialog open={showEditEquipmentDialog} onOpenChange={setShowEditEquipmentDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Equipment</DialogTitle>
            <DialogDescription>Update the details of {selectedEquipment?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Equipment Name</Label>
                <Input id="edit-name" defaultValue={selectedEquipment?.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Input id="edit-department" defaultValue={selectedEquipment?.department} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select defaultValue={selectedEquipment?.category}>
                  <SelectTrigger id="edit-category">
                    <SelectValue />
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
                <Label htmlFor="edit-location">Location</Label>
                <Input id="edit-location" defaultValue={selectedEquipment?.location} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select defaultValue={selectedEquipment?.status}>
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Reserved">Reserved</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditEquipmentDialog(false)}>
              Cancel
            </Button>
            <Button>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Admins Dialog */}
      <Dialog open={showAssignAdminsDialog} onOpenChange={setShowAssignAdminsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Assign Administrators</DialogTitle>
            <DialogDescription>Assign up to 2 administrators for {selectedEquipment?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium">Current Administrators</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedAdmins.length > 0 ? (
                  selectedAdmins.map((admin) => (
                    <div key={admin.id} className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{admin.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 rounded-full"
                        onClick={() => toggleAdmin(admin)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No administrators assigned</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Add Administrators</Label>
              <p className="text-sm text-gray-500 mb-2">
                {selectedAdmins.length >= 2
                  ? "Maximum of 2 administrators reached"
                  : `Select up to ${2 - selectedAdmins.length} more administrator(s)`}
              </p>

              <Popover open={adminSearchOpen} onOpenChange={setAdminSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={adminSearchOpen}
                    className="w-full justify-between"
                    disabled={selectedAdmins.length >= 2}
                  >
                    Search for administrators...
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search administrators..." />
                    <CommandList>
                      <CommandEmpty>No administrators found.</CommandEmpty>
                      <CommandGroup>
                        {allPotentialAdmins
                          .filter((admin) => !selectedAdmins.some((a) => a.id === admin.id))
                          .map((admin) => (
                            <CommandItem
                              key={admin.id}
                              onSelect={() => {
                                toggleAdmin(admin)
                                setAdminSearchOpen(false)
                              }}
                            >
                              <div className="flex items-center">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{admin.name}</p>
                                  <p className="text-xs text-gray-500">{admin.department}</p>
                                </div>
                              </div>
                              <CheckIcon
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  selectedAdmins.some((a) => a.id === admin.id) ? "opacity-100" : "opacity-0",
                                )}
                              />
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignAdminsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAdmins}>Save Administrators</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
