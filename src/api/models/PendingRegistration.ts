import mongoose, { Schema, Document } from "mongoose";
import { ACCOUNT_TYPES } from "../config.ts";

interface IPendingRegistration extends Document {
  name: string;
  accountType: string;
  email: string;
  passwordHash: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
}

const pendingSchema = new Schema<IPendingRegistration>(
  {
    name: { type: String, required: true, trim: true },
    accountType: {
      type: String,
      enum: ACCOUNT_TYPES,
      required: true,
      default: "particular",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    verifyCode: { type: String, required: true },
    verifyCodeExpiry: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
);

const PendingRegistration = mongoose.model<IPendingRegistration>("PendingRegistration", pendingSchema);

export default PendingRegistration;
