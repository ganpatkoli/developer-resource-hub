import express from "express";
import cors from "cors";
import helmet from "helmet";
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

app.use(helmet({
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  crossOriginEmbedderPolicy: { policy: "require-corp" },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-origin" },
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      "connect-src": ["'self'", "*"],
    },
  },
}));

// Strict CORS: Only allow your website to communicate with the API
app.use(cors({
  origin: ["https://aiguardian.cloud", "https://api.aiguardian.cloud", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-Client-Secure"]
}));

// Security Middleware to prevent direct API access
app.use((req, res, next) => {
  // Allow health check without key
  if (req.path === "/api/health") return next();

  const clientSecureKey = req.headers["x-client-secure"];
  const serverSecureKey = process.env.API_SECURITY_KEY;

  // Check if the request has the correct security key
  if (!clientSecureKey || clientSecureKey !== serverSecureKey) {
    console.warn(`Unauthorized API access attempt from: ${req.ip} | Origin: ${req.headers.origin}`);
    return res.status(403).json({ 
      error: "Direct API access is not allowed. Please use the official website.",
      status: "SECURITY_BLOCK"
    });
  }

  next();
});

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
