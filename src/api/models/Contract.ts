import mongoose, { Schema, Document } from "mongoose";

interface IContract extends Document {
  clientId: mongoose.Types.ObjectId;
  clientEmail: string;
  serviceId: string;
  serviceName: string;
  equipmentCount: number;
  status: string;
}

const contractSchema = new Schema<IContract>(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientEmail: { type: String, required: true, trim: true, lowercase: true },
    serviceId: { type: String, required: true, trim: true },
    serviceName: { type: String, required: true, trim: true },
    equipmentCount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["active", "paused", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true },
);

const Contract = mongoose.model<IContract>("Contract", contractSchema);

export default Contract;
