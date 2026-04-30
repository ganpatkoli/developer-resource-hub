import mongoose from "mongoose";

const userResourceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    link: { type: String, required: true, trim: true },
    type: { type: String, enum: ["repo", "news", "other"], default: "other" },
  },
  { timestamps: true }
);

export const UserResource = mongoose.model("UserResource", userResourceSchema);
