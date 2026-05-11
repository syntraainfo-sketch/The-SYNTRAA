import mongoose from "mongoose";
import { AppError } from "./AppError";

export function toObjectId(id: string): mongoose.Types.ObjectId {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid id");
  }
  return new mongoose.Types.ObjectId(id);
}
