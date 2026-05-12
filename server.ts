import express from "express";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use process.cwd() to resolve paths relative to the project root
  const rootDir = process.cwd();
  const distPath = path.join(rootDir, "dist");

  // API routes can go here if needed in the future
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built files from the dist directory
    app.use(express.static(distPath));
    
    // Handle SPA routing: serve index.html for any unknown routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
