import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WorkflowVelocityData {
    jobType: string;
    metrics: {
        [key: string]: {
            avgDays: number;
            conversionRate: number;
        };
    };
}

interface WorkflowVelocityTableProps {
    data: WorkflowVelocityData[];
}

const TRANSITIONS = [
    { label: "Lead → Contacting", key: "Lead_to_Contacting" },
    { label: "Contacting → Appt", key: "Contacting_to_Appointment Scheduled" },
    { label: "Appt → Estimate", key: "Appointment Scheduled_to_Estimating" },
    { label: "Estimate → Signed", key: "Estimate Sent_to_Signed Contract" },
    { label: "Signed → Install", key: "Signed Contract_to_Ready for Install" },
    { label: "Install → Completed", key: "Ready for Install_to_Job Completed" },
    { label: "Completed → Paid", key: "Job Completed_to_Paid & Closed" },
];

export function WorkflowVelocityTable({ data }: WorkflowVelocityTableProps) {
    return (
        <Card className="col-span-4 bg-white/5 backdrop-blur-md border-white/10 text-white">
            <CardHeader>
                <CardTitle className="text-lg font-medium">Workflow Velocity & Conversion</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/10 hover:bg-white/5">
                                <TableHead className="text-white/70 font-medium min-w-[150px]">Job Type</TableHead>
                                {TRANSITIONS.map((t) => (
                                    <TableHead key={t.key} className="text-white/70 font-medium text-center min-w-[120px]">
                                        {t.label}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row) => (
                                <TableRow key={row.jobType} className="border-white/10 hover:bg-white/5">
                                    <TableCell className="font-medium text-white">{row.jobType}</TableCell>
                                    {TRANSITIONS.map((t) => {
                                        const metric = row.metrics[t.key];
                                        if (!metric) {
                                            return <TableCell key={t.key} className="text-center text-white/30">-</TableCell>;
                                        }
                                        return (
                                            <TableCell key={t.key} className="text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-sm font-bold text-white">
                                                        {metric.avgDays.toFixed(1)} days
                                                    </span>
                                                    <Badge
                                                        variant="secondary"
                                                        className={`text-[10px] px-1.5 py-0 h-5 ${metric.conversionRate >= 80 ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30" :
                                                                metric.conversionRate >= 50 ? "bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30" :
                                                                    "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                                                            }`}
                                                    >
                                                        {metric.conversionRate}% Conv
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
