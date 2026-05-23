import mongoose, { Schema, Document } from "mongoose";

interface IPasswordReset extends Document {
  email: string;
  resetCode: string;
  resetCodeExpiry: Date;
}

const passwordResetSchema = new Schema<IPasswordReset>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    resetCode: { type: String, required: true },
    resetCodeExpiry: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
);

const PasswordReset = mongoose.model<IPasswordReset>("PasswordReset", passwordResetSchema);

export default PasswordReset;
