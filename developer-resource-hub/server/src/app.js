import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import userContentRoutes from "./routes/userContentRoutes.js";
import researchRoutes from "./routes/researchRoutes.js";
import githubRoutes from "./routes/githubRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import adRoutes from "./routes/adRoutes.js";
import toolkitRoutes from "./routes/toolkitRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  if (req.headers.authorization) {
    console.log(`Auth Header present: ${req.headers.authorization.substring(0, 15)}...`);
  } else {
    console.log("No Auth Header present");
  }
  next();
});
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/user", userContentRoutes);
app.use("/api/research", researchRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/ads", adRoutes);
app.use("/api/toolkits", toolkitRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
