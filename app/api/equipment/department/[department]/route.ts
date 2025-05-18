import { NextResponse } from "next/server"
import { dbConnect } from "../../../../../lib/db"
import Equipment from "../../../../../models/Equipment"

export async function GET(
  request: Request,
  { params }: { params: { department: string } }
) {
  await dbConnect()
  const dept = params.department
  // case‐insensitive match:
  const list = await Equipment.find({
    department: { $regex: new RegExp(`^${dept}$`, "i") }
  }).sort({ name: 1 })

  return NextResponse.json(list)
}