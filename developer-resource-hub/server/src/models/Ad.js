import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

export const Ad = sequelize.define("Ad", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  targetUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  position: {
    type: DataTypes.ENUM("HOME_BANNER", "SIDEBAR", "BOTTOM_FULL", "LEFT_GUTTER", "RIGHT_GUTTER"),
    defaultValue: "HOME_BANNER"
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  clickCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true
});

export default Ad;
