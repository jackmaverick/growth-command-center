import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface ReferralLeaderboardProps {
    data: { name: string; value: number }[];
}

export function ReferralLeaderboard({ data }: ReferralLeaderboardProps) {
    return (
        <Card className="col-span-3 bg-white/5 backdrop-blur-md border-white/10 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Top Lead Sources</CardTitle>
                <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${index === 0 ? "bg-yellow-500/20 text-yellow-400" :
                                        index === 1 ? "bg-gray-400/20 text-gray-300" :
                                            index === 2 ? "bg-amber-700/20 text-amber-600" :
                                                "bg-white/5 text-white/50"
                                    }`}>
                                    {index + 1}
                                </div>
                                <span className="text-sm font-medium">{item.name}</span>
                            </div>
                            <div className="text-sm font-bold text-white/70">
                                {item.value} leads
                            </div>
                        </div>
                    ))}
                    {data.length === 0 && (
                        <div className="text-sm text-white/40 text-center py-4">
                            No referral data available
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
