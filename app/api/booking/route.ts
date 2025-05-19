import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import Booking from '@/models/Booking'
import Equipment from '@/models/Equipment'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'

// GET /api/bookings - Get all bookings
export async function GET(req: Request) {
  console.log("GET /api/bookings called")
  await dbConnect()
  console.log("Connected to database")

  try {
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // const email = session.user?.email
    // const role = session.user?.role
    // const filter = role === 'admin' ? {} : { userEmail: email }

    const bookings = await Booking.find({})
      .populate('equipmentId')
      .sort({ date: -1 })

    console.log("Fetched bookings:", bookings.length)
    return NextResponse.json(bookings)
  } catch (err: any) {
    console.error("GET error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/bookings - Create a new booking request
export async function POST(req: Request) {
  console.log("POST /api/bookings called")
  await dbConnect()
  console.log("Connected to database")

  try {
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const data = await req.json()
    console.log("Request body received:", data)

    const {
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

    const conflict = await Booking.findOne({ equipmentId, date, startTime })
    if (conflict) {
      console.warn("Booking conflict found:", conflict)
      return NextResponse.json({ error: 'Time slot already booked' }, { status: 409 })
    }

    const booking = await Booking.create({
      userEmail: "test@curaj.ac.in",
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
