"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

export function SalesFunnelChart({ data }: { data?: any[] }) {
    if (!data) return null;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                <XAxis type="number" hide />
                <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "8px",
                        color: "#f8fafc",
                    }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || "#3b82f6"} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
