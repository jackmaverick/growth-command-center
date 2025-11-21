import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";

const stageMap: Record<string, string> = {
    "Lead": "Lead",
    "Contacting": "Lead",
    "Appointment Scheduled": "Lead",
    "Needs Rescheduling": "Lead",
    "Estimating": "Estimating",
    "Estimate Sent": "Estimating",
    "Bob's Estimate Sent": "Estimating",
    "Signed Contract": "Sold",
    "Pre-Production": "Production",
    "Ready for Install": "Production",
    "Job Scheduled": "Production",
    "In Progress": "Production",
    "Job Completed": "Production",
    "Final Walk Through": "Production",
    "Invoiced Customer": "Invoicing",
    "Back End Audit": "Invoicing",
    "Pay the Crew": "Invoicing",
    "Bob's Collection": "Invoicing",
    "Paid & Closed": "Completed",
    "Request Review": "Completed",
    "Hold": "Lost",
    "Rehash": "Lost",
    "Lost": "Lost",
};

function toDate(epochSeconds?: number | null) {
    if (!epochSeconds) return null;
    return new Date(epochSeconds * 1000);
}

export async function POST(request: NextRequest) {
    try {
        const configuredSecret = process.env.JOBNIMBUS_WEBHOOK_SECRET;
        if (configuredSecret) {
            const headerSecret = request.headers.get("x-jn-secret");
            if (headerSecret !== configuredSecret) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
        }

        const envelope = await request.json();
        const job = envelope.body ?? envelope;

        if (!job || job.type !== "job") {
            return NextResponse.json({ skipped: true, reason: "Not a job payload" });
        }

        if (job.record_type_name !== "Roof Replacement") {
            return NextResponse.json({ skipped: true, reason: "Non-roof workflow" });
        }

        const stage = stageMap[job.status_name] || "Unknown";

        const pool = getPool();
        const client = await pool.connect();

        const tags = Array.isArray(job.tags) ? job.tags : [];
        const owners = Array.isArray(job.owners) ? job.owners : [];
        const ownerIds = owners.map((o: any) => o?.id ?? o);

        const dateCreated = toDate(job.date_created);
        const dateStatusChange = toDate(job.date_status_change ?? job.date_updated ?? job.date_created);

        const isWon = ["Sold", "Production", "Invoicing", "Completed"].includes(stage);
        const isClosed = ["Completed", "Lost"].includes(stage);
        const isLost = stage === "Lost";

        try {
            await client.query("BEGIN");

            await client.query(
                `
                INSERT INTO jobs (
                    id, number, record_type_name, status_name, stage,
                    primary_contact_id, sales_rep_id, source_name,
                    date_created, date_status_change,
                    tags, owners, raw, updated_at,
                    is_won, is_closed, is_lost
                ) VALUES (
                    $1, $2, $3, $4, $5,
                    $6, $7, $8,
                    $9, $10,
                    $11, $12, $13, NOW(),
                    $14, $15, $16
                )
                ON CONFLICT (id) DO UPDATE SET
                    status_name = EXCLUDED.status_name,
                    stage = EXCLUDED.stage,
                    primary_contact_id = EXCLUDED.primary_contact_id,
                    sales_rep_id = EXCLUDED.sales_rep_id,
                    source_name = EXCLUDED.source_name,
                    date_status_change = EXCLUDED.date_status_change,
                    tags = EXCLUDED.tags,
                    owners = EXCLUDED.owners,
                    is_won = EXCLUDED.is_won,
                    is_closed = EXCLUDED.is_closed,
                    is_lost = EXCLUDED.is_lost,
                    raw = EXCLUDED.raw,
                    updated_at = NOW()
            `,
                [
                    job.jnid,
                    job.number ?? null,
                    job.record_type_name ?? null,
                    job.status_name ?? null,
                    stage,
                    job.primary?.id ?? null,
                    job.sales_rep ?? job.sales_rep_name ?? null,
                    job.source_name ?? null,
                    dateCreated,
                    dateStatusChange,
                    JSON.stringify(tags),
                    JSON.stringify(ownerIds),
                    job,
                    isWon,
                    isClosed,
                    isLost,
                ],
            );

            await client.query(
                `
                INSERT INTO job_status_history (job_id, status_name, stage, changed_at)
                VALUES ($1, $2, $3, $4)
            `,
                [job.jnid, job.status_name ?? null, stage, dateStatusChange],
            );

            await client.query("COMMIT");
        } catch (dbErr) {
            await client.query("ROLLBACK");
            throw dbErr;
        } finally {
            client.release();
        }

        return NextResponse.json({ ok: true, stage });
    } catch (error) {
        console.error("Webhook handler error", error);
        return NextResponse.json(
            {
                error: "Failed to process webhook",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 },
        );
    }
}
