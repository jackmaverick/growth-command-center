import {
    boolean,
    jsonb,
    pgTable,
    text,
    timestamp,
} from "drizzle-orm/pg-core";

export const jobs = pgTable("jobs", {
    id: text("id").primaryKey(),
    number: text("number"),
    recordTypeName: text("record_type_name"),
    statusName: text("status_name"),
    stage: text("stage"),
    primaryContactId: text("primary_contact_id"),
    salesRepId: text("sales_rep_id"),
    sourceName: text("source_name"),
    dateCreated: timestamp("date_created", { withTimezone: false }),
    dateStatusChange: timestamp("date_status_change", { withTimezone: false }),
    tags: text("tags").array(),
    owners: text("owners").array(),
    raw: jsonb("raw"),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow(),
    isWon: boolean("is_won"),
    isClosed: boolean("is_closed"),
    isLost: boolean("is_lost"),
});

export const jobStatusHistory = pgTable("job_status_history", {
    jobId: text("job_id"),
    statusName: text("status_name"),
    stage: text("stage"),
    changedAt: timestamp("changed_at", { withTimezone: false }),
});
