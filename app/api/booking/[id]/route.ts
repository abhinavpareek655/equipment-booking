// app/api/booking/[id]/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Booking from "@/models/Booking";

type Params = { params: { id: string } };

export async function GET(request: Request, { params }: Params) {
  await dbConnect();
  try {
    const booking = await Booking
      .findById(params.id)
      .populate("equipmentId", "name department status category location contact imageUrl");
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json(booking, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  await dbConnect();
  const data = await request.json();
  try {
    const updated = await Booking.findByIdAndUpdate(
      params.id,
      data,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update booking" }, { status: 400 });
  }
}

// support PATCH the same way as PUT:
export const PATCH = PUT;

export async function DELETE(request: Request, { params }: Params) {
  await dbConnect();
  try {
    const deleted = await Booking.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Booking deleted" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 400 });
  }
}
