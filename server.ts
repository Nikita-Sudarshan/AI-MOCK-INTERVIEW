import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
// PDF Parser helper
const getPdfParser = () => {
  try {
    const pdf = require("pdf-parse");
    return pdf.default || pdf;
  } catch (e) {
    console.error("Failed to load pdf-parse:", e);
    return null;
  }
};

const pdfParser = getPdfParser();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for memory storage with file filter
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  }
});

// Lazy-initialized Gemini Client (Moved to frontend as per guidelines)

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "AI Interview Pro Backend is ready!" });
  });

  // Resume Upload & Parse
  app.post("/api/resume/upload", upload.single("resume"), async (req, res) => {
    console.log("Received resume upload request:", req.file?.originalname);
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      if (!pdfParser || typeof pdfParser !== 'function') {
        console.error("pdf-parse is not a function or not loaded properly.");
        return res.status(500).json({ error: "PDF parser configuration error. Service temporary unavailable." });
      }

      console.log("Parsing PDF buffer...");
      const data = await pdfParser(req.file.buffer);
      console.log("PDF parsed successfully, text length:", data.text?.length);
      res.json({ text: data.text });
    } catch (error: any) {
      console.error("Resume Parse Error:", error);
      
      // Map specific PDF library errors to cleaner messages
      let message = "Failed to parse resume";
      const errorStr = error?.toString() || "";
      
      if (errorStr.includes("InvalidPDFException") || errorStr.includes("hr")) {
        message = "Invalid or corrupted PDF file";
      } else if (errorStr.includes("FormatError") || errorStr.includes("dr")) {
        message = "Unsupported PDF format";
      } else if (errorStr.includes("AbortException") || errorStr.includes("gr")) {
        message = "PDF parsing was interrupted";
      }
      
      res.status(500).json({ error: message, details: errorStr });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serving static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
