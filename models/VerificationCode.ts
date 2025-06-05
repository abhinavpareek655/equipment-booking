// models/VerificationCode.ts
import { Schema, model, models } from "mongoose";

const VerificationCodeSchema = new Schema({
  email: { type: String, required: true, unique: true },
  codeHash: { type: String, required: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  expiresAt: { type: Number, required: true },
});

export default models.VerificationCode ||
  model("VerificationCode", VerificationCodeSchema);
