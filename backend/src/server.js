import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import pdfRoutes from "./routes/pdf.route.js";
import { connectDb } from "./lib/db.js";

dotenv.config();

// Fix __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({ origin: "*" }));
app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// static storage for pdfs and outputs
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", pdfRoutes);

// MongoDB connection
const PORT = process.env.PORT || 4000;


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    connectDb();
})