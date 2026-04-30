import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    tabs: {
      repos: { type: Boolean, default: true },
      websites: { type: Boolean, default: true },
      research: { type: Boolean, default: true },
    },
    customSections: [
      {
        title: { type: String, required: true },
        type: { type: String, enum: ["repo", "website", "research"], required: true },
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
        enabled: { type: Boolean, default: true },
        displayOrder: { type: Number, default: 0 }
      }
    ]
  },
  { timestamps: true }
);

export const Settings = mongoose.model("Settings", settingsSchema);
