import mongoose, { Schema, Document } from "mongoose";

interface ITicket extends Document {
  title: string;
  description: string;
  status: string;
  clientId: mongoose.Types.ObjectId;
  clientEmail: string;
}

const ticketSchema = new Schema<ITicket>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["open", "in_progress", "closed"],
      default: "open",
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientEmail: { type: String, required: true, trim: true, lowercase: true },
  },
  { timestamps: true },
);

const Ticket = mongoose.model<ITicket>("Ticket", ticketSchema);

export default Ticket;
