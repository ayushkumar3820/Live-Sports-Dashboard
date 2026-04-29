import arcjet, { detectBot, shield, slidingWindow } from "arcjet";

let _httpArcjet = null;
let _wsArcjet = null;

function getClients() {
  if (_httpArcjet && _wsArcjet) return { httpArcjet: _httpArcjet, wsArcjet: _wsArcjet };

  const key = process.env.ARCJET_KEY;
  const mode = process.env.ARCJET_MODE === "LIVE" ? "LIVE" : "DRY_RUN";

  if (!key) {
    console.error("ARCJET_KEY is not set in environment variables.");
    process.exit(1);
  }

  _httpArcjet = arcjet({
    key,
    rules: [
      shield({ mode }),
      detectBot({ mode, allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"] }),
      slidingWindow({ mode, interval: "10s", max: 50 }),
    ],
  });

  _wsArcjet = arcjet({
    key,
    rules: [
      shield({ mode }),
      detectBot({ mode, allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"] }),
      slidingWindow({ mode, interval: "2s", max: 5 }),
    ],
  });

  return { httpArcjet: _httpArcjet, wsArcjet: _wsArcjet };
}

export const getWsArcjet = () => getClients().wsArcjet;

export const securityArcjetMiddleware = () => {
  return async (req, res, next) => {
    try {
      const { httpArcjet } = getClients();
      const decision = await httpArcjet.protect(req);

      if (decision.isDenied) {
        if (decision.reason.isRateLimit()) {
          return res.status(429).json({ error: "Too Many Requests" });
        }
        return res.status(403).json({ error: "Forbidden" });
      }
      next();
    } catch (error) {
      console.error("Error in Arcjet middleware:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
};