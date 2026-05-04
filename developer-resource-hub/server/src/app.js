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
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins for now to resolve CORS issues
    callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
app.use(express.json());

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

app.use(notFound);
app.use(errorHandler);

export default app;
