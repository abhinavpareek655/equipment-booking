import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { dbConnect } from "@/lib/db";
import Admin from "@/models/Admin";
import User from "@/models/User";

export async function GET() {
  await dbConnect();
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
    const admin = await Admin.findOne({ email })
      .populate<{ _id: string; name: string; location: string; category: string }>("assignedEquipment", "name location category")
      .lean();

    if (!admin) {
      return NextResponse.json({ equipment: [] });
    }

    const user = await User.findOne({ email }, "name department").lean<{ name?: string; department?: string }>();

    return NextResponse.json({
      id: admin._id.toString(),
      email: admin.email,
      name: user?.name || "",
      department: user?.department || "",
      equipment: (admin.assignedEquipment || []).map((eq: any) => ({
        id: eq._id.toString(),
        name: eq.name,
        location: eq.location,
        category: eq.category,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
