import mongoose, { Schema, Document } from "mongoose";

interface ISubscription extends Document {
  clientId: mongoose.Types.ObjectId;
  clientEmail: string;
  planId: string;
  planName: string;
  planType: string;
  price: number;
  status: string;
  startDate: Date;
  endDate: Date | null;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientEmail: { type: String, required: true, trim: true, lowercase: true },
    planId: { type: String, required: true },
    planName: { type: String, required: true },
    planType: {
      type: String,
      enum: ["subscription", "one_time"],
      required: true,
    },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["active", "cancelled", "pending"],
      default: "active",
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },
  },
  { timestamps: true },
);

const Subscription = mongoose.model<ISubscription>("Subscription", subscriptionSchema);

export default Subscription;
