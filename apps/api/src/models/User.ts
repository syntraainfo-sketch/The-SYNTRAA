import mongoose, { InferSchemaType, Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String },
    role: {
      type: String,
      enum: ["customer", "admin", "superAdmin"],
      default: "customer",
    },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };
export const User = mongoose.models.User ?? mongoose.model("User", userSchema);
