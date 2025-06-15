import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import Admin from "@/models/Admin"

interface Params { params: { id: string } }

export async function PATCH(req: Request, { params }: Params) {
  await dbConnect()
  const { assignedEquipment } = await req.json()
  try {
    const updated = await Admin.findByIdAndUpdate(
      params.id,
      { assignedEquipment: assignedEquipment || [] },
      { new: true }
    )
    if (!updated) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }
    return NextResponse.json(updated, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 400 })
  }
}
