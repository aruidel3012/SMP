import mongoose, { Schema, Document } from "mongoose";

interface IChatMessage extends Document {
  ticketId: mongoose.Types.ObjectId;
  senderRole: string;
  senderName: string;
  senderEmail: string;
  replyToMessageId?: mongoose.Types.ObjectId;
  replyToContent?: string;
  replyToSenderName?: string;
  content: string;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      index: true,
    },
    senderRole: { type: String, enum: ["client", "admin"], required: true },
    senderName: { type: String, required: true, trim: true },
    senderEmail: { type: String, required: true, trim: true, lowercase: true },
    replyToMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatMessage",
    },
    replyToContent: { type: String, trim: true },
    replyToSenderName: { type: String, trim: true },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

const ChatMessage = mongoose.model<IChatMessage>("ChatMessage", chatMessageSchema);

export default ChatMessage;
