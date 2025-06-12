import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/db";
import Booking from "@/models/Booking";
import Equipment from "@/models/Equipment";
import User from "@/models/User";
import Admin from "@/models/Admin";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

interface LeanBooking {
  _id: Types.ObjectId;
  userEmail: string;
  equipmentId: { _id: Types.ObjectId; name: string };
  date: string;
  startTime: string;
  duration: number;
  supervisor: string;
  department: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export async function GET() {
  await dbConnect();

  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    const email = (payload as any).email as string;
    if (!email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const admin = await Admin.findOne({ email }).lean<{ assignedInstruments: Types.ObjectId[] }>();
    if (!admin) {
      return NextResponse.json([], { status: 200 });
    }

    const bookingsRaw = await Booking.find({ equipmentId: { $in: admin.assignedInstruments } })
      .populate<{ equipmentId: { _id: Types.ObjectId; name: string } }>("equipmentId", "name")
      .sort({ date: -1 })
      .lean<LeanBooking[]>();

    const bookings = await Promise.all(
      bookingsRaw.map(async (b) => {
        const user = await User.findOne({ email: b.userEmail }, "name").lean<{ name: string }>();
        return {
          id: b._id.toString(),
          date: b.date,
          startTime: b.startTime,
          duration: b.duration,
          supervisor: b.supervisor,
          department: b.department,
          purpose: b.purpose,
          status: b.status,
          createdAt: b.createdAt,
          userEmail: b.userEmail,
          equipment: b.equipmentId.name,
          equipmentId: (b.equipmentId as any)._id?.toString() ?? '',
          userName: user?.name ?? 'Unknown',
        };
      })
    );

    return NextResponse.json(bookings);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
