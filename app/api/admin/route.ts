import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import Admin from "@/models/Admin"
import User from "@/models/User"

// GET /api/admin
export async function GET() {
  await dbConnect()
  const admins = await Admin.find({})
    .populate<{ _id: string; name: string }>("assignedInstruments", "name")
    .lean()

  const result = await Promise.all(
    admins.map(async (admin: any) => {
      const user = await User.findOne({ email: admin.email }, "name department").lean()
      return {
        id: admin._id.toString(),
        email: admin.email,
        name: user?.name || "",
        department: user?.department || "",
        instruments: (admin.assignedInstruments || []).map((eq: any) => ({
          id: eq._id.toString(),
          name: eq.name,
        })),
      }
    })
  )

  return NextResponse.json(result)
}

// POST /api/admin
export async function POST(req: Request) {
  await dbConnect()
  const { email, assignedInstruments } = await req.json()

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 })
  }

  const existing = await Admin.findOne({ email })
  if (existing) {
    return NextResponse.json({ error: "Admin already exists" }, { status: 409 })
  }

  const admin = await Admin.create({
    email,
    assignedInstruments: assignedInstruments || [],
  })

  return NextResponse.json(admin, { status: 201 })
}
