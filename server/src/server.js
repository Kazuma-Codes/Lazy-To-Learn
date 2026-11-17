import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import Message from "./Message.js";
import { translateToEnglish } from "./translate.js";

const app = express();
app.use(express.json());

app.get("/api/messages", async (_req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json(messages.reverse());
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Could not load messages" });
  }
});

app.post("/api/messages", async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const text = String(req.body?.text ?? "").trim();

  if (!name || !text) {
    return res.status(400).json({ error: "Name and message are required" });
  }
  if (name.length > 40 || text.length > 1000) {
    return res.status(400).json({ error: "Name max 40 chars, message max 1000 chars" });
  }

  try {
    const translated = await translateToEnglish(text);
    const message = await Message.create({ name, text: translated });
    res.status(201).json(message);
  } catch (err) {
    console.error(err.message);
    res.status(502).json({ error: "Translation failed. Check the server log and GROQ_API_KEY." });
  }
});

const port = process.env.PORT || 5000;
let mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/new_mern_stack";

try {
  if (process.env.USE_MEMORY_DB === "true") {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const memoryDb = await MongoMemoryServer.create();
    mongoUrl = memoryDb.getUri("new_mern_stack");
    console.log("Using in-memory MongoDB (data is lost on restart)");
  }

  await mongoose.connect(mongoUrl, { serverSelectionTimeoutMS: 5000 });
  app.listen(port, () => console.log(`API on http://localhost:${port}`));
} catch (err) {
  console.error("Could not start:", err.message);
  process.exit(1);
}
