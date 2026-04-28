import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";


// 🔹 ENUM for match status
export const matchStatusEnum = pgEnum("match_status", [
  "scheduled",
  "live",
  "finished",
]);


// 🔹 MATCHES TABLE
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),

  sport: text("sport").notNull(),

  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),

  status: matchStatusEnum("status")
    .notNull()
    .default("scheduled"),

  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),

  homeScore: integer("home_score")
    .notNull()
    .default(0),

  awayScore: integer("away_score")
    .notNull()
    .default(0),

  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),
});


// 🔹 COMMENTARY TABLE
export const commentary = pgTable("commentary", {
  id: serial("id").primaryKey(),

  matchId: integer("match_id")
    .notNull()
    .references(() => matches.id),

  minute: integer("minute"),

  sequence: integer("sequence"), // order of events

  period: text("period"), // e.g. "1st Half", "2nd Half"

  eventType: text("event_type"), // goal, foul, etc.

  actor: text("actor"), // player name
  team:text("team").notNull(),
  message: text("message").notNull(),
  metadata:jsonb("metadata"),
  tags:text("tags").array(), // e.g. ["goal", "penalty"]

  description: text("description"),

  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),
});