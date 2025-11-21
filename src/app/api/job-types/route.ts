import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
    try {
        const aggregates = await sql`
            SELECT
                record_type_name,
                COUNT(*) AS total_jobs,
                COUNT(*) FILTER (WHERE stage = 'Lead') AS leads,
                COUNT(*) FILTER (WHERE stage = 'Estimating') AS estimating,
                COUNT(*) FILTER (WHERE stage = 'Sold') AS sold,
                COUNT(*) FILTER (WHERE stage = 'Production') AS production,
                COUNT(*) FILTER (WHERE stage = 'Invoicing') AS invoicing,
                COUNT(*) FILTER (WHERE stage = 'Completed') AS completed,
                COUNT(*) FILTER (WHERE stage = 'Lost') AS lost
            FROM jobs
            GROUP BY record_type_name
            ORDER BY record_type_name;
        `;

        const velocity = await sql`
            WITH lead_times AS (
                SELECT
                    j.record_type_name,
                    j.id AS job_id,
                    MIN(CASE WHEN h.stage = 'Lead' THEN h.changed_at END) AS lead_at,
                    MIN(CASE WHEN h.stage = 'Sold' THEN h.changed_at END) AS sold_at
                FROM jobs j
                LEFT JOIN job_status_history h ON h.job_id = j.id
                GROUP BY j.record_type_name, j.id
            )
            SELECT
                record_type_name,
                AVG(EXTRACT(EPOCH FROM (sold_at - lead_at)) / 86400.0) AS avg_days_to_sold
            FROM lead_times
            WHERE lead_at IS NOT NULL AND sold_at IS NOT NULL
            GROUP BY record_type_name;
        `;

        const history = await sql`
            SELECT
                j.record_type_name,
                h.job_id,
                h.status_name,
                h.changed_at
            FROM job_status_history h
            JOIN jobs j ON j.id = h.job_id
            WHERE j.record_type_name IS NOT NULL
            ORDER BY h.job_id, h.changed_at
        `;

        const statusFlow = [
            "Lead",
            "Contacting",
            "Appointment Scheduled",
            "Estimating",
            "Estimate Sent",
            "Signed Contract",
            "Pre-Production",
            "Ready for Install",
            "Job Scheduled",
            "In Progress",
            "Job Completed",
            "Paid & Closed",
        ];

        type ConversionCounts = { attempts: number; conversions: number };
        const conversionMap = new Map<string, Map<string, ConversionCounts>>();

        // Initialize map for each record type we have aggregates for
        (aggregates.rows ?? []).forEach((row) => {
            const rt = row.record_type_name;
            const steps = new Map<string, ConversionCounts>();
            for (let i = 0; i < statusFlow.length - 1; i++) {
                const key = `${statusFlow[i]} → ${statusFlow[i + 1]}`;
                steps.set(key, { attempts: 0, conversions: 0 });
            }
            conversionMap.set(rt, steps);
        });

        // Build status sequences per job
        const jobHistory = new Map<string, { recordType: string; statuses: string[] }>();
        (history.rows ?? []).forEach((row) => {
            const jobId = row.job_id as string;
            const recordType = row.record_type_name as string;
            if (!jobHistory.has(jobId)) {
                jobHistory.set(jobId, { recordType, statuses: [] });
            }
            jobHistory.get(jobId)!.statuses.push(row.status_name);
        });

        // Tally conversions
        jobHistory.forEach(({ recordType, statuses }) => {
            const steps = conversionMap.get(recordType);
            if (!steps) return;
            for (let i = 0; i < statusFlow.length - 1; i++) {
                const from = statusFlow[i];
                const to = statusFlow[i + 1];
                const key = `${from} → ${to}`;
                const counts = steps.get(key);
                if (!counts) continue;
                const startIdx = statuses.findIndex((s) => s === from);
                if (startIdx >= 0) {
                    counts.attempts += 1;
                    const endIdx = statuses.findIndex((s, idx) => idx > startIdx && s === to);
                    if (endIdx > startIdx) {
                        counts.conversions += 1;
                    }
                }
            }
        });

        const velocityMap = new Map<string, number>();
        (velocity.rows ?? []).forEach((row) => {
            velocityMap.set(row.record_type_name, Number(row.avg_days_to_sold));
        });

        const result = (aggregates.rows ?? []).map((row) => {
            const leads = Number(row.leads) || 0;
            const sold = Number(row.sold) || 0;
            const completed = Number(row.completed) || 0;
            const total = Number(row.total_jobs) || 0;

            const conversion = leads > 0 ? Math.round((sold / leads) * 100) : 0;
            const winRate = leads > 0 ? Math.round((completed / leads) * 100) : 0;

            const convSteps = conversionMap.get(row.record_type_name) ?? new Map();
            const ladder = Array.from(convSteps.entries()).map(([step, counts]) => ({
                step,
                attempts: counts.attempts,
                conversions: counts.conversions,
                conversionRate: counts.attempts > 0 ? Math.round((counts.conversions / counts.attempts) * 100) : 0,
            }));

            return {
                recordType: row.record_type_name,
                totals: {
                    total,
                    leads: Number(row.leads) || 0,
                    estimating: Number(row.estimating) || 0,
                    sold,
                    production: Number(row.production) || 0,
                    invoicing: Number(row.invoicing) || 0,
                    completed,
                    lost: Number(row.lost) || 0,
                },
                conversionRate: conversion,
                winRate,
                avgDaysToSold: velocityMap.get(row.record_type_name) ?? null,
                conversionLadder: ladder,
            };
        });

        return NextResponse.json({ jobTypes: result });
    } catch (error) {
        console.error("job-types API error", error);
        return NextResponse.json(
            {
                error: "Failed to load job type metrics",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 },
        );
    }
}
