import mongoose, { Schema, Document } from "mongoose";

interface IRemoteRepair extends Document {
  clientId: mongoose.Types.ObjectId;
  clientEmail: string;
  clientName: string;
  deviceType: string;
  issue: string;
  urgency: string;
  status: string;
  scheduledAt: Date | null;
  technicianNotes: string;
}

const remoteRepairSchema = new Schema<IRemoteRepair>(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientEmail: { type: String, required: true, trim: true, lowercase: true },
    clientName: { type: String, trim: true, default: "" },
    deviceType: {
      type: String,
      enum: ["pc", "laptop", "server", "mobile", "network", "other"],
      required: true,
    },
    issue: { type: String, required: true, trim: true },
    urgency: {
      type: String,
      enum: ["normal", "high", "critical"],
      default: "normal",
    },
    status: {
      type: String,
      enum: ["pending", "scheduled", "in_progress", "resolved", "cancelled"],
      default: "pending",
    },
    scheduledAt: { type: Date, default: null },
    technicianNotes: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

const RemoteRepair = mongoose.model<IRemoteRepair>("RemoteRepair", remoteRepairSchema);

export default RemoteRepair;
