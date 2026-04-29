// ================= IMPORTS =================
import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
dotenv.config();

import { matchesRouter } from "./router/Matchs.js";
import { attachWebSocketServer } from "./ws/server.js";
import { securityArcjetMiddleware } from "./arcjet.js";

// ================= APP SETUP =================
const app = express();

// Env values
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

// Create HTTP server for both Express + WebSocket
const server = http.createServer(app);

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= ROUTES =================
app.get("/", (req, res) => {
  res.send("Hello World!");
});


app.use(securityArcjetMiddleware());
app.use("/matches", matchesRouter);

// ================= WEBSOCKET SETUP =================
const { broadcastMatchCreated, broadcastMatchUpdated } = attachWebSocketServer(server);

app.locals.broadcastMatchCreated = broadcastMatchCreated;
app.locals.broadcastMatchUpdated = broadcastMatchUpdated;

// ================= START SERVER =================
server.listen(PORT, HOST, () => {
  const baseUrl =
    HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;

  console.log(`🚀 Server running at ${baseUrl}`);
  console.log(`📡 WebSocket running at ws://localhost:${PORT}/ws`);
});