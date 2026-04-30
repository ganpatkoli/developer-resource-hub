import jwt from "jsonwebtoken";

const getSecret = () => {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set");
  return s;
};

function parseAuthHeader(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.split(" ")[1];
  try {
    return jwt.verify(token, getSecret());
  } catch {
    return false;
  }
}

/**
 * For mutating /categories and /posts — only admins.
 * Old tokens without `role` are treated as admin.
 */
export function requireAdmin(req, res, next) {
  const decoded = parseAuthHeader(req);
  if (decoded === null) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
  if (decoded === false) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
  const role = decoded.role;
  const isAdmin = !role || role === "admin";
  if (!isAdmin) {
    return res.status(403).json({ message: "Admin access only" });
  }
  req.adminId = decoded.id;
  next();
}

/** Only regular users can access these routes. */
export function requireUser(req, res, next) {
  const decoded = parseAuthHeader(req);
  if (decoded === null) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
  if (decoded === false) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
  if (decoded.role !== "user") {
    return res.status(403).json({ message: "User access only" });
  }
  req.userId = decoded.id;
  next();
}
