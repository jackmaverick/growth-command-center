"use client";

import { WorkflowDetail } from "@/components/dashboard/workflow-detail";

const statuses = [
  { name: "New Lead", stage: "Lead" },
  { name: "Contacting", stage: "Lead" },
  { name: "Appointment Scheduled", stage: "Lead" },
  { name: "Estimating", stage: "Estimating" },
  { name: "Estimate Sent", stage: "Estimating" },
  { name: "Signed Contract", stage: "Sold" },
  { name: "Repair Scheduled", stage: "In Production" },
  { name: "Repair in Progress", stage: "In Production" },
  { name: "Job Complete", stage: "In Production" },
  { name: "Invoice Sent", stage: "Accounts Receivable" },
  { name: "Paid & Closed", stage: "Accounts Receivable" },
  { name: "Request Review", stage: "Completed" },
];

export default function RepairsPage() {
  return (
    <div className="p-8">
      <WorkflowDetail
        workflowType="repairs"
        workflowName="Repairs"
        statuses={statuses}
      />
    </div>
  );
}
