// ================= IMPORTS =================
import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
dotenv.config();

import { matchesRouter } from "./router/Matchs.js";
import { attachWebSocketServer } from "./ws/server.js";
import { securityArcjetMiddleware } from "./arcjet.js";
import { commentaryRouter } from "./router/commentary.js";

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

// FIX: Move Arcjet BEFORE routes so ALL routes are protected,
// including GET "/". Previously it was placed after the root route.
app.use(securityArcjetMiddleware());

// ================= ROUTES =================
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/matches", matchesRouter);

// FIX: Use :matchId to match the param name expected by commentaryRouter.
// Previously used :id which caused a param name mismatch.
app.use("/matches/:matchId/commentary", commentaryRouter);

// ================= WEBSOCKET SETUP =================
const { broadcastMatchCreated, broadcastMatchUpdated } =
  attachWebSocketServer(server);

app.locals.broadcastMatchCreated = broadcastMatchCreated;
app.locals.broadcastMatchUpdated = broadcastMatchUpdated;

// ================= START SERVER =================
server.listen(PORT, HOST, () => {
  const baseUrl =
    HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;

  console.log(`🚀 Server running at ${baseUrl}`);
  console.log(`📡 WebSocket running at ws://localhost:${PORT}/ws`);
});