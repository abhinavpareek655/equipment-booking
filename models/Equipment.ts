import mongoose from "mongoose"

const equipmentSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  department: { type: String, required: true },    
  status:     { type: String, default: "available" },
  category:   { type: String },
  location:   { type: String },
  contact:    { type: String },
  imageUrl:   { type: String },
}, { timestamps: true })

export default mongoose.models.Equipment 
  || mongoose.model("Equipment", equipmentSchema)
