import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Category from "./Category.js";

export const ResearchSubmission = sequelize.define("ResearchSubmission", {
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
  dateOfSubmission: {
    type: DataTypes.DATE,
    allowNull: false
  },
  publishUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  documentUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  keywords: {
    type: DataTypes.JSONB, // PG specific for arrays
    defaultValue: []
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true
});

// Associations
ResearchSubmission.belongsTo(Category, { foreignKey: "categoryId" });

export default ResearchSubmission;
