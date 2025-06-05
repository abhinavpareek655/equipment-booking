// models/User.ts
import { Schema, model, models, Document } from "mongoose";

interface IUser extends Document {
  name: string;
  email: string;
  department: string;
  role: string;
  passwordHash: string;
  supervisor?: string;
}

const UserSchema = new Schema<IUser>(
  {
    name:        { type: String, required: true, trim: true },
    email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    department:  { type: String, required: true, trim: true },
    role:        { type: String, required: true, trim: true },
    passwordHash:{ type: String, required: true },
    supervisor:  { type: String, trim: true, default: null },
  },
  { timestamps: true }
);

export default models.User || model<IUser>("User", UserSchema);
