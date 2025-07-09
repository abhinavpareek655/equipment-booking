"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation";


const API_BASE = process.env.NEXT_PUBLIC_API_URL

type EquipmentItem = {
  id: string
  name: string
  category: string
  location: string
  availability: string
  image: string
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [availability, setAvailability] = useState("all");
  const router = useRouter();

  useEffect(() => {
  setLoading(true)
  console.log("📦 Fetching /api/equipment...")

  fetch("/api/equipment")
    .then(async (res) => {
      console.log("🔁 Response status:", res.status)

      const text = await res.text()
      console.log("📄 Raw response:", text)

      if (!res.ok) {
        throw new Error(`❌ Failed to fetch /api/equipment: ${res.status}`)
      }

      // Parse JSON only if response was OK
      return JSON.parse(text)
    })
    .then((data) => {
      console.log("✅ Parsed data:", data)

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
      console.error("🚨 Fetch error:", err)
    })
    .catch(() => setLoading(false))
}, [])

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || item.category.toLowerCase() === category;
    const matchesAvailability = availability === "all" || item.availability.toLowerCase() === availability;
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  console.log("🔍 Filtering equipment by search term:", search)

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Equipment Catalog</h1>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="search">Search Equipment</Label>
          <Input
            id="search"
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="category">Filter by Category</Label>
          <Select value={category} onValueChange={setCategory}>
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
          <Select value={availability} onValueChange={setAvailability}>
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
      {loading ? (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg bg-white border shadow overflow-hidden flex flex-col"
          >
            <div className="aspect-video w-full skeleton-shimmer" />
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div className="h-6 rounded w-1/2 skeleton-shimmer" />
                <div className="h-5 rounded w-20 skeleton-shimmer" />
              </div>
              <div className="h-4 rounded w-1/4 mb-3 skeleton-shimmer" />
              <div className="h-4 rounded w-1/2 mb-4 skeleton-shimmer" />
              <div className="flex-1" />
              <div className="flex justify-between gap-2 mt-4">
                <div className="h-9 rounded w-28 skeleton-shimmer" />
                <div className="h-9 rounded w-28 skeleton-shimmer" />
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEquipment.map((item) => {
            const isAvailable = item.availability === "Available";
            return (
              <Card
                key={item.id}
                className={`overflow-hidden ${isAvailable ? "cursor-pointer hover:scale-105 transition-all duration-300" : "opacity-60"}`}
                onClick={() => {
                  if (isAvailable) router.push(`/booking?equipment=${item.id}`);
                }}
                tabIndex={isAvailable ? 0 : -1}
                role="button"
                aria-disabled={!isAvailable}
              >
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
                <CardFooter className="flex justify-end">
                  <Link href={`/booking?equipment=${item.id}`} passHref>
                    <Button disabled={!isAvailable}>Book Now</Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
      </div>
    )}
    </div>
  )
}
