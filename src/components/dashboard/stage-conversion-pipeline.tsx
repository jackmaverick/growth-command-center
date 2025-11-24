"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface Stage {
  name: string;
  count: number;
  conversionToNext: number;
}

interface StageConversionData {
  recordType: string;
  totalJobs: number;
  stages: Stage[];
}

interface StageConversionPipelineProps {
  period?: "weekly" | "monthly" | "quarterly" | "yearly";
}

async function fetchStageConversions(period: string) {
  const res = await fetch(`/api/stage-conversions?period=${period}`);
  if (!res.ok) throw new Error("Failed to fetch stage conversions");
  return res.json();
}

export function StageConversionPipeline({ period = "monthly" }: StageConversionPipelineProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["stageConversions", period],
    queryFn: () => fetchStageConversions(period),
  });

  if (isLoading) return <div className="p-8 text-white">Loading stage conversions...</div>;

  const conversions = data?.stageConversions || [];

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          Stage Conversion Pipeline
        </CardTitle>
        <p className="text-sm text-white/60 mt-2">
          Job progression through business stages (Lead → Estimating → Sold → Production → A/R → Completed)
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {conversions.map((record: StageConversionData) => (
          <div key={record.recordType} className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">{record.recordType}</h3>
              <span className="text-sm text-white/60">
                Total: <span className="text-white font-semibold">{record.totalJobs}</span> jobs
              </span>
            </div>

            {/* Pipeline visualization */}
            <div className="flex items-stretch gap-2 overflow-x-auto pb-4">
              {record.stages.map((stage, idx) => {
                const isLastStage = idx === record.stages.length - 1;
                return (
                  <div key={stage.name} className="flex items-center gap-2 flex-shrink-0">
                    {/* Stage box */}
                    <div className="flex flex-col items-center">
                      <div className="bg-gradient-to-br from-emerald-500/30 to-blue-500/30 border border-white/20 rounded-lg px-4 py-3 min-w-[120px] text-center hover:bg-white/10 transition-colors">
                        <div className="text-xs font-medium text-white/70 mb-1">{stage.name}</div>
                        <div className="text-2xl font-bold text-white">{stage.count}</div>
                      </div>

                      {/* Conversion rate below stage */}
                      {!isLastStage && stage.conversionToNext > 0 && (
                        <div className="mt-2 text-xs font-semibold">
                          <span className="text-emerald-400">{stage.conversionToNext}%</span>
                          <span className="text-white/50"> advance</span>
                        </div>
                      )}
                      {!isLastStage && stage.conversionToNext === 0 && stage.count > 0 && (
                        <div className="mt-2 text-xs font-semibold text-red-400">0% advance</div>
                      )}
                    </div>

                    {/* Arrow */}
                    {!isLastStage && (
                      <div className="flex flex-col items-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Funnel summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs mt-4">
              <div className="bg-white/5 rounded px-3 py-2 border border-white/10">
                <div className="text-white/60 mb-1">Lead Stage</div>
                <div className="text-lg font-semibold text-white">{record.stages[0]?.count || 0}</div>
              </div>
              <div className="bg-white/5 rounded px-3 py-2 border border-white/10">
                <div className="text-white/60 mb-1">Sold</div>
                <div className="text-lg font-semibold text-white">{record.stages[2]?.count || 0}</div>
              </div>
              <div className="bg-white/5 rounded px-3 py-2 border border-white/10">
                <div className="text-white/60 mb-1">Completed</div>
                <div className="text-lg font-semibold text-emerald-400">{record.stages[5]?.count || 0}</div>
              </div>
            </div>

            <hr className="border-white/10 my-6" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
