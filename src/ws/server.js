import { WebSocketServer, WebSocket } from "ws";
import { getWsArcjet } from "../arcjet.js";

function sendJson(socket, payload) {
  try {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
    }
  } catch (err) {
    console.error("Send error:", err);
  }
}

function broadcast(wss, payload, exceptSocket = null) {
  const message = JSON.stringify(payload);

  wss.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      client !== exceptSocket
    ) {
      client.send(message);
    }
  });
}

export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 1024 * 1024,
  });

  console.log("✅ WebSocket server started at ws://localhost:3000/ws");

  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((socket) => {
      if (socket.isAlive === false) {
        return socket.terminate();
      }

      socket.isAlive = false;
      socket.ping();
    });
  }, 30000);

  wss.on("connection",async (socket,req) => {
    if (wsArcjet){
      try{
        const decision = await wsArcjet.protect(req);
        if (decision.isDenied){
          const code = decision.reason.isRateLimit() ? 1013 : 1008; // 1013: Try Again Later, 1008: Policy Violation
          const close= decision.reason.isRateLimit() ? "Rate limit exceeded" : "Forbidden";
          console.log(`Connection denied: ${close}`);
          socket.close(code, close);
          return;
        }

      }catch(error){
        console.error("WebSocket Arcjet error:", error);
        socket.close(1011, "Internal Server Error");
      }
    }
    socket.isAlive = true;

    socket.on("pong", () => {
      socket.isAlive = true;
    });

    sendJson(socket, {
      type: "welcome",
      message: "Connected to WebSocket server",
    });

    socket.on("message", (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        console.log("📩 Received:", data);
      } catch (err) {
        console.error("Invalid JSON:", err);
      }
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });

    socket.on("close", () => {
      console.log("❌ Client disconnected");
    });
  });

  function broadcastMatchCreated(match) {
    console.log("📢 Broadcasting new match");
    broadcast(wss, {
      type: "match_created",
      data: match,
    });
  }

  function broadcastMatchUpdated(match) {
    broadcast(wss, {
      type: "match_updated",
      data: match,
    });
  }

  wss.on("close", () => {
    clearInterval(heartbeatInterval);
  });

  return {
    broadcastMatchCreated,
    broadcastMatchUpdated,
    wss,
  };
}