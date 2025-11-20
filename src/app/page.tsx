"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, DollarSign, Users, TrendingUp, CreditCard, RefreshCcw } from "lucide-react";
import { SalesFunnelChart } from "@/components/dashboard/sales-funnel-chart";
import { RevenueByJobTypeChart } from "@/components/dashboard/revenue-job-type-chart";
import { WorkflowVelocityTable } from "@/components/dashboard/workflow-velocity-table";
import { ReferralLeaderboard } from "@/components/dashboard/referral-leaderboard";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function fetchMetrics(view: string) {
  const res = await fetch(`/api/metrics?view=${view}`);
  if (!res.ok) throw new Error("Failed to fetch metrics");
  return res.json();
}

export default function DashboardPage() {
  const [view, setView] = useState("main");
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["metrics", view],
    queryFn: () => fetchMetrics(view),
  });

  if (isLoading) return <div className="p-8 text-white">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-red-400">Error loading metrics</div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Growth Command Center</h1>
          <p className="text-white/60 mt-1">Real-time sales & marketing performance</p>
        </div>
        <div className="flex items-center gap-4">
          <Tabs value={view} onValueChange={setView} className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="main">Main Dashboard</TabsTrigger>
              <TabsTrigger value="bob">Uncle Bob</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="outline"
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            onClick={() => refetch()}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/5 backdrop-blur-md border-white/10 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">YTD Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data?.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-emerald-400 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-md border-white/10 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">New Leads (30d)</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.newLeads}</div>
            <p className="text-xs text-blue-400 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +8.2% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-md border-white/10 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.conversionRate}%</div>
            <p className="text-xs text-purple-400 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +2.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-md border-white/10 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Avg. Daily Rev</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data?.avgDailyRevenue?.toLocaleString()}</div>
            <p className="text-xs text-emerald-400 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              YTD Average
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-md border-white/10 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Avg. Ticket</CardTitle>
            <CreditCard className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs text-amber-400 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +5.4% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <div className="col-span-4">
          <SalesFunnelChart data={data?.salesFunnelData || []} />
        </div>
        <div className="col-span-3">
          <RevenueByJobTypeChart data={data?.revenueByJobType || {}} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <div className="col-span-4">
          {data?.workflowVelocity && <WorkflowVelocityTable data={data.workflowVelocity} />}
        </div>
        <ReferralLeaderboard data={data?.referralLeaderboard || []} />
      </div>
    </div>
  );
}
