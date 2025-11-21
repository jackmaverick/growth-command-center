"use client";

import { WorkflowDetail } from "@/components/dashboard/workflow-detail";

const statuses = [
  { name: "Lead", stage: "Lead" },
  { name: "Contacting", stage: "Lead" },
  { name: "Appointment Scheduled", stage: "Lead" },
  { name: "Estimating", stage: "Estimating" },
  { name: "Estimate Sent", stage: "Estimating" },
  { name: "Signed Contract", stage: "Sold" },
  { name: "Plan Active", stage: "In Production" },
  { name: "Invoice Sent", stage: "Accounts Receivable" },
  { name: "Paid & Closed", stage: "Accounts Receivable" },
];

export default function MaintenancePlanPage() {
  return (
    <div className="p-8">
      <WorkflowDetail
        workflowType="maintenance-plan"
        workflowName="Maintenance Plan"
        statuses={statuses}
      />
    </div>
  );
}
