import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(process.env.PG_URI, {
  dialect: "postgres",
  logging: false, // Set to console.log to see SQL queries
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected via Sequelize");
    // Sync models
    // await sequelize.sync({ alter: true }); 
  } catch (err) {
    console.error("PostgreSQL connection error:", err);
    throw err;
  }
}

export default sequelize;
