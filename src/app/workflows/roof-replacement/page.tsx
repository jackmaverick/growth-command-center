"use client";

import { WorkflowDetail } from "@/components/dashboard/workflow-detail";

const statuses = [
  { name: "Lead", stage: "Lead" },
  { name: "Contacting", stage: "Lead" },
  { name: "Appointment Scheduled", stage: "Lead" },
  { name: "Estimating", stage: "Estimating" },
  { name: "Estimate Sent", stage: "Estimating" },
  { name: "Signed Contract", stage: "Sold" },
  { name: "Pre-Production", stage: "In Production" },
  { name: "Ready for Install", stage: "In Production" },
  { name: "Job Scheduled", stage: "In Production" },
  { name: "In Progress", stage: "In Production" },
  { name: "Job Completed", stage: "In Production" },
  { name: "Invoiced Customer", stage: "Accounts Receivable" },
  { name: "Paid & Closed", stage: "Accounts Receivable" },
  { name: "Request Review", stage: "Completed" },
];

export default function RoofReplacementPage() {
  return (
    <div className="p-8">
      <WorkflowDetail
        workflowType="roof-replacement"
        workflowName="Roof Replacement"
        statuses={statuses}
      />
    </div>
  );
}
