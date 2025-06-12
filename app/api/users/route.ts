import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import User from "@/models/User"

export async function GET(req: Request) {
  await dbConnect()
  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") || ""
  const filter = search
    ? { email: { $regex: search, $options: "i" } }
    : {}
  const users = await User.find(filter).limit(10).lean()
  const result = users.map((u) => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    department: u.department,
    role: u.role,
  }))
  return NextResponse.json(result)
}
