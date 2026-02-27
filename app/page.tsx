"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

type EquipmentItem = {
  id: string
  name: string
  category: string
  location: string
  availability: string
  image: string
}

export default function HomePage() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [availability, setAvailability] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()
  const itemsPerPage = 6

  useEffect(() => {
    setLoading(true)
    fetch("/api/equipment")
      .then(async (res) => {
        const text = await res.text()
        if (!res.ok) {
          throw new Error(`Failed to fetch /api/equipment: ${res.status}`)
        }
        return JSON.parse(text)
      })
      .then((data) => {
        const mapped = data.map((eq: any) => ({
          id: eq._id,
          name: eq.name,
          category: eq.category,
          location: eq.location,
          availability: eq.status,
          image: eq.imageUrl || "/placeholder.svg?height=200&width=200",
        }))
        setEquipment(mapped)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Fetch error:", err)
        setLoading(false)
      })
  }, [])

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === "all" || item.category.toLowerCase() === category
    const matchesAvailability = availability === "all" || item.availability.toLowerCase() === availability
    return matchesSearch && matchesCategory && matchesAvailability
  })

  const totalPages = Math.ceil(filteredEquipment.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEquipment = filteredEquipment.slice(startIndex, startIndex + itemsPerPage)

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === "available") return "bg-green-100 text-green-800"
    if (statusLower === "reserved") return "bg-yellow-100 text-yellow-800"
    if (statusLower === "maintenance") return "bg-red-100 text-red-800"
    return "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-black">Research Equipment Marketplace</h1>
          <p className="text-gray-700 text-lg">Browse and reserve tools for your projects.</p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search equipment, tools, or keywords..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 py-6 border-gray-300 text-black placeholder:text-gray-500"
            />
          </div>

          <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
            <div>
              <Label htmlFor="category" className="text-black font-semibold mb-2 block">Category</Label>
              <Select value={category} onValueChange={(value) => {
                setCategory(value)
                setCurrentPage(1)
              }}>
                <SelectTrigger id="category" className="border-gray-300 text-black">
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
              <Label htmlFor="availability" className="text-black font-semibold mb-2 block">Status</Label>
              <Select value={availability} onValueChange={(value) => {
                setAvailability(value)
                setCurrentPage(1)
              }}>
                <SelectTrigger id="availability" className="border-gray-300 text-black">
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
        </div>

        {/* Equipment Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-lg bg-white border border-gray-300 shadow overflow-hidden flex flex-col"
              >
                <div className="aspect-video w-full bg-gray-200 animate-pulse" />
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div className="h-6 rounded w-1/2 bg-gray-200 animate-pulse" />
                    <div className="h-5 rounded w-20 bg-gray-200 animate-pulse" />
                  </div>
                  <div className="h-4 rounded w-1/4 mb-3 bg-gray-200 animate-pulse" />
                  <div className="h-4 rounded w-1/2 mb-4 bg-gray-200 animate-pulse" />
                  <div className="flex-1" />
                  <div className="h-9 rounded w-full bg-gray-200 animate-pulse mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {paginatedEquipment.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {paginatedEquipment.map((item) => {
                  const isAvailable = item.availability === "Available"
                  return (
                    <Card
                      key={item.id}
                      className={`overflow-hidden border-gray-300 flex flex-col ${
                        isAvailable ? "cursor-pointer hover:shadow-lg transition-shadow duration-300" : "opacity-70"
                      }`}
                    >
                      <div className="aspect-video w-full bg-gray-100 overflow-hidden">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-lg font-bold text-black">{item.name}</CardTitle>
                          <Badge className={`whitespace-nowrap ${getStatusColor(item.availability)}`}>
                            {item.availability}
                          </Badge>
                        </div>
                        <CardDescription className="text-gray-600 capitalize">{item.category}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <p className="text-sm text-gray-700">Department: <span className="font-semibold">{item.location}</span></p>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Link href={`/booking?equipment=${item.id}`} className="w-full">
                          <Button
                            disabled={!isAvailable}
                            className={`w-full font-semibold ${
                              isAvailable
                                ? "bg-black hover:bg-gray-800 text-white"
                                : "bg-gray-400 text-gray-600 cursor-not-allowed"
                            }`}
                          >
                            Book Now
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No equipment found matching your filters.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <p className="text-gray-600 text-sm">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredEquipment.length)} of {filteredEquipment.length} items
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="border-gray-300 text-black hover:bg-gray-100"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="border-gray-300 text-black hover:bg-gray-100"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
