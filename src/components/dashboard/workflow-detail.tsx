"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, TrendingUp, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { KeyConversions } from "./key-conversions";

interface WorkflowDetailProps {
  workflowType: string;
  workflowName: string;
  statuses: Array<{ name: string; stage: string }>;
}

async function fetchWorkflowMetrics(workflowType: string) {
  const res = await fetch(`/api/workflows/${workflowType}`);
  if (!res.ok) throw new Error("Failed to fetch workflow metrics");
  return res.json();
}

export function WorkflowDetail({ workflowType, workflowName, statuses }: WorkflowDetailProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["workflow", workflowType],
    queryFn: () => fetchWorkflowMetrics(workflowType),
  });

  if (isLoading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">{workflowName} Workflow</h1>
        <p className="text-white/60 mt-1">Conversion metrics, conversion paths, and cycle time analysis</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/5 backdrop-blur-md border-white/10 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Lead → Sold</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.overallConversion || "0"}%</div>
            <p className="text-xs text-white/50 mt-1">Overall conversion rate</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-md border-white/10 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Avg. Cycle Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.avgCycleTime || "0"} days</div>
            <p className="text-xs text-white/50 mt-1">Lead to completion</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-md border-white/10 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Active Jobs</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.activeJobs || "0"}</div>
            <p className="text-xs text-white/50 mt-1">Currently in pipeline</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-md border-white/10 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">YTD Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data?.ytdRevenue?.toLocaleString() || "0"}</div>
            <p className="text-xs text-white/50 mt-1">Closed jobs</p>
          </CardContent>
        </Card>
      </div>

      {/* Key Conversion Paths */}
      <KeyConversions data={data?.keyConversions} />

      {/* Conversion Funnel */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10 text-white">
        <CardHeader>
          <CardTitle>Status Conversion Funnel</CardTitle>
          <p className="text-sm text-white/60 mt-2">
            Track how jobs move through each status, conversion rates, and average time spent
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statuses.map((status, idx) => {
              const nextStatus = statuses[idx + 1];
              const conversionRate = data?.conversions?.[status.name] || 0;
              const lossRate = data?.lossRates?.[status.name] || 0;
              const avgDays = data?.avgDays?.[status.name] || 0;
              const count = data?.statusCounts?.[status.name] || 0;

              return (
                <div key={status.name}>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-white/50 bg-white/5 px-2 py-1 rounded">
                          {status.stage}
                        </span>
                        <span className="text-lg font-semibold">{status.name}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-6 text-sm">
                        <span className="text-white/60">
                          <Clock className="inline h-3 w-3 mr-1" />
                          Avg: <span className="font-semibold text-white">{avgDays}</span> days
                        </span>
                        <span className="text-white/60">
                          Current: <span className="font-semibold text-white">{count}</span> jobs
                        </span>
                      </div>
                    </div>
                    {nextStatus && (
                      <div className="flex items-center gap-6 ml-4">
                        <div className="text-right">
                          <div className="text-sm text-white/60 mb-2">Success Rate</div>
                          <div className="text-3xl font-bold text-emerald-400">{conversionRate}%</div>
                          <div className="text-xs text-white/50">advance to next</div>
                        </div>
                        {lossRate > 0 && (
                          <div className="text-right">
                            <div className="text-sm text-white/60 mb-2">Loss Rate</div>
                            <div className="text-3xl font-bold text-red-400">{lossRate}%</div>
                            <div className="text-xs text-white/50">lost from here</div>
                          </div>
                        )}
                        <ArrowRight className="h-6 w-6 text-emerald-400/50" />
                      </div>
                    )}
                    {!nextStatus && (
                      <div className="ml-4 px-4 py-2 bg-emerald-500/20 rounded-lg">
                        <div className="text-sm font-semibold text-emerald-400">✓ Complete</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
