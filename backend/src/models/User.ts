import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser, UserRole } from "../types";

// Mongoose Document type for User
export interface IUserDocument extends IUser, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["admin", "sales"] as UserRole[],
      default: "sales", // New users are sales by default
    },
  },
  { timestamps: true }
);

// Hash password before saving - runs automatically on save()
UserSchema.pre("save", async function (next) {
  // Only hash if password was changed
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model<IUserDocument>("User", UserSchema);
export default User;
