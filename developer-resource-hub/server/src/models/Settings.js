import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

export const Settings = sequelize.define("Settings", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tabs: {
    type: DataTypes.JSONB,
    defaultValue: {
      repos: true,
      websites: true,
      research: true
    }
  },
  customSections: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  timestamps: true
});

export default Settings;
