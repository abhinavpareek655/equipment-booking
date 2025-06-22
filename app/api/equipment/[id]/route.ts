import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import Equipment from "@/models/Equipment"

interface Params { params: { id: string } }

export async function GET(req: Request, { params }: Params) {
  await dbConnect()
  try {
    const eq = await Equipment.findById(params.id)
    if (!eq) {
      return NextResponse.json({ error: "Equipment not found" }, { status: 404 })
    }
    return NextResponse.json(eq, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: "Invalid equipment ID" }, { status: 400 })
  }
}

export async function PATCH(req: Request, { params }: Params) {
  await dbConnect()
  let data: any
  try {
    data = await req.json()
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
  try {
    const updated = await Equipment.findByIdAndUpdate(params.id, data, { new: true })
    if (!updated) {
      return NextResponse.json({ error: "Equipment not found" }, { status: 404 })
    }
    return NextResponse.json(updated, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update" }, { status: 400 })
  }
}

export async function DELETE(req: Request, { params }: Params) {
  await dbConnect()
  try {
    const deleted = await Equipment.findByIdAndDelete(params.id)
    if (!deleted) {
      return NextResponse.json({ error: "Equipment not found" }, { status: 404 })
    }
    return NextResponse.json({ message: "Equipment deleted" }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete equipment" }, { status: 400 })
  }
}

