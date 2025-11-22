import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
    return NextResponse.json({
        status: "ok",
        endpoint: "/api/webhooks/jobnimbus",
        timestamp: new Date().toISOString(),
        message: "JobNimbus webhook endpoint is active",
    });
}

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
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[${requestId}] JobNimbus webhook received`, {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
        timestamp: new Date().toISOString(),
    });

    try {
        const configuredSecret = process.env.JOBNIMBUS_WEBHOOK_SECRET;
        console.log(`[${requestId}] Secret check:`, {
            hasConfiguredSecret: !!configuredSecret,
            hasHeaderSecret: !!request.headers.get("x-jn-secret"),
        });

        if (configuredSecret) {
            const headerSecret = request.headers.get("x-jn-secret");
            if (headerSecret !== configuredSecret) {
                console.log(`[${requestId}] Auth failed: secret mismatch`);
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
        }

        const envelope = await request.json();
        console.log(`[${requestId}] Parsed payload:`, {
            hasBody: !!envelope.body,
            envelopeKeys: Object.keys(envelope),
            bodyKeys: envelope.body ? Object.keys(envelope.body) : null,
        });

        const job = envelope.body ?? envelope;

        console.log(`[${requestId}] Job data:`, {
            jnid: job.jnid,
            type: job.type,
            record_type_name: job.record_type_name,
            status_name: job.status_name,
            number: job.number,
        });

        if (!job || job.type !== "job") {
            console.log(`[${requestId}] Skipped: Not a job payload`, { type: job?.type });
            return NextResponse.json({ skipped: true, reason: "Not a job payload" });
        }

        // Accept all job record types (Roof Replacement, Insurance, Repairs, Real Estate, etc.)
        // Previously filtered to Roof Replacement only, which prevented other job types from being ingested

        const stage = stageMap[job.status_name] || "Unknown";
        console.log(`[${requestId}] Processing job:`, {
            jnid: job.jnid,
            status: job.status_name,
            stage,
        });

        const pool = getPool();
        const client = await pool.connect();

        const tags: string[] = Array.isArray(job.tags) ? job.tags : [];
        const owners: any[] = Array.isArray(job.owners) ? job.owners : [];
        const ownerIds: string[] = owners.map((o: any) => o?.id ?? o).filter(Boolean);

        // Contacts are not ingested yet; avoid FK violation by leaving primary_contact_id null
        const primaryContactId: string | null = null;

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
                    primaryContactId,
                    job.sales_rep ?? job.sales_rep_name ?? null,
                    job.source_name ?? null,
                    dateCreated,
                    dateStatusChange,
                    tags,
                    ownerIds,
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
            console.log(`[${requestId}] DB transaction committed successfully`);
        } catch (dbErr) {
            await client.query("ROLLBACK");
            console.error(`[${requestId}] DB error:`, dbErr);
            throw dbErr;
        } finally {
            client.release();
        }

        console.log(`[${requestId}] Webhook processed successfully`, { stage });
        return NextResponse.json({ ok: true, stage });
    } catch (error) {
        console.error(`[${requestId}] Webhook handler error:`, error);
        return NextResponse.json(
            {
                error: "Failed to process webhook",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 },
        );
    }
}
