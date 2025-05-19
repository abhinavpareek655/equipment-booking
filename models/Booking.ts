import mongoose, { Schema, models } from 'mongoose'

const BookingSchema = new Schema({
  userEmail: { type: String, required: true },
  equipmentId: { type: Schema.Types.ObjectId, ref: 'Equipment', required: true },
  date: { type: String}, // format: YYYY-MM-DD
  startTime: { type: String}, // format: HH:mm
  duration: { type: Number, required: true}, // in hours
  supervisor: { type: String},
  department: { type: String},
  purpose: { type: String},
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
})

export default models.Booking || mongoose.model('Booking', BookingSchema)
