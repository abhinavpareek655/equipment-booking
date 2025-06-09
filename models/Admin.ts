// models/Admin.ts
import { Schema, model, models, Document } from "mongoose";

interface IAdmin extends Document {
  email: string; // reference to User.email
  assignedInstruments: string[]; // array of Equipment IDs as string/ObjectId
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      ref: "User", // references User collection
    },
    assignedInstruments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Equipment",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

export default models.Admin || model<IAdmin>("Admin", AdminSchema);
