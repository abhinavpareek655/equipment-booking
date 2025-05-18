import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const equipment = [
  {
    id: 1,
    name: "Flow Cytometer",
    category: "Cell Analysis",
    location: "Lab 101",
    availability: "Available",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 2,
    name: "Confocal Microscope",
    category: "Microscopy",
    location: "Lab 102",
    availability: "Maintenance",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 3,
    name: "PCR Thermal Cycler",
    category: "Molecular Biology",
    location: "Lab 103",
    availability: "Available",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 4,
    name: "Ultra-centrifuge",
    category: "Separation",
    location: "Lab 104",
    availability: "Available",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 5,
    name: "Mass Spectrometer",
    category: "Analysis",
    location: "Lab 105",
    availability: "Reserved",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 6,
    name: "HPLC System",
    category: "Chromatography",
    location: "Lab 106",
    availability: "Available",
    image: "/placeholder.svg?height=200&width=200",
  },
]

export default function EquipmentPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Equipment Catalog</h1>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="search">Search Equipment</Label>
          <Input id="search" placeholder="Search by name..." />
        </div>
        <div>
          <Label htmlFor="category">Filter by Category</Label>
          <Select>
            <SelectTrigger id="category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="microscopy">Microscopy</SelectItem>
              <SelectItem value="molecular">Molecular Biology</SelectItem>
              <SelectItem value="separation">Separation</SelectItem>
              <SelectItem value="analysis">Analysis</SelectItem>
              <SelectItem value="chromatography">Chromatography</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="availability">Filter by Availability</Label>
          <Select>
            <SelectTrigger id="availability">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="maintenance">Under Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {equipment.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="aspect-video w-full">
              <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{item.name}</CardTitle>
                <Badge
                  variant={
                    item.availability === "Available"
                      ? "default"
                      : item.availability === "Reserved"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {item.availability}
                </Badge>
              </div>
              <CardDescription>{item.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Location: {item.location}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">View Details</Button>
              <Link href={`/booking?equipment=${item.id}`} passHref>
                <Button disabled={item.availability !== "Available"}>Book Now</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
