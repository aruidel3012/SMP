import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { ACCOUNT_TYPES } from "../config.ts";

interface IUser extends Document {
  name: string;
  accountType: string;
  email: string;
  password: string;
  verified: boolean;
  role: string;
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
  subscriptionStartDate: Date | null;
  deleteCode: string | null;
  deleteCodeExpiry: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(plain: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
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
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    role: { type: String, enum: ["client", "admin"], default: "client" },
    subscriptionPlan: { type: String, default: null },
    subscriptionStatus: {
      type: String,
      enum: ["active", "cancelled", "pending", null],
      default: null,
    },
    subscriptionStartDate: { type: Date, default: null },
    deleteCode: { type: String, default: null },
    deleteCodeExpiry: { type: Date, default: null },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (this: IUser, next) {
  const locals = this.$locals as { passwordAlreadyHashed?: boolean };
  if (locals.passwordAlreadyHashed) return next();
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (
  this: IUser,
  plain: string,
): Promise<boolean> {
  return bcrypt.compare(plain, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
