import { Router } from "express";
import { commentary } from "../database/schema.js";
import { db } from "../database/db.js";
import { matchIdParamSchema } from "../validation/matches.js";
import {
  createCommentarySchema,
  listCommentaryQuerySchema,
} from "../validation/commentary.js";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";

// FIX: mergeParams: true is required so this router can read :matchId
// from the parent route (/matches/:matchId/commentary)
const commentaryRouter = Router({ mergeParams: true });

commentaryRouter.get("/", async (req, res) => {
  const MAX_LIMIT = 100;

  const params = matchIdParamSchema.safeParse(req.params);
  if (!params.success) {
    return res.status(400).json({ error: params.error.errors });
  }

  const queryParams = listCommentaryQuerySchema.safeParse(req.query);
  if (!queryParams.success) {
    return res.status(400).json({ error: queryParams.error.errors });
  }

  const limit = Math.min(queryParams.data.limit ?? 100, MAX_LIMIT);

  try {
    const data = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, params.data.id))
      .orderBy(desc(commentary.createdAt))
      .limit(limit);

    return res.status(200).json({
      message: "Commentary list",
      data,
    });
  } catch (error) {
    // FIX: Added return so execution stops after sending the error response
    return res.status(500).json({ error: error.message });
  }
});

// FIX: Removed /:matchId sub-route — the matchId already comes from the
// parent mount path (/matches/:matchId/commentary). Using /:matchId here
// created a duplicate param at /matches/:matchId/commentary/:matchId.
commentaryRouter.post("/", async (req, res) => {
  try {
    const params = matchIdParamSchema.parse(req.params);
    const body = createCommentarySchema.parse(req.body);

    const data = {
      matchId: params.id,
      // FIX: was body.minutes — field name is singular: body.minute
      minute: body.minute,
      sequence: body.sequence,
      period: body.period,
      eventType: body.eventType,
      actor: body.actor,
      team: body.team,
      message: body.message,
      metadata: body.metadata,
      tags: body.tags,
    };

    const result = await db.insert(commentary).values(data).returning();
    return res.status(201).json(result[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message });
  }
});

export { commentaryRouter };