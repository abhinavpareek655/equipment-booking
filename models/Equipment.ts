import mongoose from "mongoose"

const equipmentSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  department:  { type: String, required: true },
  status:      { type: String, default: "available" },
  category:    { type: String },
  location:    { type: String },
  contact:     { type: String },
  imageUrl:    { type: String },

  // Usage stats fields
  totalHours:       { type: Number, default: 0 },     // total hours of usage
  maintenanceHours: { type: Number, default: 0 },     // total maintenance hours
  uptime:           { type: String, default: "--" },  // percentage or description, update as needed
}, { timestamps: true })

export default mongoose.models.Equipment 
  || mongoose.model("Equipment", equipmentSchema)
