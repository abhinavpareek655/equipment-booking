import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbConnect } from '@/lib/db'
import Booking from '@/models/Booking'
import jwt from 'jsonwebtoken'
import { Types } from 'mongoose'

interface LeanBooking {
  _id: Types.ObjectId
  userEmail: string
  equipmentId: { _id: Types.ObjectId; name: string; location?: string }
  date: string
  startTime: string
  duration: number
  supervisor: string
  department: string
  purpose: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
}

export async function GET() {
  await dbConnect()

  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any
    const email = payload.email as string
    if (!email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const raw = await Booking.find({ userEmail: email })
      .populate<{ equipmentId: { _id: Types.ObjectId; name: string; location?: string } }>(
        'equipmentId',
        'name location'
      )
      .sort({ date: -1 })
      .lean<LeanBooking[]>()

    const bookings = (raw as LeanBooking[]).map((b) => ({
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
      location: b.equipmentId.location || ''
    }))

    return NextResponse.json(bookings)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
