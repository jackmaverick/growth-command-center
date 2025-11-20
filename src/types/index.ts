export type LeadSource =
    | "Google"
    | "Facebook"
    | "Instagram"
    | "Referral"
    | "Direct"
    | "Other";

export type ContactType =
    | "Homeowner"
    | "Realtor"
    | "Property Manager"
    | "Insurance Agent"
    | "Other";

export type JobType =
    | "Roof Replacement"
    | "Roof Repair"
    | "Window Replacement"
    | "Gutter Replacement"
    | "Siding Replacement"
    | "Insurance Work"
    | "Real Estate Deal";

export interface Contact {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    type: ContactType;
    source: LeadSource;
    salesRep?: string; // ID or Name
    createdAt: string;
}

export interface Job {
    id: string;
    customer: Contact;
    type: JobType;
    status: "Estimate" | "In Progress" | "Completed" | "Paid" | "Lost";
    value: number;
    grossProfit?: number;
    salesRep?: string; // ID or Name
    owners?: string[]; // IDs of assigned users
    createdAt: string;
    updatedAt: string;
}

export interface DashboardMetrics {
    totalRevenue: number;
    newLeads: number;
    conversionRate: number;
    googleMapsViews: number;
    revenueByJobType: Record<JobType, number>;
    leadSources: Record<LeadSource, number>;
    contactTypes: Record<ContactType, number>;
}
