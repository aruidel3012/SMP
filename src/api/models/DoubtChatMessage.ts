import mongoose, { Schema, Document } from "mongoose";

interface IDoubtChatMessage extends Document {
  senderName: string;
  content: string;
  sessionId: string;
  isAdmin: boolean;
  expiresAt: Date;
}

const doubtChatMessageSchema = new Schema<IDoubtChatMessage>(
  {
    senderName: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    sessionId: { type: String, required: true, index: true },
    isAdmin: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
);

doubtChatMessageSchema.pre("validate", function (this: IDoubtChatMessage, next) {
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  }
  next();
});

const DoubtChatMessage = mongoose.model<IDoubtChatMessage>("DoubtChatMessage", doubtChatMessageSchema);

export default DoubtChatMessage;
