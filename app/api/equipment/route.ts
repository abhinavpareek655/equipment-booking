import { NextResponse } from 'next/server'
import { dbConnect } from '../../../lib/db'
import Equipment from '../../../models/Equipment'

// GET /api/equipment
export async function GET() {
  await dbConnect()
  const list = await Equipment.find({}).sort({ name: 1 })
  return NextResponse.json(list)
}

// POST /api/equipment
export async function POST(request: Request) {
  await dbConnect()
  const { name, department, category, location, contact, status, imageUrl } = await request.json()

  if (!name || !department || !location) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const eq = await Equipment.create({
      name,
      department,
      category,
      location,
      contact,
      status: status || "available",
      imageUrl,
    })
    return NextResponse.json(eq, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}