import mongoose from "mongoose";
import dotenv from "dotenv";
import { Category } from "./src/models/Category.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const categoriesToCreate = [
  // Repo Categories
  { name: "Frontend Frameworks", type: "repo" },
  { name: "Backend Frameworks", type: "repo" },
  { name: "UI Components", type: "repo" },
  { name: "Developer Tools", type: "repo" },
  { name: "Machine Learning", type: "repo" },

  // Website Categories
  { name: "Learning Platforms", type: "website" },
  { name: "Design Resources", type: "website" },
  { name: "Free APIs", type: "website" },
  { name: "Tech News", type: "website" },
  { name: "Remote Jobs", type: "website" },

  // Research Categories
  { name: "Artificial Intelligence", type: "research" },
  { name: "Cybersecurity", type: "research" },
  { name: "Cloud Computing", type: "research" },
  { name: "Data Science", type: "research" },
  { name: "Web Technologies", type: "research" },
];

async function seedCategories() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB...");

    for (const cat of categoriesToCreate) {
      const existing = await Category.findOne({ name: cat.name, type: cat.type });
      if (!existing) {
        await Category.create(cat);
        console.log(`Created category: ${cat.name} (${cat.type})`);
      } else {
        console.log(`Category already exists: ${cat.name} (${cat.type})`);
      }
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
}

seedCategories();
