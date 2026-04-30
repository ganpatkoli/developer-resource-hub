export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err.name === "CastError" && err.kind === "ObjectId") {
    return res.status(400).json({ message: "Invalid ID format" });
  }
  if (err.code === 11000) {
    return res.status(400).json({ message: "Duplicate value — that record already exists" });
  }
  const status = err.statusCode || 500;
  const message = err.message || "Server error";
  console.error(err);
  res.status(status).json({ message, ...(process.env.NODE_ENV === "development" && { stack: err.stack }) });
}
