import { WebSocketServer, WebSocket } from "ws";
import { getWsArcjet } from "../arcjet.js";

const matchsSubscriptions = new Map();

function subscribe(matchId, socket) {
  if (!matchsSubscriptions.has(matchId)) {
    matchsSubscriptions.set(matchId, new Set());
  }
  matchsSubscriptions.get(matchId).add(socket);
}

function unsubscribe(matchId, socket) {
  const subs = matchsSubscriptions.get(matchId);
  if (!subs) return;

  subs.delete(socket);

  // FIX: was `Subscription == 0`, should be `subs.size === 0`
  if (subs.size === 0) {
    matchsSubscriptions.delete(matchId);
  }
}

function broadcastToMatchSubscribers(matchId, payload) {
  const subs = matchsSubscriptions.get(matchId);
  if (!subs || subs.size === 0) return;

  const message = JSON.stringify(payload);
  for (const client of subs) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// FIX: moved out of broadcastToMatchSubscribers
function cleanupSubscriptions(socket) {
  for (const matchId of socket.subscriptions) {
    unsubscribe(matchId, socket);
  }
}

// FIX: moved out of broadcastToMatchSubscribers
function handleMessage(socket, data) {
  let message;

  try {
    message = JSON.parse(data.toString());
  } catch (err) {
    sendJson(socket, { type: "error", message: "Invalid JSON" }); // FIX: typo "Ivalid"
    return;
  }

  if (message.type === "subscribe" && Number.isInteger(message.matchId)) {
    subscribe(message.matchId, socket);
    socket.subscriptions.add(message.matchId); // FIX: was socket.Subscription
    sendJson(socket, { type: "subscribed", matchId: message.matchId });
  }

  if (message.type === "unsubscribe" && Number.isInteger(message.matchId)) {
    unsubscribe(message.matchId, socket);
    socket.subscriptions.delete(message.matchId); // FIX: was socket.Subscription
    sendJson(socket, { type: "unsubscribed", matchId: message.matchId });
  }
}

// FIX: moved out of handleMessage
function sendJson(socket, payload) {
  try {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
    }
  } catch (err) {
    console.error("Send error:", err);
  }
}

// FIX: moved out of handleMessage
function broadcast(wss, payload, exceptSocket = null) {
  const message = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== exceptSocket) {
      client.send(message);
    }
  });
}

// FIX: moved out of handleMessage; export keyword is now at the top level
export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 1024 * 1024,
  });

  console.log("✅ WebSocket server started at ws://localhost:3000/ws");

  // FIX: wsArcjet was used but never defined
  const wsArcjet = getWsArcjet();

  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((socket) => {
      if (socket.isAlive === false) {
        return socket.terminate();
      }
      socket.isAlive = false;
      socket.ping();
    });
  }, 30000);

  wss.on("connection", async (socket, req) => {
    if (wsArcjet) {
      try {
        const decision = await wsArcjet.protect(req);
        if (decision.isDenied) {
          const code = decision.reason.isRateLimit() ? 1013 : 1008;
          const reason = decision.reason.isRateLimit()
            ? "Rate limit exceeded"
            : "Forbidden";
          console.log(`Connection denied: ${reason}`);
          socket.close(code, reason);
          return;
        }
      } catch (error) {
        console.error("WebSocket Arcjet error:", error);
        socket.close(1011, "Internal Server Error");
        return;
      }
    }

    socket.isAlive = true;
    socket.subscriptions = new Set(); // FIX: initialize subscriptions Set on the socket

    socket.on("pong", () => {
      socket.isAlive = true;
    });

    sendJson(socket, {
      type: "welcome",
      message: "Connected to WebSocket server",
    });

    // FIX: now actually calls handleMessage
    socket.on("message", (msg) => {
      handleMessage(socket, msg);
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });

    // FIX: now actually calls cleanupSubscriptions on disconnect
    socket.on("close", () => {
      console.log("❌ Client disconnected");
      cleanupSubscriptions(socket);
    });
  });

  wss.on("close", () => {
    clearInterval(heartbeatInterval);
  });

  function broadcastMatchCreated(match) {
    console.log("📢 Broadcasting new match");
    broadcast(wss, { type: "match_created", data: match });
  }

  function broadcastMatchUpdated(match) {
    broadcast(wss, { type: "match_updated", data: match });
  }

  return {
    broadcastMatchCreated,
    broadcastMatchUpdated,
    broadcastToMatchSubscribers,
    wss,
  };
}