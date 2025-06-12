import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Admin from "@/models/Admin";
import User from "@/models/User";
import Equipment from "@/models/Equipment";

export async function GET() {
  await dbConnect();

  try {
    // Get all admins with assigned instrument IDs
    const admins = await Admin.find({}).lean();

    // For each admin, get user details and assigned instrument details
    const enrichedAdmins = await Promise.all(
      admins.map(async (admin: any) => {
        // Fetch user info
        const user = await User.findOne({ email: admin.email }).lean();
        // Fetch assigned instrument details (name)
        const assignedEquipments = await Equipment.find({
          _id: { $in: admin.assignedInstruments }
        }).lean();

        return {
          _id: admin._id,
          email: admin.email,
          name: (user && !Array.isArray(user) ? user.name : "Unknown"),
          department: (user && !Array.isArray(user) ? user.department : ""),
          assignedInstruments: assignedEquipments.map(eq => ({
            _id: eq._id,
            name: eq.name,
          })),
        };
      })
    );

    return NextResponse.json(enrichedAdmins);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
