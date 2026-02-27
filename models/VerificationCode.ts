// models/VerificationCode.ts
import { Schema, model, models, Document } from "mongoose";

interface IVerificationCode extends Document {
  email: string;
  codeHash: string;
  name: string;
  passwordHash: string;
  role: string;
  department: string;
  supervisorEmail?: string;
  supervisorCodeHash?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationCodeSchema = new Schema<IVerificationCode>(
  {
    email:        { type: String, required: true, unique: true, trim: true },
    codeHash:     { type: String, required: true },
    name:         { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role:         { type: String, required: true, trim: true },
    department:   { type: String, required: true, trim: true },
    supervisorEmail: { type: String, trim: true, default: null },
    supervisorCodeHash: { type: String, default: null },
    expiresAt:    { type: Date,   required: true },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

export default models.VerificationCode ||
  model<IVerificationCode>("VerificationCode", VerificationCodeSchema);
