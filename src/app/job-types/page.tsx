"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type JobTypeMetrics = {
  recordType: string;
  totals: {
    total: number;
    leads: number;
    estimating: number;
    sold: number;
    production: number;
    invoicing: number;
    completed: number;
    lost: number;
  };
  conversionRate: number;
  winRate: number;
  avgDaysToSold: number | null;
  conversionLadder?: {
    step: string;
    attempts: number;
    conversions: number;
    conversionRate: number;
  }[];
};

export default function JobTypesPage() {
  const [data, setData] = useState<JobTypeMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/job-types");
        if (!res.ok) throw new Error("Failed to load job types");
        const json = await res.json();
        setData(json.jobTypes || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Job Types</h1>
        <p className="text-muted-foreground">Pipeline and conversion metrics by record type</p>
      </div>

      {loading && <Skeleton className="h-40 w-full" />}
      {error && <div className="text-sm text-red-400">Error: {error}</div>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {!loading && !error && data.map((row) => {
          const workflowType = row.recordType.toLowerCase().replace(/\s+/g, "-");
          return (
            <Link key={row.recordType} href={`/workflows/${workflowType}`}>
              <Card className="bg-card/70 backdrop-blur cursor-pointer hover:bg-card/80 transition-colors h-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{row.recordType}</span>
                    <span className="text-sm text-muted-foreground">Total: {row.totals.total}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Metric label="Leads" value={row.totals.leads} />
                <Metric label="Estimating" value={row.totals.estimating} />
                <Metric label="Sold" value={row.totals.sold} />
                <Metric label="Production" value={row.totals.production} />
                <Metric label="Invoicing" value={row.totals.invoicing} />
                <Metric label="Completed" value={row.totals.completed} />
                <Metric label="Lost" value={row.totals.lost} />
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <BadgeMetric label="Conversion to Sold" value={`${row.conversionRate}%`} />
                <BadgeMetric label="Win Rate" value={`${row.winRate}%`} />
                <BadgeMetric
                  label="Avg Days to Sold"
                  value={row.avgDaysToSold !== null ? row.avgDaysToSold.toFixed(1) : "—"}
                />
              </div>
              {row.conversionLadder && row.conversionLadder.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-muted-foreground">
                      <tr className="border-b border-border/50">
                        <th className="py-2 pr-3 text-left font-medium">Step</th>
                        <th className="py-2 px-3 text-right font-medium">Attempts</th>
                        <th className="py-2 px-3 text-right font-medium">Conversions</th>
                        <th className="py-2 pl-3 text-right font-medium">Conv%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {row.conversionLadder.map((item) => (
                        <tr key={item.step} className="border-b border-border/30">
                          <td className="py-2 pr-3">{item.step}</td>
                          <td className="py-2 px-3 text-right">{item.attempts}</td>
                          <td className="py-2 px-3 text-right">{item.conversions}</td>
                          <td className="py-2 pl-3 text-right">{item.conversionRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-border/50 bg-muted/30 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
}

function BadgeMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
