import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  status: { type: String, default: "available" },
  category: { type: String },
  location: { type: String },
  contact: { type: String },
  imageUrl: { type: String },
  totalHours: { type: Number, default: 0 },
  maintenanceHours: { type: Number, default: 0 },
  uptime: { type: String, default: "--" },
}, { timestamps: true });

const Equipment = mongoose.models.Equipment || mongoose.model("Equipment", equipmentSchema);

export default Equipment;
