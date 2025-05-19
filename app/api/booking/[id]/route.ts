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
    console.error(`❌ GET /api/booking/${params.id} error:`, err);
    return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  await dbConnect();
  let data: any;
  try {
    data = await request.json();
  } catch (parseErr) {
    console.error("❌ PUT JSON parse error:", parseErr);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const updated = await Booking.findByIdAndUpdate(
      params.id,
      data,
      { new: true, runValidators: true }
    );
    if (!updated) {
      console.warn(`⚠️  PUT /api/booking/${params.id}: not found`);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    console.log(`✅ PUT /api/booking/${params.id} success:`, updated);
    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    console.error(`❌ Mongoose update error on PUT /api/booking/${params.id}:`, err);
    return NextResponse.json(
      { error: err.message || "Failed to update booking" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  // same as PUT but with debug logs
  await dbConnect();
  let data: any;
  try {
    data = await request.json();
    console.log(`🛠️  PATCH /api/booking/${params.id} payload:`, data);
  } catch (parseErr) {
    console.error("❌ PATCH JSON parse error:", parseErr);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const updated = await Booking.findByIdAndUpdate(
      params.id,
      data,
      { new: true, runValidators: true }
    );
    if (!updated) {
      console.warn(`⚠️  PATCH /api/booking/${params.id}: not found`);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    console.log(`✅ PATCH /api/booking/${params.id} success:`, updated);
    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    console.error(`❌ Mongoose update error on PATCH /api/booking/${params.id}:`, err);
    return NextResponse.json(
      { error: err.message || "Failed to update booking" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  await dbConnect();
  try {
    const deleted = await Booking.findByIdAndDelete(params.id);
    if (!deleted) {
      console.warn(`⚠️  DELETE /api/booking/${params.id}: not found`);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    console.log(`🗑️  DELETE /api/booking/${params.id} success`);
    return NextResponse.json({ message: "Booking deleted" }, { status: 200 });
  } catch (err) {
    console.error(`❌ DELETE /api/booking/${params.id} error:`, err);
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 400 });
  }
}
