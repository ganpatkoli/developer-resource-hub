import { DataTypes, Op } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js";
import Post from "./Post.js";

export const UserFavorite = sequelize.define("UserFavorite", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ["userId", "postId"],
      where: {
        postId: { [Op.ne]: null }
      }
    }
  ]
});

UserFavorite.belongsTo(User, { foreignKey: "userId" });
UserFavorite.belongsTo(Post, { foreignKey: "postId" });

export default UserFavorite;
