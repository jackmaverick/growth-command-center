import { Contact, Job, JobType, LeadSource, ContactType } from "@/types";

const JOBNIMBUS_API_URL = "https://app.jobnimbus.com/api1";

export class JobNimbusService {
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    private async fetch(endpoint: string, options: RequestInit = {}) {
        const res = await fetch(`${JOBNIMBUS_API_URL}${endpoint}`, {
            ...options,
            headers: {
                "Authorization": `Bearer ${this.token}`,
                "Content-Type": "application/json",
                ...options.headers,
            },
        });

        if (!res.ok) {
            throw new Error(`JobNimbus API Error: ${res.status} ${res.statusText}`);
        }

        return res.json();
    }

    async getContacts(dateRange?: { start: Date; end: Date }) {
        // In a real app, we'd add filters to the query string here
        // For now, fetching all and filtering in memory for simplicity in this demo phase
        const data = await this.fetch("/contacts?size=1000");
        return (data.results || []).map(this.normalizeContact);
    }

    async getJobs() {
        const data = await this.fetch("/jobs?size=1000");
        return (data.results || []).map(this.normalizeJob);
    }

    async getEstimates() {
        const data = await this.fetch("/v2/estimates?size=1000");
        return data.results || [];
    }

    async getInvoices() {
        const data = await this.fetch("/v2/invoices?size=1000");
        return data.results || [];
    }

    async getWorkflows() {
        // Fetch workflows to map Status IDs to Names
        // Using ?field=workflows as discovered in research
        const data = await this.fetch("/account/settings?field=workflows");
        return data.workflows || [];
    }

    async getJobActivities(jobId: string) {
        // Fetch activities for a specific job to track status changes
        // Filter by primary.id (the job ID)
        const filter = JSON.stringify({
            must: [{ term: { "primary.id": jobId } }]
        });
        const data = await this.fetch(`/activities?filter=${encodeURIComponent(filter)}&size=100`);
        // API returns 'activity' array, not 'results' for this endpoint
        return data.activity || data.results || [];
    }

    async getRecentActivities(limit: number = 10) {
        const data = await this.fetch(`/activities?size=${limit}`);
        return data.activity || data.results || [];
    }

    private normalizeContact(apiContact: any): Contact {
        return {
            id: apiContact.jnid,
            name: apiContact.display_name || `${apiContact.first_name} ${apiContact.last_name}`,
            email: apiContact.email,
            phone: apiContact.mobile_phone || apiContact.home_phone || apiContact.work_phone,
            type: (apiContact.record_type_name as ContactType) || "Homeowner",
            source: (apiContact.source_name as LeadSource) || "Other",
            salesRep: apiContact.sales_rep || apiContact.sales_rep_name,
            createdAt: new Date(apiContact.date_created * 1000).toISOString(),
        };
    }

    private normalizeJob(apiJob: any): Job {
        // Mapping "Service Type" or "record_type_name" to JobType
        // Based on inspection, record_type_name might be "Insurance" or "Retail"
        // We might need to look at "Service Type" custom field if available, or default to record_type_name
        const jobType = apiJob["Service Type"] || apiJob.record_type_name || "Roof Replacement";

        return {
            id: apiJob.jnid,
            customer: {
                id: apiJob.primary?.id || "unknown",
                name: apiJob.primary?.name || "Unknown",
                type: "Homeowner", // Default, would need lookup
                source: "Other",
                createdAt: new Date().toISOString(),
            },
            type: jobType as JobType,
            status: apiJob.status_name,
            value: 0, // Calculated from related estimates/invoices in aggregation layer
            salesRep: apiJob.sales_rep || apiJob.sales_rep_name,
            owners: apiJob.owners?.map((o: any) => o.id),
            createdAt: new Date(apiJob.date_created * 1000).toISOString(),
            updatedAt: new Date(apiJob.date_updated * 1000).toISOString(),
        };
    }
}
