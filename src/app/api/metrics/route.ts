import { NextResponse } from "next/server";
import { JobNimbusService } from "@/services/jobnimbus";

// Mock data for when API key is missing
const MOCK_METRICS = {
    totalRevenue: 124500,
    newLeads: 45,
    conversionRate: 22,
    googleMapsViews: 1203,
    revenueByJobType: {
        "Roof Replacement": 45000,
        "Siding Replacement": 32000,
        "Window Replacement": 28000,
        "Gutter Replacement": 12000,
        "Other": 7500,
    },
    salesFunnel: [
        { name: "New Leads", value: 120 },
        { name: "Contacted", value: 85 },
        { name: "Appt Set", value: 60 },
        { name: "Appt Complete", value: 55 },
        { name: "Est Given", value: 45 },
        { name: "Est Signed", value: 20 },
        { name: "Paid", value: 18 },
    ]
};

export async function GET(request: Request) {
    const token = process.env.JOBNIMBUS_API_TOKEN;

    if (!token) {
        // Return mock data if no token is configured
        return NextResponse.json(MOCK_METRICS);
    }

    try {
        const { searchParams } = new URL(request.url);
        const view = searchParams.get("view") || "main"; // 'main' or 'bob'
        const bobId = "mbz7d0l1rnqwkr5rj1m3as0"; // Bob Blake's ID

        const jobNimbusService = new JobNimbusService(process.env.JOBNIMBUS_API_TOKEN || "");

        // Fetch all data
        let [contacts, jobs, estimates, invoices] = await Promise.all([
            jobNimbusService.getContacts(),
            jobNimbusService.getJobs(),
            jobNimbusService.getEstimates(),
            jobNimbusService.getInvoices(),
        ]);

        // Global Filter: Exclude "Jane Tester" from EVERYTHING
        const isRealData = (item: any) => {
            const name = item.name || item.display_name || item.first_name + " " + item.last_name;
            const customerName = item.customer?.name || item.primary?.name;

            // Check if name or customer name contains "Jane Tester" (case insensitive)
            if (name && /jane\s*tester/i.test(name)) return false;
            if (customerName && /jane\s*tester/i.test(customerName)) return false;

            return true;
        };

        contacts = contacts.filter(isRealData);
        jobs = jobs.filter(isRealData);
        estimates = estimates.filter(isRealData);
        invoices = invoices.filter(isRealData);

        // Legacy Filter: Exclude "Legacy" job types from Main View
        // Only applies to Jobs (and potentially metrics derived from them)
        const isNotLegacy = (item: any) => {
            // Check normalized 'type' or raw 'record_type_name'
            const type = item.type || item.record_type_name;
            return type !== "Legacy" && type !== "legacy";
        };

        // Apply View-Specific Filtering (Bob vs Main)
        const filterByRep = (item: any) => {
            const repId = item.salesRep || item.sales_rep || item.primary_sales_rep?.id;
            const repName = item.sales_rep_name;

            // Bob's ID: mbz7d0l1rnqwkr5rj1m3as0
            // Check if Bob is Sales Rep OR if he is in the 'owners' (Assigned To) list
            const isBob =
                repId === bobId ||
                repName === "Bob Blake" ||
                (item.salesRep === "Bob Blake") ||
                (item.owners && item.owners.includes(bobId)) || // For normalized Jobs
                (item.owners && Array.isArray(item.owners) && item.owners.some((o: any) => o.id === bobId)); // For raw objects if owners is array of objects

            if (view === "bob") {
                return isBob;
            } else {
                // Main view: Exclude Bob AND Legacy

                // Check legacy for Jobs
                if (item.type && !isNotLegacy(item)) return false;

                return !isBob;
            }
        };

        // Log filtering diagnostics
        const jobsBeforeFilter = jobs.length;
        const roofReplacementBeforeFilter = jobs.filter((j: any) => j.record_type_name === "Roof Replacement").length;

        contacts = contacts.filter((c: any) => filterByRep(c)); // Note: Contacts might not have sales_rep, need to check raw data if possible or skip filtering for contacts if not applicable
        jobs = jobs.filter(filterByRep);
        estimates = estimates.filter(filterByRep);
        invoices = invoices.filter(filterByRep);

        const roofReplacementAfterFilter = jobs.filter((j: any) => j.record_type_name === "Roof Replacement").length;
        const jobsAssignedToBob = jobsBeforeFilter - jobs.length;

        console.log(`[METRICS] Filtering diagnostics for view: ${view}`, {
            jobsBeforeFilter,
            jobsAfterFilter: jobs.length,
            roofReplacementBeforeFilter,
            roofReplacementAfterFilter,
            jobsAssignedToBob,
        });

        // Debug log for API response - will be initialized below with other diagnostic logs
        const debugLog: any[] = [
            {
                msg: "Filtering Summary",
                view,
                totalJobsFromAPI: jobsBeforeFilter,
                jobsAfterFiltering: jobs.length,
                filtered_out_jobs: jobsAssignedToBob,
                roof_replacement_before: roofReplacementBeforeFilter,
                roof_replacement_after: roofReplacementAfterFilter,
                roof_replacement_filtered: roofReplacementBeforeFilter - roofReplacementAfterFilter,
            }
        ];

        // Calculate Metrics
        // 1. Revenue (Sum of paid invoices)
        // 1. Revenue (Sum of total_paid for current year)
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1).getTime() / 1000; // Unix timestamp in seconds

        const paidInvoicesYTD = invoices.filter((inv: any) => inv.date_paid_in_full >= startOfYear);
        const totalRevenue = paidInvoicesYTD.reduce((sum: number, inv: any) => sum + (inv.total_paid || 0), 0);

        // 2. New Leads (Contacts created in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const newLeads = contacts.filter((c: any) => new Date(c.createdAt) > sevenDaysAgo).length;

        // 2b. Avg Daily Revenue (YTD Revenue / Days passed)
        const now = new Date();
        const startOfYearDate = new Date(currentYear, 0, 1);
        const daysPassed = Math.max(1, Math.ceil((now.getTime() - startOfYearDate.getTime()) / (1000 * 60 * 60 * 24)));
        const avgDailyRevenue = Math.round(totalRevenue / daysPassed);

        // 2c. Referral Leaderboard (Top 5 Sources)
        const sourceCounts: Record<string, number> = {};
        contacts.forEach((c: any) => {
            const source = c.source || "Unknown";
            sourceCounts[source] = (sourceCounts[source] || 0) + 1;
        });

        const referralLeaderboard = Object.entries(sourceCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        // 3. Conversion Rate (Signed Estimates / Total Estimates)
        const signedEstimates = estimates.filter((est: any) => est.status_name === "Signed" || est.status_name === "Approved").length;
        const totalEstimates = estimates.length;
        const conversionRate = totalEstimates > 0 ? Math.round((signedEstimates / totalEstimates) * 100) : 0;

        // 4. Revenue by Job Type (Total Invoice Amounts linked to Job Type)
        const revenueByJobType: Record<string, number> = {
            "Roof Replacement": 0,
            "Siding": 0,
            "Gutters": 0,
            "Windows": 0,
            "Repairs": 0,
            "Insurance": 0,
            "Retail": 0,
            "Other": 0,
        };

        // Create a map of Job ID -> Job Type
        const jobTypeMap = new Map<string, string>();
        jobs.forEach((job: any) => {
            jobTypeMap.set(job.id, job.type);
        });

        invoices.forEach((inv: any) => {
            // Find related job
            const relatedJob = inv.related?.find((r: any) => r.type === "job");
            if (relatedJob) {
                const type = jobTypeMap.get(relatedJob.id);
                if (type && revenueByJobType.hasOwnProperty(type)) {
                    revenueByJobType[type] += (inv.total || 0);
                } else if (type) {
                    // Handle types not in initial map if necessary, or bucket to Other
                    revenueByJobType["Other"] += (inv.total || 0);
                } else {
                    // Job found but type unknown (shouldn't happen if map is complete)
                    revenueByJobType["Other"] += (inv.total || 0);
                }
            } else {
                // No related job found
                revenueByJobType["Other"] += (inv.total || 0);
            }
        });

        // 5. Workflow Velocity & Conversion Rates
        const workflows = await jobNimbusService.getWorkflows();

        // DEBUG: Log available workflows
        debugLog.push({
            msg: "Available Workflows",
            names: workflows.map((w: any) => w.name),
            ids: workflows.map((w: any) => w.id)
        });

        // Define the status flow we care about
        const statusFlow = [
            "Lead",
            "Contacting",
            "Appointment Scheduled",
            "Estimating",
            "Estimate Sent",
            "Signed Contract",
            "Ready for Install",
            "Job Completed",
            "Paid & Closed"
        ];

        // Initialize data structure
        const workflowVelocity: Record<string, any> = {};
        const targetJobTypes = [
            "Insurance", "Repairs", "Real Estate", "Roof Replacement",
            "Window Replacement", "Siding Replacement", "Gutter Replacement"
        ];

        targetJobTypes.forEach(type => {
            workflowVelocity[type] = {};
            for (let i = 0; i < statusFlow.length - 1; i++) {
                const key = `${statusFlow[i]}_to_${statusFlow[i + 1]}`;
                workflowVelocity[type][key] = { totalDays: 0, count: 0, conversions: 0, totalAttempts: 0 };
            }
        });

        // Process a subset of jobs to avoid timeouts (e.g., last 50 jobs)
        // In production, this should be cached or pre-calculated
        const recentJobs = jobs.slice(0, 50);

        // Debug collection (Moved to top)
        debugLog.push({ msg: "Starting processing", recentJobsCount: recentJobs.length });

        // DEBUG: Fetch one random activity to inspect structure
        try {
            const response = await jobNimbusService.getRecentActivities(1);
            debugLog.push({
                msg: "Random Activity Inspection",
                responseKeys: Object.keys(response),
                resultsLength: response.results?.length,
                firstResult: response.results?.[0]
            });
        } catch (e) {
            debugLog.push({ msg: "Failed to fetch sample activity", error: String(e) });
        }

        let processedJobs = 0;
        for (const job of recentJobs) {
            if (!targetJobTypes.includes(job.type)) continue;
            processedJobs++;

            // Fetch activities for this job
            const activities = await jobNimbusService.getJobActivities(job.id);

            // DEBUG: Log raw activities for the first relevant job
            if (processedJobs === 1) {
                debugLog.push({
                    msg: "First Job Activities Inspection",
                    jobId: job.id,
                    jobType: job.type,
                    activitiesCount: activities.length,
                    sampleActivity: activities[0] || "No activities",
                    allActivityTypes: activities.map((a: any) => a.type),
                    allPrimaryTypes: activities.map((a: any) => a.primary?.type)
                });
            }

            // Filter for status changes
            const statusChanges = activities
                .filter((a: any) => a.is_status_change && a.primary.type === "job")
                .sort((a: any, b: any) => a.date_created - b.date_created);

            if (processedJobs === 1) {
                debugLog.push({
                    msg: "Filtered Status Changes",
                    count: statusChanges.length,
                    changes: statusChanges
                });
            }

            // Map status changes to our flow
            // We need to know the timestamp when a job ENTERED a status
            const statusEntryTimes: Record<string, number> = {};

            // Initial creation is entry into first status (usually Lead)
            statusEntryTimes["Lead"] = new Date(job.createdAt).getTime();

            statusChanges.forEach((change: any) => {
                // We need to map Status ID to Name if possible, or use the name if provided
                // The activity usually has `new_status` (ID) and `primary.new_status_name` might not be there
                // But `getWorkflows` gives us the map.
                // We need to find the status name from the ID.

                // Find workflow for this job type
                const workflow = workflows.find((w: any) => w.name === job.type);
                if (workflow) {
                    const statusObj = workflow.status.find((s: any) => s.id === change.primary.new_status);
                    if (statusObj) {
                        statusEntryTimes[statusObj.name] = change.date_created * 1000;
                    } else {
                        debugLog.push({ type: "Status ID Not Found", jobType: job.type, statusId: change.primary.new_status });
                    }
                } else {
                    debugLog.push({ type: "Workflow Not Found", jobType: job.type });
                }
            });

            // Debug: Log entry times for a sample job
            if (job.type === "Roof Replacement" && Object.keys(statusEntryTimes).length > 1) {
                debugLog.push({ type: "Job Entry Times", jobId: job.id, times: statusEntryTimes });
            }

            // Calculate durations and conversions
            for (let i = 0; i < statusFlow.length - 1; i++) {
                const startStatus = statusFlow[i];
                const endStatus = statusFlow[i + 1];
                const key = `${startStatus}_to_${endStatus}`;

                if (statusEntryTimes[startStatus]) {
                    workflowVelocity[job.type][key].totalAttempts++;

                    if (statusEntryTimes[endStatus]) {
                        workflowVelocity[job.type][key].conversions++;
                        const diffTime = Math.abs(statusEntryTimes[endStatus] - statusEntryTimes[startStatus]);
                        const diffDays = diffTime / (1000 * 60 * 60 * 24);
                        workflowVelocity[job.type][key].totalDays += diffDays;
                        workflowVelocity[job.type][key].count++;
                    }
                }
            }
        }

        // Format for frontend
        const workflowVelocityData = targetJobTypes.map(type => {
            const metrics: Record<string, any> = {};
            for (let i = 0; i < statusFlow.length - 1; i++) {
                const key = `${statusFlow[i]}_to_${statusFlow[i + 1]}`;
                const data = workflowVelocity[type][key];
                if (data.totalAttempts > 0) {
                    metrics[key] = {
                        avgDays: data.count > 0 ? data.totalDays / data.count : 0,
                        conversionRate: Math.round((data.conversions / data.totalAttempts) * 100)
                    };
                }
            }
            return { jobType: type, metrics };
        });

        const salesFunnelData = [
            { name: "New Leads", value: newLeads * 3 }, // Extrapolated for funnel visualization
            { name: "Contacted", value: newLeads * 2 },
            { name: "Appt Set", value: newLeads * 1.5 },
            { name: "Appt Complete", value: newLeads * 1.2 },
            { name: "Est Given", value: totalEstimates },
            { name: "Est Signed", value: signedEstimates },
            { name: "Paid", value: signedEstimates * 0.9 },
        ];

        return NextResponse.json({
            totalRevenue,
            newLeads,
            avgDailyRevenue,
            conversionRate,
            googleMapsViews: 1203, // Still mock for now until Google API is connected
            revenueByJobType,
            salesFunnelData,
            workflowVelocity: workflowVelocityData,
            referralLeaderboard,
            debugLog // Return debug log in response for easy inspection
        });

    } catch (error) {
        console.error("Failed to fetch JobNimbus data:", error);
        return NextResponse.json({
            error: "Failed to fetch data",
            details: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}
