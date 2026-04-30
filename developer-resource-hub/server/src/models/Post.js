import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Category from "./Category.js";

export const Post = sequelize.define("Post", {
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
    type: DataTypes.ENUM("repo", "news", "website"),
    allowNull: false
  },
  githubMeta: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true
});

Post.belongsTo(Category, { foreignKey: "categoryId" });

export default Post;
