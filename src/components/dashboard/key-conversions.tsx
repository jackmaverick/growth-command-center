"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export function KeyConversions({ data }: { data?: Record<string, number> }) {
  if (!data) return null;

  const conversions = Object.entries(data)
    .filter(([_, rate]) => rate > 0)
    .sort(([_, rateA], [__, rateB]) => rateB - rateA);

  if (conversions.length === 0) return null;

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10 text-white">
      <CardHeader>
        <CardTitle>Conversion Paths</CardTitle>
        <p className="text-sm text-white/60 mt-2">
          Track how jobs move between statuses (including non-linear paths)
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {conversions.map(([path, rate]) => {
            const [from, to] = path.split("→");
            const isLoss = path.includes("→Lost");
            const bgColor = isLoss ? "bg-red-500/10" : "bg-emerald-500/10";
            const textColor = isLoss ? "text-red-400" : "text-emerald-400";

            return (
              <div
                key={path}
                className={`flex items-center justify-between p-3 rounded-lg ${bgColor} hover:${bgColor} transition-colors`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm font-medium text-white/70">{from}</span>
                  <ArrowRight className="h-4 w-4 text-white/40" />
                  <span className="text-sm font-medium text-white/70">{to}</span>
                </div>
                <div className={`text-lg font-bold ${textColor}`}>{rate}%</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
