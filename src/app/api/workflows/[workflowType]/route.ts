import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// Legacy mock data as fallback
const workflowData: Record<string, any> = {
  "roof-replacement": {
    overallConversion: 35,
    avgCycleTime: 24,
    activeJobs: 47,
    ytdRevenue: 245000,
    conversions: {
      "Lead": 85,
      "Contacting": 78,
      "Appointment Scheduled": 92,
      "Estimating": 88,
      "Estimate Sent": 45,
      "Signed Contract": 95,
      "Pre-Production": 98,
      "Ready for Install": 100,
      "Job Scheduled": 98,
      "In Progress": 95,
      "Job Completed": 92,
      "Invoiced Customer": 88,
      "Paid & Closed": 100,
    },
    avgDays: {
      "Lead": 2,
      "Contacting": 3,
      "Appointment Scheduled": 5,
      "Estimating": 4,
      "Estimate Sent": 7,
      "Signed Contract": 3,
      "Pre-Production": 5,
      "Ready for Install": 2,
      "Job Scheduled": 3,
      "In Progress": 4,
      "Job Completed": 2,
      "Invoiced Customer": 8,
      "Paid & Closed": 5,
    },
    statusCounts: {
      "Lead": 45,
      "Contacting": 38,
      "Appointment Scheduled": 29,
      "Estimating": 27,
      "Estimate Sent": 23,
      "Signed Contract": 10,
      "Pre-Production": 9,
      "Ready for Install": 9,
      "Job Scheduled": 8,
      "In Progress": 8,
      "Job Completed": 7,
      "Invoiced Customer": 6,
      "Paid & Closed": 5,
      "Request Review": 0,
    },
  },
  insurance: {
    overallConversion: 42,
    avgCycleTime: 35,
    activeJobs: 62,
    ytdRevenue: 387000,
    conversions: {
      "Lead": 82,
      "Contacting": 75,
      "Appointment Scheduled": 90,
      "Waiting on Adjuster": 85,
      "Estimating": 80,
      "Estimate Sent": 55,
      "Signed Contract": 93,
      "Supplementing": 88,
      "Pre-Production": 95,
      "Ready for Install": 98,
      "Job Scheduled": 97,
      "In Progress": 94,
      "Job Completed": 90,
      "Invoiced Insurance": 92,
      "Paid & Closed": 100,
    },
    avgDays: {
      "Lead": 2,
      "Contacting": 3,
      "Appointment Scheduled": 6,
      "Waiting on Adjuster": 12,
      "Estimating": 5,
      "Estimate Sent": 9,
      "Signed Contract": 4,
      "Supplementing": 8,
      "Pre-Production": 6,
      "Ready for Install": 3,
      "Job Scheduled": 4,
      "In Progress": 5,
      "Job Completed": 3,
      "Invoiced Insurance": 14,
      "Paid & Closed": 7,
    },
    statusCounts: {
      "Lead": 52,
      "Contacting": 42,
      "Appointment Scheduled": 38,
      "Waiting on Adjuster": 32,
      "Estimating": 27,
      "Estimate Sent": 21,
      "Signed Contract": 11,
      "Supplementing": 10,
      "Pre-Production": 9,
      "Ready for Install": 8,
      "Job Scheduled": 8,
      "In Progress": 7,
      "Job Completed": 6,
      "Invoiced Insurance": 5,
      "Paid & Closed": 5,
      "Request Review": 0,
    },
  },
  repairs: {
    overallConversion: 58,
    avgCycleTime: 12,
    activeJobs: 28,
    ytdRevenue: 89000,
    conversions: {
      "New Lead": 88,
      "Contacting": 82,
      "Appointment Scheduled": 90,
      "Estimating": 85,
      "Estimate Sent": 65,
      "Signed Contract": 95,
      "Repair Scheduled": 98,
      "Repair in Progress": 96,
      "Job Complete": 94,
      "Invoice Sent": 90,
      "Paid & Closed": 100,
    },
    avgDays: {
      "New Lead": 1,
      "Contacting": 2,
      "Appointment Scheduled": 3,
      "Estimating": 2,
      "Estimate Sent": 4,
      "Signed Contract": 2,
      "Repair Scheduled": 3,
      "Repair in Progress": 1,
      "Job Complete": 1,
      "Invoice Sent": 5,
      "Paid & Closed": 3,
    },
    statusCounts: {
      "New Lead": 32,
      "Contacting": 28,
      "Appointment Scheduled": 23,
      "Estimating": 20,
      "Estimate Sent": 17,
      "Signed Contract": 11,
      "Repair Scheduled": 10,
      "Repair in Progress": 9,
      "Job Complete": 8,
      "Invoice Sent": 7,
      "Paid & Closed": 6,
      "Request Review": 0,
    },
  },
  "real-estate": {
    overallConversion: 68,
    avgCycleTime: 18,
    activeJobs: 19,
    ytdRevenue: 156000,
    conversions: {
      "Lead": 90,
      "Contacting": 85,
      "Appointment Scheduled": 95,
      "Estimating": 92,
      "Estimate Sent": 75,
      "Signed Contract": 98,
      "Pre-Production": 97,
      "Ready for Install": 98,
      "Job Scheduled": 97,
      "In Progress": 95,
      "Job Complete": 93,
      "Invoice Sent": 95,
      "Paid & Closed": 100,
    },
    avgDays: {
      "Lead": 1,
      "Contacting": 2,
      "Appointment Scheduled": 3,
      "Estimating": 3,
      "Estimate Sent": 5,
      "Signed Contract": 2,
      "Pre-Production": 4,
      "Ready for Install": 2,
      "Job Scheduled": 3,
      "In Progress": 4,
      "Job Complete": 2,
      "Invoice Sent": 6,
      "Paid & Closed": 4,
    },
    statusCounts: {
      "Lead": 18,
      "Contacting": 16,
      "Appointment Scheduled": 13,
      "Estimating": 12,
      "Estimate Sent": 11,
      "Signed Contract": 8,
      "Pre-Production": 7,
      "Ready for Install": 7,
      "Job Scheduled": 6,
      "In Progress": 5,
      "Job Complete": 4,
      "Invoice Sent": 3,
      "Paid & Closed": 3,
      "Request Review": 0,
    },
  },
  "maintenance-plan": {
    overallConversion: 72,
    avgCycleTime: 8,
    activeJobs: 15,
    ytdRevenue: 34000,
    conversions: {
      "Lead": 92,
      "Contacting": 88,
      "Appointment Scheduled": 95,
      "Estimating": 90,
      "Estimate Sent": 80,
      "Signed Contract": 98,
      "Plan Active": 100,
      "Invoice Sent": 95,
      "Paid & Closed": 100,
    },
    avgDays: {
      "Lead": 1,
      "Contacting": 2,
      "Appointment Scheduled": 2,
      "Estimating": 1,
      "Estimate Sent": 3,
      "Signed Contract": 1,
      "Plan Active": 365,
      "Invoice Sent": 4,
      "Paid & Closed": 2,
    },
    statusCounts: {
      "Lead": 12,
      "Contacting": 11,
      "Appointment Scheduled": 9,
      "Estimating": 8,
      "Estimate Sent": 7,
      "Signed Contract": 5,
      "Plan Active": 5,
      "Invoice Sent": 5,
      "Paid & Closed": 4,
    },
  },
  legacy: {
    overallConversion: 38,
    avgCycleTime: 28,
    activeJobs: 34,
    ytdRevenue: 178000,
    conversions: {
      "Lead": 80,
      "Contacting": 75,
      "Appointment Scheduled": 88,
      "Estimating": 82,
      "Estimate Sent": 48,
      "Signed Contract": 92,
      "In Production": 95,
      "Job Complete": 90,
      "Invoice Sent": 85,
      "Paid & Closed": 100,
    },
    avgDays: {
      "Lead": 3,
      "Contacting": 4,
      "Appointment Scheduled": 6,
      "Estimating": 5,
      "Estimate Sent": 8,
      "Signed Contract": 4,
      "In Production": 12,
      "Job Complete": 3,
      "Invoice Sent": 9,
      "Paid & Closed": 6,
    },
    statusCounts: {
      "Lead": 28,
      "Contacting": 22,
      "Appointment Scheduled": 19,
      "Estimating": 16,
      "Estimate Sent": 13,
      "Signed Contract": 6,
      "In Production": 5,
      "Job Complete": 4,
      "Invoice Sent": 3,
      "Paid & Closed": 3,
    },
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workflowType: string }> }
) {
  const { workflowType } = await params;

  try {
    const pool = getPool();

    // Map workflow type to record_type_name
    const recordTypeMap: Record<string, string> = {
      "roof-replacement": "Roof Replacement",
      "insurance": "Insurance",
      "repairs": "Repairs",
      "real-estate": "Real Estate",
      "maintenance-plan": "Maintenance Plan",
      "window-replacement": "Window Replacement",
      "siding-replacement": "Siding Replacement",
      "gutter-replacement": "Gutter Replacement",
      "legacy": "Legacy",
    };

    const recordTypeName = recordTypeMap[workflowType];
    if (!recordTypeName) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    // Query 1: Get all jobs for this record type
    const jobsResult = await pool.query(
      `SELECT id, stage, is_won, is_lost, is_closed, date_created, date_status_change
       FROM jobs
       WHERE record_type_name = $1`,
      [recordTypeName]
    );
    const jobs = jobsResult.rows;

    // Query 2: Get status history to build conversion funnel
    const historyResult = await pool.query(
      `SELECT job_id, status_name, stage, changed_at
       FROM job_status_history
       WHERE job_id IN (SELECT id FROM jobs WHERE record_type_name = $1)
       ORDER BY job_id, changed_at`,
      [recordTypeName]
    );
    const history = historyResult.rows;

    // Calculate metrics
    const totalJobs = jobs.length;
    const completedJobs = jobs.filter(j => j.is_closed).length;
    const wonJobs = jobs.filter(j => j.is_won).length;
    const lostJobs = jobs.filter(j => j.is_lost).length;

    const overallConversion = totalJobs > 0
      ? Math.round((wonJobs / totalJobs) * 100)
      : 0;

    // Calculate average cycle time (days from Lead to Won)
    const cycleTimeDays: number[] = [];
    jobs.forEach(job => {
      if (job.date_created && job.is_won && job.date_status_change) {
        const leadDate = new Date(job.date_created).getTime();
        const wonDate = new Date(job.date_status_change).getTime();
        const days = (wonDate - leadDate) / (1000 * 60 * 60 * 24);
        cycleTimeDays.push(days);
      }
    });
    const avgCycleTime = cycleTimeDays.length > 0
      ? Math.round(cycleTimeDays.reduce((a, b) => a + b, 0) / cycleTimeDays.length)
      : 0;

    // Build status conversion funnel from history
    const statusCounts: Record<string, number> = {};
    const jobsByStatus: Record<string, Set<string>> = {};

    // Initialize all possible statuses
    const allStatuses = [
      "Lead", "Contacting", "Appointment Scheduled", "Needs Rescheduling",
      "Estimating", "Estimate Sent", "Bob's Estimate Sent",
      "Signed Contract", "Pre-Production", "Ready for Install",
      "Job Scheduled", "In Progress", "Job Completed", "Final Walk Through",
      "Invoiced Customer", "Back End Audit", "Pay the Crew", "Bob's Collection",
      "Paid & Closed", "Request Review", "Hold", "Rehash", "Lost"
    ];

    allStatuses.forEach(status => {
      statusCounts[status] = 0;
      jobsByStatus[status] = new Set();
    });

    // Track first and last status for each job
    const jobFirstStatus: Record<string, string> = {};
    const jobCurrentStatus: Record<string, string> = {};
    const jobLostStatus: Record<string, boolean> = {};

    history.forEach(entry => {
      const { job_id, status_name } = entry;

      if (!jobFirstStatus[job_id]) {
        jobFirstStatus[job_id] = status_name;
      }
      jobCurrentStatus[job_id] = status_name;

      if (status_name === "Lost" || status_name === "Hold" || status_name === "Rehash") {
        jobLostStatus[job_id] = true;
      }
    });

    // Count jobs at each status
    Object.entries(jobCurrentStatus).forEach(([jobId, status]) => {
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
        jobsByStatus[status].add(jobId);
      }
    });

    // Calculate conversions (jobs that progressed from status A to status B)
    const conversions: Record<string, number> = {};
    const conversionAttempts: Record<string, number> = {};
    const avgDaysInStatus: Record<string, number> = {};

    allStatuses.forEach(status => {
      conversions[status] = 0;
      conversionAttempts[status] = 0;
      avgDaysInStatus[status] = 0;
    });

    // For each job, track its progression
    const jobProgression: Record<string, string[]> = {};
    history.forEach(entry => {
      const { job_id, status_name } = entry;
      if (!jobProgression[job_id]) {
        jobProgression[job_id] = [];
      }
      if (!jobProgression[job_id].includes(status_name)) {
        jobProgression[job_id].push(status_name);
      }
    });

    // Calculate conversion rates between statuses
    Object.entries(jobProgression).forEach(([jobId, statuses]) => {
      for (let i = 0; i < statuses.length; i++) {
        const currentStatus = statuses[i];
        conversionAttempts[currentStatus] = (conversionAttempts[currentStatus] || 0) + 1;

        if (i < statuses.length - 1) {
          conversions[currentStatus] = (conversions[currentStatus] || 0) + 1;
        }
      }
    });

    // Format conversion rates as percentages
    const conversionRates: Record<string, number> = {};
    Object.entries(conversionAttempts).forEach(([status, attempts]) => {
      if (attempts > 0) {
        conversionRates[status] = Math.round((conversions[status] / attempts) * 100);
      }
    });

    // Active jobs = jobs not in Completed or Lost stage
    const activeJobs = jobs.filter(j => !j.is_closed).length;

    // YTD Revenue - sum invoices for this job type
    const revenueResult = await pool.query(
      `SELECT COALESCE(SUM(approved_invoice_total), 0) as total FROM jobs
       WHERE record_type_name = $1 AND is_won = true`,
      [recordTypeName]
    );
    const ytdRevenue = parseFloat(revenueResult.rows[0]?.total || 0);

    const data = {
      overallConversion,
      avgCycleTime,
      activeJobs,
      ytdRevenue,
      totalJobs,
      wonJobs,
      lostJobs,
      completedJobs,
      conversions: conversionRates,
      avgDays: avgDaysInStatus,
      statusCounts,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch workflow data for", workflowType, ":", error);

    // Return error details instead of mock data
    return NextResponse.json(
      {
        error: "Failed to fetch workflow data",
        details: error instanceof Error ? error.message : String(error),
        fallbackAvailable: !!workflowData[workflowType]
      },
      { status: 500 }
    );
  }
}
