import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const db = new Database("productivity.db");

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'todo',
    due_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS lectures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL,
    topic TEXT,
    attendance_status TEXT,
    date TEXT,
    completed INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS internship_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT,
    hours REAL
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    progress INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS focus_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    duration INTEGER,
    type TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Assistant Endpoint
  app.post("/api/ai/chat", async (req, res) => {
    const { message, context } = req.body;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `User Message: ${message}\nContext: ${JSON.stringify(context)}`,
        config: {
          systemInstruction: "You are the Darshan Productivity OS AI Assistant. You help an AI & Data Science student manage their tasks, lectures, and projects. Provide concise, professional, and actionable advice.",
        }
      });
      const response = await model;
      res.json({ text: response.text });
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Failed to generate AI response" });
    }
  });

  // Tasks API
  app.get("/api/tasks", (req, res) => {
    const tasks = db.prepare("SELECT * FROM tasks ORDER BY created_at DESC").all();
    res.json(tasks);
  });

  app.post("/api/tasks", (req, res) => {
    const { title, description, priority, status, due_date } = req.body;
    const info = db.prepare(
      "INSERT INTO tasks (title, description, priority, status, due_date) VALUES (?, ?, ?, ?, ?)"
    ).run(title, description, priority, status, due_date);
    res.json({ id: info.lastInsertRowid });
  });

  app.patch("/api/tasks/:id", (req, res) => {
    const { status, priority } = req.body;
    if (status) db.prepare("UPDATE tasks SET status = ? WHERE id = ?").run(status, req.params.id);
    if (priority) db.prepare("UPDATE tasks SET priority = ? WHERE id = ?").run(priority, req.params.id);
    res.json({ success: true });
  });

  // Lectures API
  app.get("/api/lectures", (req, res) => {
    const lectures = db.prepare("SELECT * FROM lectures ORDER BY date DESC").all();
    res.json(lectures);
  });

  app.post("/api/lectures", (req, res) => {
    const { subject, topic, date } = req.body;
    db.prepare("INSERT INTO lectures (subject, topic, date) VALUES (?, ?, ?)").run(subject, topic, date);
    res.json({ success: true });
  });

  app.patch("/api/lectures/:id", (req, res) => {
    const { attendance_status } = req.body;
    db.prepare("UPDATE lectures SET attendance_status = ? WHERE id = ?").run(attendance_status, req.params.id);
    res.json({ success: true });
  });

  // Projects API
  app.get("/api/projects", (req, res) => {
    const projects = db.prepare("SELECT * FROM projects").all();
    res.json(projects);
  });

  // Analytics API
  app.get("/api/analytics", (req, res) => {
    const taskStats = db.prepare("SELECT status, COUNT(*) as count FROM tasks GROUP BY status").all();
    const focusStats = db.prepare("SELECT date(date) as day, SUM(duration) as total_duration FROM focus_sessions GROUP BY day LIMIT 7").all();
    res.json({ taskStats, focusStats });
  });

  // Focus Sessions API
  app.post("/api/focus", (req, res) => {
    const { duration, type } = req.body;
    db.prepare("INSERT INTO focus_sessions (duration, type) VALUES (?, ?)").run(duration, type);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
