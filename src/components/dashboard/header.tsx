"use client";

import { Bell, Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Header() {
    const queryClient = useQueryClient();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await queryClient.invalidateQueries({ queryKey: ["metrics"] });
        // Add a small delay to show the animation even if the fetch is fast
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    return (
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-card/50 px-6 py-4 backdrop-blur-xl">
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">Growth Command Center</h2>
            </div>
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="gap-2"
                >
                    <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                    Refresh Data
                </Button>
                <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Oct 24, 2025 - Nov 24, 2025</span>
                </div>
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                </Button>
                <div className="h-8 w-8 rounded-full bg-primary/20" />
            </div>
        </header>
    );
}
