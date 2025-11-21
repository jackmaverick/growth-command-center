"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Briefcase,
    BarChart3,
    Settings,
    Phone,
    Layers,
} from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Job Types", href: "/job-types", icon: Layers },
    { name: "Leads & Contacts", href: "/contacts", icon: Users },
    { name: "Jobs & Estimates", href: "/jobs", icon: Briefcase },
    { name: "Marketing", href: "/marketing", icon: BarChart3 },
    { name: "Communication", href: "/communication", icon: Phone },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col border-r bg-card/50 backdrop-blur-xl">
            <div className="flex h-16 items-center border-b px-6">
                <span className="text-lg font-bold tracking-tight text-primary">
                    Maverick Growth
                </span>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "mr-3 h-5 w-5 flex-shrink-0",
                                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground"
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="border-t p-4">
                <div className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        ME
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium">Maverick Admin</p>
                        <p className="text-xs text-muted-foreground">admin@maverick.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
