import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

const STAGES = ["Lead", "Estimating", "Sold", "Production", "Accounts Receivable", "Completed"];

type StageConversionData = {
  recordType: string;
  totalJobs: number;
  stages: Array<{
    name: string;
    count: number;
    conversionToNext: number;
  }>;
};

async function getDateRange(period: string): Promise<{ start: Date; end: Date }> {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case "weekly":
      start.setDate(end.getDate() - 7);
      break;
    case "monthly":
      start.setMonth(end.getMonth() - 1);
      break;
    case "quarterly":
      start.setMonth(end.getMonth() - 3);
      break;
    case "yearly":
      start.setFullYear(end.getFullYear() - 1);
      break;
    default:
      start.setMonth(end.getMonth() - 1); // Default to monthly
  }

  return { start, end };
}

async function calculateStageConversions(
  pool: any,
  recordTypeFilter?: string
): Promise<StageConversionData> {
  // Get job counts at each stage
  let query = `
    SELECT stage, COUNT(*) as count
    FROM jobs
    WHERE stage IS NOT NULL
  `;

  const params: any[] = [];

  if (recordTypeFilter && recordTypeFilter !== "All") {
    query += ` AND record_type_name = $1`;
    params.push(recordTypeFilter);
  }

  query += ` GROUP BY stage ORDER BY stage`;

  const stageCounts = await pool.query(query, params);

  // Build stage count map
  const stageCountMap = new Map<string, number>();
  stageCounts.rows.forEach((row: any) => {
    stageCountMap.set(row.stage, row.count);
  });

  // Get total jobs
  const totalCount = stageCounts.rows.reduce((sum: number, row: any) => sum + row.count, 0);

  // Calculate conversions between stages
  const stages = STAGES.map((stage, idx) => {
    const count = stageCountMap.get(stage) || 0;
    let conversionToNext = 0;

    if (idx < STAGES.length - 1) {
      const nextStage = STAGES[idx + 1];
      const nextCount = stageCountMap.get(nextStage) || 0;
      if (count > 0) {
        conversionToNext = Math.round((nextCount / count) * 100);
      }
    }

    return {
      name: stage,
      count,
      conversionToNext,
    };
  });

  return {
    recordType: recordTypeFilter || "All",
    totalJobs: totalCount,
    stages,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "monthly";

    const pool = getPool();

    // Get all unique record types
    const recordTypesResult = await pool.query(`
      SELECT DISTINCT record_type_name
      FROM jobs
      WHERE record_type_name IS NOT NULL
      ORDER BY record_type_name
    `);

    const recordTypes = recordTypesResult.rows.map((row: any) => row.record_type_name);

    // Calculate conversions for each record type
    const conversions: StageConversionData[] = [];

    for (const recordType of recordTypes) {
      const data = await calculateStageConversions(pool, recordType);
      conversions.push(data);
    }

    // Calculate conversions for all jobs combined
    const allJobsData = await calculateStageConversions(pool);

    // Put all jobs at the beginning
    conversions.unshift(allJobsData);

    return NextResponse.json({
      stageConversions: conversions,
      period,
      stages: STAGES,
    });
  } catch (error) {
    console.error("Failed to fetch stage conversions:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch stage conversions",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
