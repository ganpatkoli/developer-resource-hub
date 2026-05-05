import "dotenv/config";
import sequelize, { connectDB } from "./config/db.js";
import { Category } from "./models/Category.js";
import { Post } from "./models/Post.js";
import { ResearchSubmission } from "./models/ResearchSubmission.js";

const categories = [
  { name: "Artificial Intelligence", type: "research" },
  { name: "Web Technologies", type: "repo" },
  { name: "Cybersecurity", type: "repo" },
  { name: "Cloud Computing", type: "research" },
  { name: "Open Source Tools", type: "website" }
];

const dummyPosts = [
  {
    title: "FastAPI Boilerplate",
    description: "A high-performance production-ready boilerplate for FastAPI with PostgreSQL and Redis integration.",
    link: "https://github.com/example/fastapi-boilerplate",
    type: "repo",
  },
  {
    title: "Next.js Enterprise Starter",
    description: "The ultimate starter kit for high-performance enterprise applications using Next.js and Tailwind CSS.",
    link: "https://github.com/example/nextjs-starter",
    type: "repo",
  },
  {
    title: "Zero-Day Vulnerability Report",
    description: "Recent security audit reveals a critical remote code execution flaw in the cluster module.",
    link: "https://techcrunch.com/security",
    type: "website",
  }
];

const dummyResearch = [
  {
    title: "Neural Network Architecture Optimization",
    description: "A comprehensive study on reducing latency in large language models using quantization.",
    dateOfSubmission: new Date(),
    publishUrl: "https://arxiv.org/abs/2311.0942",
    documentUrl: "https://arxiv.org/pdf/2311.0942.pdf",
    keywords: ["AI", "Optimization", "LLM"],
  }
];

async function seed() {
  try {
    await connectDB();
    await sequelize.sync({ force: false }); // Don't wipe everything, just ensure tables exist

    console.log("Seeding Categories...");
    const createdCategories = {};
    for (const cat of categories) {
      const [instance] = await Category.findOrCreate({
        where: { name: cat.name, type: cat.type },
        defaults: cat
      });
      createdCategories[cat.type] = instance.id;
    }

    console.log("Seeding Posts...");
    for (const p of dummyPosts) {
      await Post.findOrCreate({
        where: { link: p.link },
        defaults: { ...p, categoryId: createdCategories[p.type] || createdCategories["repo"] }
      });
    }

    console.log("Seeding Research...");
    for (const r of dummyResearch) {
      await ResearchSubmission.findOrCreate({
        where: { publishUrl: r.publishUrl },
        defaults: { ...r, categoryId: createdCategories["research"] }
      });
    }

    console.log("✅ Database Seeded Successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
