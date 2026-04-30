import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js";

export const UserResource = sequelize.define("UserResource", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  link: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM("repo", "news", "other"),
    defaultValue: "other"
  }
}, {
  timestamps: true
});

UserResource.belongsTo(User, { foreignKey: "userId" });

export default UserResource;
