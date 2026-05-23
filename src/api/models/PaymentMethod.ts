import mongoose, { Schema, Document } from "mongoose";

interface IPaymentMethod extends Document {
  clientId: mongoose.Types.ObjectId;
  clientEmail: string;
  type: string;
  alias: string;
  last4: string;
  holderName: string;
  phone: string;
  iban: string;
}

const paymentMethodSchema = new Schema<IPaymentMethod>(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientEmail: { type: String, required: true, trim: true, lowercase: true },
    type: { type: String, enum: ["card", "transfer", "bizum"], required: true },
    alias: { type: String, trim: true, default: "" },
    last4: { type: String, trim: true, default: "" },
    holderName: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    iban: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

const PaymentMethod = mongoose.model<IPaymentMethod>("PaymentMethod", paymentMethodSchema);

export default PaymentMethod;
