import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/db";
import Booking from "@/models/Booking";
import User from "@/models/User";
import Admin from "@/models/Admin";
import { autoCompleteBookings } from "@/lib/bookingUtils";
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
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: Date;
}

export async function GET() {
  await dbConnect();
  await autoCompleteBookings();

  const cookieStore = await cookies();
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

    const admin = await Admin.findOne({ email }).lean<{ assignedEquipment: Types.ObjectId[] }>();
    if (!admin) {
      return NextResponse.json([], { status: 200 });
    }

    const bookingsRaw = await Booking.find({
      equipmentId: { $in: admin.assignedEquipment },
    })
      .populate<{ equipmentId: { _id: Types.ObjectId; name: string } }>(
        "equipmentId",
        "name",
      )
      .sort({ date: -1 })
      .lean<LeanBooking[]>();

    const bookings = await Promise.all(
      bookingsRaw.map(async (b) => {
        const user = await User.findOne({ email: b.userEmail }, "name profilePhoto").lean<{
          name: string;
          profilePhoto?: string;
        }>();

        const historyRaw = await Booking.find({
          equipmentId: (b.equipmentId as any)._id ?? b.equipmentId,
          userEmail: b.userEmail,
          _id: { $ne: b._id },
        })
          .sort({ date: -1, startTime: -1 })
          .lean<{
            date: string;
            startTime: string;
            duration: number;
            status: string;
          }[]>();

        const userHistory = historyRaw.map((h) => {
          const [startHour] = h.startTime.split(":").map(Number);
          const endHour = startHour + h.duration;
          return {
            date: h.date,
            equipment: b.equipmentId.name,
            status: h.status,
            timeSlot: `${h.startTime} - ${endHour.toString().padStart(2, "0")}:00`,
          };
        });

        const lastUsed = historyRaw[0]?.date ?? null;

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
          userName: user?.name ?? "Unknown",
          userProfilePhoto: user?.profilePhoto ?? null,
          userHistory,
          lastUsed,
        };
      })
    );

    bookings.sort((a, b) => {
      const dateA = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
      const dateB = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
      return dateA - dateB;
    });

    return NextResponse.json(bookings);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
