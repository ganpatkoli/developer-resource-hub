import mongoose from "mongoose";

const userFavoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
    userResource: { type: mongoose.Schema.Types.ObjectId, ref: "UserResource", default: null },
  },
  { timestamps: true }
);

userFavoriteSchema.index({ user: 1, post: 1 }, { unique: true, sparse: true });
userFavoriteSchema.index({ user: 1, userResource: 1 }, { unique: true, sparse: true });

export const UserFavorite = mongoose.model("UserFavorite", userFavoriteSchema);
