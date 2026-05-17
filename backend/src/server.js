const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const { DatabaseSync } = require("node:sqlite");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
const databasePath = path.resolve(
  __dirname,
  "..",
  process.env.DATABASE_PATH || "../database/data/portfolio.sqlite"
);

let db;

app.use(
  cors({
    origin: [
      frontendUrl,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3001",
      "http://localhost:5500",
    ],
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "portfolio-backend" });
});

app.post("/api/contact", async (req, res) => {
  const { username, email, phone = "", message = "" } = req.body;

  if (!username || !email || !message) {
    return res.status(400).json({
      message: "Please fill in your name, email, and message.",
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email." });
  }

  const contactMessage = {
    id: randomUUID(),
    username: username.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    message: message.trim(),
    createdAt: new Date().toISOString(),
  };

  db.prepare(
    `INSERT INTO contact_messages (id, username, email, phone, message, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    contactMessage.id,
    contactMessage.username,
    contactMessage.email,
    contactMessage.phone,
    contactMessage.message,
    contactMessage.createdAt
  );

  res.status(201).json({
    message: "Message received successfully.",
    data: contactMessage,
  });
});

app.get("/api/messages", async (req, res) => {
  const messages = db.prepare(
    `SELECT id, username, email, phone, message, created_at AS createdAt
     FROM contact_messages
     ORDER BY created_at DESC`
  ).all();

  res.json({ data: messages });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Something went wrong on the server." });
});

function initializeDatabase() {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  db = new DatabaseSync(databasePath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

try {
  initializeDatabase();

  app.listen(port, () => {
    console.log(`Portfolio backend running on http://localhost:${port}`);
    console.log(`SQLite database connected at ${databasePath}`);
  });
} catch (error) {
  console.error("Failed to initialize database", error);
  process.exit(1);
}
