import "dotenv/config";
import bcrypt from "bcryptjs";
import sequelize, { connectDB } from "./config/db.js";
import { Admin } from "./models/Admin.js";
import { User } from "./models/User.js";

async function run() {
  const adminEmail = process.env.ADMIN_SEED_EMAIL;
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  const userEmail = process.env.USER_SEED_EMAIL;
  const userPassword = process.env.USER_SEED_PASSWORD;
  if (!adminEmail || !adminPassword) {
    console.error("Set ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD in .env");
    process.exit(1);
  }
  if (!userEmail || !userPassword) {
    console.error("Set USER_SEED_EMAIL and USER_SEED_PASSWORD in .env (dummy end-user for login demo)");
    process.exit(1);
  }
  await connectDB();
  
  // Sync database tables
  await sequelize.sync({ alter: true });

  if (!(await Admin.findOne({ where: { email: adminEmail.toLowerCase() } }))) {
    const hash = await bcrypt.hash(adminPassword, 10);
    await Admin.create({ email: adminEmail.toLowerCase().trim(), password: hash });
    console.log("Seeded admin:", adminEmail);
  } else {
    console.log("Admin already exists:", adminEmail);
  }

  if (!(await User.findOne({ where: { email: userEmail.toLowerCase() } }))) {
    const hash = await bcrypt.hash(userPassword, 10);
    await User.create({ email: userEmail.toLowerCase().trim(), password: hash });
    console.log("Seeded demo user:", userEmail);
  } else {
    console.log("Demo user already exists:", userEmail);
  }

  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
