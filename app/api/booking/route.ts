import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import Booking from '@/models/Booking'
import Equipment from '@/models/Equipment'
import User from '@/models/User'
import { autoCompleteBookings } from '@/lib/bookingUtils'
import { Types } from 'mongoose'

interface LeanBooking {
  _id: Types.ObjectId
  userEmail:   string
  equipmentId: { name: string }
  date:        string
  startTime:   string
  duration:    number
  supervisor:  string
  department:  string
  purpose:     string
  status:      'pending' | 'approved' | 'rejected' | 'completed'
  createdAt:   Date
}

export async function GET(req: Request) {
  await dbConnect()
  await autoCompleteBookings()

  try {
    const raw = await Booking.find({})
      .populate<{ equipmentId: { name: string } }>('equipmentId', 'name')
      .sort({ date: -1 })
      .lean<LeanBooking[]>() 

    const bookings = raw as LeanBooking[]

    const enriched = await Promise.all(
      bookings.map(async (b) => {
        const user = await User
          .findOne({ email: b.userEmail }, 'name')
          .lean<{ name: string }>()

        return {
          id:         b._id,
          date:       b.date,
          startTime:  b.startTime,
          duration:   b.duration,
          supervisor: b.supervisor,
          department: b.department,
          purpose:    b.purpose,
          status:     b.status,
          createdAt:  b.createdAt,
          userEmail:  b.userEmail,
          equipment:   b.equipmentId.name,
          equipmentId: (b.equipmentId as any)._id?.toString() ?? '',
          userName:    user?.name ?? 'Unknown'
        }
      })
    )

    return NextResponse.json(enriched)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}


// POST /api/bookings - Create a new booking request
export async function POST(req: Request) {
  console.log("POST /api/bookings called")
  await dbConnect()
  console.log("Connected to database")

  try {
    const data = await req.json()
    console.log("Request body received:", data)

    const {
      userEmail, 
      equipmentId,
      date,
      startTime,
      duration,
      supervisor,
      department,
      purpose,
    } = data

    if (!equipmentId || !date || !startTime || !duration || !supervisor || !department || !purpose) {
      console.warn("Missing required fields:", { equipmentId, date, startTime, duration, supervisor, department, purpose })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const conflict = await Booking.findOne({ equipmentId, date, startTime });
    if (conflict) {
      console.warn("Booking conflict found, creating anyway:", conflict);
    }

    const booking = await Booking.create({
      userEmail,
      equipmentId,
      date,
      startTime,
      duration,
      supervisor,
      department,
      purpose,
      status: 'pending',
    })

    console.log("Booking request created:", booking)
    return NextResponse.json(booking, { status: 201 })
  } catch (err: any) {
    console.error("POST error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
