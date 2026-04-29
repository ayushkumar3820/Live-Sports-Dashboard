import { Router } from "express";
import { createMatchSchema, listMatchesSchema } from "../validation/matches.js";
import { matches } from "../database/schema.js";
import { db } from "../database/db.js";
import { desc } from "drizzle-orm";

export const matchesRouter = Router();

const MAX_LIMIT = 100;

const getMatchStatus = (start, end) => {
  const now = new Date();
  if (now < new Date(start)) return "upcoming";
  if (now > new Date(end)) return "finished";
  return "live";
};

matchesRouter.get("/", async (req, res) => {
  const parsed = listMatchesSchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.errors,
    });
  }

  const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

  try {
    const data = await db
      .select()
      .from(matches)
      .orderBy(desc(matches.createdAt))
      .limit(limit);

    return res.status(200).json({
      message: "Matches List",
      data,
    });
  } catch (e) {
    return res.status(500).json({
      error: "Failed to fetch matches",
    });
  }
});

matchesRouter.post("/", async (req, res) => {
  const parsed = createMatchSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.errors,
    });
  }

  try {
    const data = parsed.data;

    const [event] = await db
      .insert(matches)
      .values({
        ...data,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        homeScore: data.homeScore ?? 0,
        awayScore: data.awayScore ?? 0,
        status: getMatchStatus(data.startTime, data.endTime),
      })
      .returning();

    if (req.app.locals.broadcastMatchCreated) {
      req.app.locals.broadcastMatchCreated(event);
    }

    return res.status(201).json({
      message: "Match created successfully",
      data: event,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});