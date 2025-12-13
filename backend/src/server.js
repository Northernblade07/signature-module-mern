// src/server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();
import pdfRoutes from "./routes/pdf.route.js";
import { connectDb } from "./lib/db.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS: in prod, restrict origin to your frontend URL
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: false,
  })
);

// Body parsers
app.use(
  bodyParser.json({
    limit: "20mb",
  })
);
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "20mb",
    parameterLimit: 1000,
  })
);

// Static files for original & signed PDFs
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/", pdfRoutes);

// Start server only after DB connect attempt
const PORT = process.env.PORT || 4000;

async function start() {
  try {
    console.log("MONGO_URI:", process.env.MONGO_URI);
    await connectDb();
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
