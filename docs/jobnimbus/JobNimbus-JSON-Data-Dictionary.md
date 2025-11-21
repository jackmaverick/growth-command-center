# Job Nimbus JSON Data Dictionary

## Purpose
This document maps Job Nimbus JSON API data to the user interface, enabling accurate dashboard reporting for sales and conversions by job type.

---

## Job Pipeline & Status Tracking

### Workflow Structure
```
record_type: 62
record_type_name: "Roof Replacement"
```
- **What it is:** The job type/workflow
- **Dashboard use:** Primary dimension for grouping sales/conversion metrics
- Each `record_type` has a unique numeric ID and human-readable name

### All Record Types (Workflows)

| record_type_name | record_type ID | Uses Workflow |
|-----------------|----------------|---------------|
| Legacy (Bob's Workflow) | 47 | Legacy |
| Insurance | 57 | Insurance |
| Repairs | 58 | Repairs |
| Maintenance Plan | 59 | Maintenance Plan |
| Real Estate | 61 | Real Estate |
| Roof Replacement | 62 | Roof Replacement |
| Window Replacement | 63 | Roof Replacement |
| Siding Replacement | 64 | Roof Replacement |
| Gutter Replacement | 65 | Roof Replacement |

### Status & Stages
```
status: 742
status_name: "Appointment Scheduled"
```
- **What it is:** The current position in the workflow
- **How it works:** Multiple status names map to broader "stages"
- **UI Location:** Kanban board columns or workflow progress bar at top of job detail page

⚠️ **CRITICAL: Always Use status_name, NOT status ID**
- Each workflow has its own set of `status` IDs, even for identical names
- Example: "Lost" = status 491 in one workflow, status 648 in another
- **Dashboard Rule:** Always filter/group by `status_name`, never by `status` ID
- Only use `status` ID if filtering within a single `record_type`

---

## Complete Stage Mappings by Workflow

### Roof Replacement Workflow
(Also used for: Window Replacement, Siding Replacement, Gutter Replacement)

**Lead Stage:**
- Lead
- Contacting
- Appointment Scheduled
- Needs Rescheduling

**Estimating Stage:**
- Estimating
- Estimate Sent
- Bob's Estimate Sent

**Sold Stage:**
- Signed Contract

**In Production Stage:**
- Pre-Production
- Ready for Install
- Job Scheduled
- In Progress
- Job Completed
- Final Walk Through

**Accounts Receivable Stage:**
- Invoiced Customer
- Back End Audit
- Pay the Crew
- Bob's Collection
- Paid & Closed

**Completed Stage:**
- Request Review

**Lost Stage:**
- Hold
- Rehash
- Lost

---

### Insurance Workflow

**Lead Stage:**
- Lead
- Contacting
- Appointment Scheduled
- Adjuster Appt. Scheduled
- Needs Rescheduling

**Estimating Stage:**
- Waiting on Adjuster
- Estimating
- Estimate Sent
- Bob's Estimate Sent

**Sold Stage:**
- Signed Contract

**In Production Stage:**
- Supplementing
- Appraisal
- Pre-Production
- Ready for Install
- Job Scheduled
- In Progress
- Job Completed
- Final Walk Through
- Lawyer (Appraisal/Litigation)

**Accounts Receivable Stage:**
- Invoiced Insurance
- Invoiced Customer
- Back End Audit
- Pay the Crew
- Paid & Closed
- Bob's Collection

**Completed Stage:**
- Request Review

**Lost Stage:**
- Hold
- Rehash
- Lost

---

### Repairs Workflow

**Lead Stage:**
- New Lead
- Contacting
- Appointment Scheduled

**Estimating Stage:**
- Estimating
- Estimate Sent
- Bob's Estimate Sent

**Sold Stage:**
- Signed Contract

**In Production Stage:**
- Repair Scheduled
- Repair in Progress
- Job Complete

**Accounts Receivable Stage:**
- Invoice Sent
- Bob's Collection
- Paid & Closed

**Completed Stage:**
- Request Review

**Lost Stage:**
- Lost Repairs
- Rehash
- Referral/Newsletter

---

### Real Estate Workflow

**Lead Stage:**
- Lead
- Contacting
- Appointment Scheduled
- Needs Rescheduling

**Estimating Stage:**
- Estimating
- Estimate Sent
- Bob's Estimate Sent

**Sold Stage:**
- Signed Contract

**In Production Stage:**
- Pre-Production
- Ready for Install
- Job Scheduled
- In Progress
- Job Complete
- Final Walk Through

**Accounts Receivable Stage:**
- Invoiced Customer
- Back End Audit
- Pay the Crew
- Bob's Collection
- Paid & Closed

**Completed Stage:**
- Request Review

**Lost Stage:**
- Hold
- Rehash
- Lost

---

### Maintenance Plan Workflow

**Lead Stage:**
- Enrolled

**Sold Stage:**
- Scheduled

**In Production Stage:**
- In Progress
- Service Complete

**Completed Stage:**
- Renewal
- Referral/Newsletter

---

### Legacy Workflow (Bob's Workflow)

**Lead Stage:**
- Lead
- Booking

**Estimating Stage:**
- Proposal Sent

**Sold Stage:**
- Signed Contract

**In Production Stage:**
- Pre-Production
- Delivery
- In Progress
- Job Complete

**Accounts Receivable Stage:**
- Invoiced
- Pending Payments
- Paid & Closed

**Completed Stage:**
- Pending Google Review

**Lost Stage:**
- Lost
- Rehash

**None Stage:**
- Data Migration Review

### Status Metadata
```
date_status_change: 1763658647  // Unix timestamp
date_created: 1763658520        // Unix timestamp
date_updated: 1763660589        // Unix timestamp
```
- **date_status_change:** Last time the status changed (critical for conversion velocity tracking)
- **date_created:** When the job was first created
- **date_updated:** Last modification to any job field

### Determining Current Stage
To determine which stage a job is in:
1. Look at the `status_name` field (e.g., "Appointment Scheduled")
2. Match it against the workflow mappings above for that job's `record_type_name`
3. The stage is the parent category (e.g., "Appointment Scheduled" → "Lead" stage)

**Note:** The `status` field is a numeric ID that's unique per workflow. Always use `status_name` for cross-workflow queries.

### Known Status ID Mappings (Sample)
These are examples showing how status IDs vary by workflow:

| status_name | Known status IDs | Notes |
|------------|------------------|-------|
| Lost | 491, 648 | Different ID per workflow |
| Estimating | 714, 744 | Different ID per workflow |
| Paid & Closed | 490, 668 | Different ID per workflow |
| Appointment Scheduled | 742 | May vary |
| Estimate Sent | 768 | May vary |
| Bob's Estimate Sent | 746 | May vary |
| Pre-Production | 641 | May vary |
| Invoiced Customer | 754 | May vary |
| Invoice Sent | 667 | May vary |
| Back End Audit | 755 | May vary |
| Bob's Collection | 826 | May vary |
| New Lead | 660 | May vary |
| Lost Repairs | 669 | Repairs workflow specific |
| Rehash | 659 | May vary |

**Recommendation:** To get a complete mapping, query all jobs grouped by `record_type_name`, `status`, and `status_name` to build a comprehensive lookup table.

### Job State Flags
```
is_lead: false
is_closed: false
is_active: true
is_archived: false
```
- **is_active:** Job is currently being worked (not archived/deleted)
- **is_lead:** Automatically set based on status stage = "Lead"
- **is_closed:** Job is complete or lost
- **is_archived:** Job has been archived (exclude from active reporting)

---

## Revenue Tracking

**💰 Money Format:** All dollar amounts are in USD (e.g., `3000` = $3,000.00)

### Payments API Endpoint
```bash
# Get all payments
curl --location 'https://app.jobnimbus.com/api1/payments' \
  --header 'Authorization: bearer <token>' \
  --header 'Content-Type: application/json'
```

### Actual Payment Structure (Confirmed)
```json
{
  "jnid": "mi7kbioizzrqbf8aeuhank",
  "total": 3000,
  "credit": 0,
  "date_created": 1763651085,
  "date_payment": 1763661600,
  "date_updated": 1763651085,
  
  "PaymentSource": "Invoice",
  "method_id": 1,
  "created_by": "m9bnef14vrcjniytbs5n0nb",
  "created_by_name": "Jack Blake",
  "created_by_processor": "Payrix",
  
  "sales_rep": "m9bnef14vrcjniytbs5n0nb",
  "sales_rep_name": "Jack Blake",
  
  "customer": "m9bnef0tpm14lu8snfl17rd",
  
  "primary": {
    "id": "mf5mknzcpdwqm3tx4yifcc5",
    "name": "10720 South Cedar Niles Cir - Michelle Mitchell",
    "number": "1308",
    "type": "job"
  },
  
  "related": [
    {
      "id": "mf5mknzcpdwqm3tx4yifcc5",
      "name": "10720 South Cedar Niles Cir - Michelle Mitchell",
      "number": "1308",
      "type": "job"
    },
    {
      "id": "mf5mjnd4zpuy8iuu7j5sih6",
      "name": "Michelle Mitchell",
      "number": "1329",
      "type": "contact"
    },
    {
      "id": "mg55gwaxbb3wd066c3kx344",
      "name": "#1143",
      "number": "1143",
      "type": "invoice"
    }
  ],
  
  "invoices": [
    {
      "amount": 3000,
      "invoice_id": "mg55gwaxbb3wd066c3kx344",
      "invoice_no": "1143",
      "jnid": "mi7kbioizzrqbf8aeuhank_1"
    }
  ],
  
  "is_active": true,
  "is_archived": false,
  "type": "payment"
}
```

### Key Fields Explained

**Revenue Fields:**
- `total` - Total payment amount in USD (3000 = $3,000)
- `credit` - Credit amount (if any)
- **Net revenue = total - credit** (though credit is usually 0)

**Date Fields:**
- `date_payment` - **USE THIS** for "this month's revenue" (Unix timestamp)
- `date_created` - When payment record was created
- `date_updated` - Last modification

**Linking to Jobs:**
- `primary.id` - Main entity (could be job or invoice)
- `primary.type` - Entity type ("job", "invoice", "contact")
- `related` - Array of all related entities
  - Filter for `type: "job"` to get job JNID
  - Use `id` field to link to job records

**Payment Source:**
- `PaymentSource` - "Invoice" or null (manual payment)
- `created_by_processor` - "Payrix" (online) or null (manual)
- `method_id` - Payment method type
  - 1 = Check (appears to be check)
  - 3 = Credit Card (appears to be card)

**Attribution:**
- `sales_rep` / `sales_rep_name` - Who gets credit for the sale

**Status:**
- `is_active: true` - Include in revenue calculations
- `is_archived: true` - Exclude from revenue calculations

### Linking Payments to Jobs

**Method 1 - Check primary field:**
```python
def get_job_from_payment(payment):
    if payment.get('primary', {}).get('type') == 'job':
        return payment['primary']['id']
    return None
```

**Method 2 - Search related array (more reliable):**
```python
def get_job_from_payment(payment):
    for related_item in payment.get('related', []):
        if related_item.get('type') == 'job':
            return related_item['id']
    return None
```

### Calculating This Month's Revenue

```python
from datetime import datetime

def calculate_monthly_revenue(payments, year, month):
    # Get month boundaries
    month_start = datetime(year, month, 1)
    if month == 12:
        month_end = datetime(year + 1, 1, 1)
    else:
        month_end = datetime(year, month + 1, 1)
    
    month_start_ts = int(month_start.timestamp())
    month_end_ts = int(month_end.timestamp())
    
    # Filter and sum
    monthly_total = 0
    monthly_payments = []
    
    for payment in payments:
        # Skip archived payments
        if payment.get('is_archived'):
            continue
        
        # Check date
        payment_date = payment.get('date_payment', 0)
        if month_start_ts <= payment_date < month_end_ts:
            # Calculate net amount
            total = payment.get('total', 0)
            credit = payment.get('credit', 0)
            net = total - credit
            
            monthly_total += net
            monthly_payments.append(payment)
    
    return {
        'total_revenue': monthly_total,
        'payment_count': len(monthly_payments),
        'payments': monthly_payments
    }

# Usage
import requests

headers = {
    "Authorization": "bearer YOUR_TOKEN",
    "Content-Type": "application/json"
}

response = requests.get('https://app.jobnimbus.com/api1/payments', headers=headers)
payments = response.json()['results']

# This month
now = datetime.now()
result = calculate_monthly_revenue(payments, now.year, now.month)
print(f"This Month's Revenue: ${result['total_revenue']:,.2f}")
print(f"Number of Payments: {result['payment_count']}")
```

### Important Note: Payrix vs Manual Payments
You have TWO types of payments:
1. **Payrix payments** - `created_by_processor: "Payrix"` (online credit card processing)
2. **Manual payments** - `created_by_processor: null` (checks, cash, manually recorded)

Both show up in Job Nimbus payments endpoint, so you have complete payment history ✅

### Critical Revenue Fields
```
approved_estimate_total: 0
approved_invoice_total: 0
```
- **approved_estimate_total:** Total value of customer-approved estimates
  - Approved = customer clicked approval link OR manually marked approved by team
  - **Dashboard use:** "Sold" value, pipeline value
  
- **approved_invoice_total:** Total value of customer-approved invoices
  - **Dashboard use:** Completed job revenue, accounts receivable

### Supporting Revenue Fields
```
last_estimate: 0
last_invoice: 0
last_estimate_date_created: 0
last_invoice_date_created: 0
```
- **last_estimate/last_invoice:** Most recent estimate/invoice amount (may not be approved)
- Use the `approved_*` fields for accurate sales reporting

### Parent Rollup Fields
```
parent_approved_estimate_total: 0
parent_approved_invoice_total: 0
```
- **What it is:** Aggregated totals from sub-jobs (if this job has child jobs)
- **Dashboard use:** May need to dedupe if counting both parent and child jobs

---

## Sales Attribution

### Primary Attribution
```
sales_rep: "m9d3tifvv4yqp5wz16bslcx"
sales_rep_name: "Michael Blake"
```
- **What it is:** The person who contacts the customer and drives the sale
- **Dashboard use:** Primary field for "Sales by Rep" reporting
- **Note:** This is the person who gets credit for the deal

### Job Ownership
```
owners: [
  {
    "id": "m9d3tifvv4yqp5wz16bslcx"
  }
]
```
- **What it is:** Person(s) currently responsible for the job
- **Note:** Usually starts as the sales_rep, but may change to production manager after sale
- **Dashboard use:** Use `sales_rep` for sales metrics, `owners` for operational tracking

### Lead Source
```
source: 18
source_name: "Michael's Referral"
```
- **What it is:** How the lead was generated
- **Dashboard use:** Marketing attribution, lead source performance

### Created By
```
created_by: "mbqshuan4vn4qe8vz6frtjs"
created_by_name: "Admin Team"
```
- **What it is:** User or automation that created the job record
- **Note:** May be admin staff or N8N automation - NOT used for sales credit

---

## Customer Information

### Primary Contact
```
primary: {
  "id": "mi7oq08a4mf8r7c7lp5xpxe",
  "name": "Katie Patterson",
  "number": "1616",
  "type": "contact"
}
```
- **What it is:** Main contact for this job
- Contact has its own workflow/status (separate from job workflow)
- As job status changes, contact status may also change

### Customer Reference
```
customer: "m9bnef0tpm14lu8snfl17rd"
```
- **What it is:** The parent customer/account record
- Multiple jobs can share the same customer

---

## Job Identification

```
jnid: "mi7oqvx6gfj7d6r2ulv3se3"  // Internal unique ID
number: "1505"                     // User-facing job number
name: "5317 West 141st Terr - Katie Patterson"
recid: 1505
```
- **jnid:** Use for API operations
- **number:** Display in UI (#1505)
- **name:** Auto-generated display name
- **recid:** Legacy record ID

---

## Custom Fields

### Field Types & Icons
- 📋 **Option List** (dropdown) - e.g., "Market Type", "Service Type"
- ✍️ **Text Field** - e.g., "CompanyCam", "Adjuster Name", "Warranty #"
- 🔢 **Number Field** (#) - e.g., "Deductible", "Total Squares Installed"
- 📅 **Date Field** - e.g., "Initial Appt. Date", "Date of Completion"
- ☑️ **Yes/No Field** (checkbox) - e.g., "Sub Trades", "Invoice Sent"
- 💰 **Decimal Field** - e.g., "Contract Amount"

### Current Visible Custom Fields

**Business Classification:**
- Market Type (Option List) - e.g., "Residential", "Commercial"
- Service Type (Option List)
- Funding Type (Option List)
- Trade Scope (Option List)

**Insurance-Specific:**
- Insurance Company (Option List)
- Claim # (Text)
- Adjuster Name (Text)
- Adjuster Phone (Text)
- Adjuster Email (Text)
- Deductible (Number)

**Job Details:**
- Roof Age (Option List)
- New Chosen Shingle Color (Option List)
- Maintenance Type (MP) (Option List)
- CompanyCam (Text) - CompanyCam project ID
- Warranty # (Text)
- Contract Amount (Decimal)

**Production Metrics:**
- Total Squares Installed (Number)
- Total Bundles Returned (Number)
- Total Steep SQ (Number)
- Total Flat SQ (Number)
- Total Decking (Number)
- Total Chimneys & Skylight Inst (Number)
- Total SQ of any Extra Layer (Number)
- Owed for self loading shingles (Number)

**Project Management Checkboxes:**
- Sub Trades (Yes/No)
- Invoice Sent (Yes/No)
- Invoice Received (Yes/No)
- Permit Pulled (Yes/No)
- Load List Complete (Yes/No)
- Delivery Confirmed (Yes/No)
- Initial Appt. Completed (Yes/No)
- Supplement Complete (Yes/No)

**Subcontractor Specific:**
- Choose Sub Trades (Option List)
- Primary Contact Contact Type (Option List)

**Date Tracking:**
- Initial Appt. Date (Date)
- Expected Delivery Date (Date)
- Actual Material Delivery Date (Date)
- Date of Completion (Date)

### Mapping to JSON Fields
These custom fields map to the generic cf_* fields in the JSON:
- `cf_string_*` → Text fields (CompanyCam, Adjuster Name, etc.)
- `cf_long_*` → Number fields (Deductible, Total Squares, etc.)
- `cf_boolean_*` → Yes/No fields (Invoice Sent, Permit Pulled, etc.)

**To get exact mappings:** Query the Job Nimbus field configuration API or inspect the JSON keys on actual job records.

### AI Agent Automation Opportunities

**Auto-populate based on patterns:**
1. **Market Type** - detect from address (residential vs commercial zip codes)
2. **Service Type** - infer from record_type_name
3. **Roof Age** - calculate from property records API
4. **Insurance Company** - extract from emails/documents
5. **Claim #** - extract from emails/documents
6. **Adjuster Info** - parse from email signatures
7. **Initial Appt. Completed** - auto-check when status changes from "Appointment Scheduled"
8. **Supplement Complete** - auto-check when supplement documents uploaded

**Auto-calculate production metrics:**
- Parse material delivery receipts → populate Total Squares, Bundles
- Integrate with CompanyCam → auto-populate project link
- Extract from estimates → pre-fill Total Decking, Chimneys, etc.

---

## Subcontractor Tracking

```
subcontractors: [
  {
    "id": "subcontractor_jnid",
    "name": "ABC Roofing Crew"
  }
]
```

**Purpose:**
- Gives subcontractor access to job in their calendar
- Allows them to view photos, add notes
- Tracks who to pay for completed work

**Dashboard Use:**
- Subcontractor performance metrics
- Jobs assigned per subcontractor
- Payment tracking (jobs with subcontractors pending payment)

**Key Queries:**
```
Jobs with unpaid subs = WHERE subcontractors.length > 0 
  AND status_name NOT IN ["Paid & Closed"]
  AND stage = "Accounts Receivable"
```

---

## Lead Source Analysis

```
source: 18
source_name: "Michael's Referral"
```

### Conversion by Source
Track these metrics per lead source:
```python
def analyze_lead_source(jobs):
    by_source = {}
    for source_name in get_unique_sources(jobs):
        source_jobs = [j for j in jobs if j['source_name'] == source_name]
        
        by_source[source_name] = {
            'total_leads': len(source_jobs),
            'won': len([j for j in source_jobs if j['status_name'] == 'Signed Contract']),
            'lost': len([j for j in source_jobs if get_stage(j['record_type'], j['status_name']) == 'Lost']),
            'in_progress': len([j for j in source_jobs if get_stage(j['record_type'], j['status_name']) in ['Lead', 'Estimating']]),
            'total_revenue': sum(j.get('approved_estimate_total', 0) for j in source_jobs if j['status_name'] == 'Signed Contract'),
            'conversion_rate': calculate_conversion(source_jobs),
            'avg_job_value': calculate_avg_value(source_jobs)
        }
    
    return by_source
```

**Key Metrics to Track:**
- Leads by source
- Conversion rate by source
- Average job value by source
- Revenue by source
- Cost per lead by source (if you track marketing costs)
- Time to close by source

---

## Gross Profit & Margin Tracking

### Available Fields
```
last_budget_gross_margin: 0
last_budget_gross_profit: 0
last_budget_revenue: 0
```

These are likely from the "Profit Tracker" feature in Job Nimbus.

### Calculating True Margins
```python
def calculate_job_profitability(job, payments, expenses):
    # Revenue (what you collected)
    revenue = sum(p['amount'] for p in payments if p['job_jnid'] == job['jnid'])
    
    # Direct costs
    materials = sum(e['amount'] for e in expenses if e['job_jnid'] == job['jnid'] and e['type'] == 'materials')
    labor = sum(e['amount'] for e in expenses if e['job_jnid'] == job['jnid'] and e['type'] == 'labor')
    subcontractor_cost = sum(e['amount'] for e in expenses if e['job_jnid'] == job['jnid'] and e['type'] == 'subcontractor')
    
    # Gross profit
    total_costs = materials + labor + subcontractor_cost
    gross_profit = revenue - total_costs
    gross_margin = (gross_profit / revenue * 100) if revenue > 0 else 0
    
    return {
        'revenue': revenue,
        'costs': total_costs,
        'gross_profit': gross_profit,
        'gross_margin_pct': gross_margin
    }
```

**Dashboard Metrics:**
- Gross profit by job type
- Gross margin % by sales rep
- Jobs with negative margin (losing money)
- Margin trend over time
- Budget vs actual variance

**Note:** You'll need to integrate with expenses/payments APIs to get accurate cost data.

---

## Tags System

```
tags: [
  "urgent",
  "high-value",
  "warranty-work"
]
```

**Current Usage:** Minimal

**AI Agent Automation Potential:**
Auto-tag jobs based on:
1. **Job value** → "high-value" (>$20k), "medium-value" ($10-20k), "low-value" (<$10k)
2. **Velocity** → "fast-close" (Lead → Sold in <7 days), "stalled" (in Lead/Estimating >30 days)
3. **Source type** → "referral", "insurance-claim", "organic"
4. **Risk indicators** → "payment-risk" (no deposit after 7 days), "scope-change" (multiple supplements)
5. **Priority** → "urgent" (customer requested ASAP), "scheduled" (has install date)
6. **Seasonal** → "storm-damage", "fall-rush", "winter-job"

**Use Cases:**
- Quick filtering on dashboard
- Automated workflows (send reminder emails to "stalled" jobs)
- Priority sorting for sales reps
- Risk management alerts

---

## Unknown/Unused Fields

### class_id / class_name
```
class_id: null
class_name: null
```
**Purpose:** Unknown - possibly for accounting integration or internal categorization
**Dashboard Use:** Can likely ignore unless you use QuickBooks classes

### fieldassists
```
fieldassists: []
```
**Purpose:** Unknown - possibly related to field service management features
**Dashboard Use:** Can likely ignore

**Recommendation:** Query Job Nimbus support or documentation for these fields if you plan to use them.

---

## Custom Fields

### Boolean Fields
```
cf_boolean_1: false
cf_boolean_3: false
...
```
- Configurable true/false fields
- Bottom of JSON shows human-readable names:
  - "Invoice Sent": false
  - "Permit Pulled": false
  - "Supplement Complete": false

### String Fields
```
cf_string_10: "Residential"
```
- Configurable text fields
- Maps to named fields like "Market Type": "Residential"

### Numeric Fields
```
cf_long_1: 0
cf_long_2: 0
...
```
- Configurable number fields
- Maps to named fields like:
  - "Deductible": 0
  - "Total Squares Installed": 0

**Note:** Custom field mappings are defined per Job Nimbus account. Check field settings to confirm which cf_* fields map to which display names.

---

## Dashboard Calculations

### Sales Timing & Recognition
**"This Month's Revenue" Definition:**
- **PRIMARY:** When payment is recorded on the job (actual cash collected)
- **NOT** when status changes to "Paid & Closed"
- Jobs can be in various statuses but still have payments recorded

**Implementation:**
You'll need to query the payments/invoices endpoint separately to get actual payment dates:
```
GET /api/v1.6/payments
Filter by: date_payment >= start_of_month AND date_payment <= end_of_month
Sum: payment_amount
Group by: job_jnid
```

**Fallback Method (if payment data unavailable):**
- Use jobs WHERE `status_name` IN ["Paid & Closed"] 
- AND `date_status_change` within target month
- This is less accurate but workable

**Note:** Revenue recognition should be cash-basis (when paid), not accrual-basis (when invoiced).

### Conversion Metrics
```
# Use status_name for cross-workflow queries
Jobs by Stage = COUNT(jobs) WHERE status_name IN (stage_status_list)
Conversion Rate = COUNT(status_name IN ['Signed Contract']) / COUNT(status_name IN ['Lead', 'Contacting', 'Appointment Scheduled'])
Average Days in Stage = AVG(date_status_change - previous_date_status_change)
```

### Revenue Metrics
```
# PRIMARY METHOD - Payment-based revenue (most accurate)
This Month's Revenue = SUM(payment_amount) 
  WHERE date_payment >= start_of_month 
  AND date_payment <= end_of_month
  GROUP BY job_jnid

# FALLBACK METHOD - Status-based (if payment data unavailable)
This Month's Revenue = SUM(approved_invoice_total) 
  WHERE status_name IN ("Paid & Closed", "Completed")
  AND date_status_change >= start_of_month 
  AND date_status_change <= end_of_month

# Other revenue metrics
Pipeline Value = SUM(approved_estimate_total) WHERE stage IN ("Estimating", "Sold")
Outstanding AR = SUM(approved_invoice_total) WHERE stage = "Accounts Receivable"
```

### Lead Source Performance
```python
# Conversion by source
def source_performance(jobs):
    return {
        'leads': COUNT(jobs) GROUP BY source_name,
        'won': COUNT(jobs WHERE status_name = 'Signed Contract') GROUP BY source_name,
        'conversion_rate': won / leads,
        'avg_job_value': AVG(approved_estimate_total WHERE status_name = 'Signed Contract') GROUP BY source_name,
        'total_revenue': SUM(approved_estimate_total WHERE status_name = 'Signed Contract') GROUP BY source_name,
        'avg_days_to_close': AVG(date_sold - date_created) GROUP BY source_name
    }
```

### Profitability Analysis
```python
# By job type
Revenue by Type = SUM(payments) GROUP BY record_type_name
Margin by Type = (SUM(revenue) - SUM(costs)) / SUM(revenue) GROUP BY record_type_name

# By sales rep
Revenue by Rep = SUM(payments) WHERE job.sales_rep = rep_id
Margin by Rep = calculated gross_margin GROUP BY sales_rep_name

# Problem jobs
Negative Margin Jobs = WHERE calculated_gross_margin < 0
Over Budget Jobs = WHERE actual_costs > last_budget_revenue
```

### Subcontractor Tracking
```
Jobs Pending Sub Payment = COUNT(*) 
  WHERE subcontractors.length > 0 
  AND status_name NOT IN ["Paid & Closed"]
  AND stage = "Accounts Receivable"

Revenue per Subcontractor = SUM(approved_invoice_total) 
  WHERE subcontractors.id = sub_id
  AND status_name = "Paid & Closed"
```

### Sales Rep Performance
```
Sales by Rep = SUM(approved_estimate_total) GROUP BY sales_rep_name
Jobs Won by Rep = COUNT(*) WHERE stage="Sold" GROUP BY sales_rep_name
```

### Job Type Analysis
```
Revenue by Job Type = SUM(approved_estimate_total) GROUP BY record_type_name
Jobs by Type = COUNT(*) GROUP BY record_type_name
Avg Job Value by Type = AVG(approved_estimate_total) GROUP BY record_type_name
```

---

## Status Standardization Recommendations

### The Problem
Job Nimbus creates separate status IDs for each workflow, even when status names are identical. This means:
- "Paid & Closed" in Roof Replacement ≠ "Paid & Closed" in Insurance (different IDs)
- Cross-workflow reporting requires using `status_name` strings, not IDs
- Status IDs cannot be used for aggregate queries across workflows

### Solutions

**Option 1: Use status_name (Recommended for Dashboard)**
- Query by `status_name` for all cross-workflow reports
- Pros: Works immediately, no Job Nimbus changes needed
- Cons: Slower queries, requires exact string matching

**Option 2: Standardize in Job Nimbus (Long-term)**
If you want truly unified statuses across workflows:
1. Create a master "Status Mapping" table in your database
2. Map all `status` IDs to canonical status names
3. Use this lookup for reporting

**Option 3: Stage-Level Reporting**
- Use the stage mappings (Lead, Estimating, Sold, etc.) as your primary metric
- Stages are consistent concepts across workflows
- Build helper function to determine stage from `record_type` + `status_name`

### Recommended Dashboard Approach
```python
# Helper function to normalize data
def enrich_job_data(job):
    job['stage'] = get_stage(job['record_type'], job['status_name'])
    job['is_won'] = job['status_name'] == 'Signed Contract'
    job['is_completed'] = job['status_name'] in ['Paid & Closed', 'Request Review']
    job['is_lost'] = job['status_name'] in ['Lost', 'Hold', 'Rehash', 'Lost Repairs']
    return job

# Then report on stage, not individual statuses
jobs_by_stage = df.groupby(['record_type_name', 'stage']).size()
```

---

## Quick Stage Lookup Helper

When processing JSON data, use this logic to determine stage from status_name:

```python
# Record type ID to workflow name mapping
RECORD_TYPE_TO_WORKFLOW = {
    47: "Legacy",  # Bob's Workflow
    57: "Insurance",
    58: "Repairs",
    59: "Maintenance Plan",
    61: "Real Estate",
    62: "Roof Replacement",
    63: "Roof Replacement",  # Window Replacement
    64: "Roof Replacement",  # Siding Replacement
    65: "Roof Replacement",  # Gutter Replacement
}

# Stage lookup by workflow and status_name
# ⚠️ Always use status_name (not status ID) when calling get_stage()
STAGE_MAPPINGS = {
    "Roof Replacement": {  # Also: Window, Siding, Gutter Replacement
        "Lead": ["Lead", "Contacting", "Appointment Scheduled", "Needs Rescheduling"],
        "Estimating": ["Estimating", "Estimate Sent", "Bob's Estimate Sent"],
        "Sold": ["Signed Contract"],
        "In Production": ["Pre-Production", "Ready for Install", "Job Scheduled", 
                         "In Progress", "Job Completed", "Final Walk Through"],
        "Accounts Receivable": ["Invoiced Customer", "Back End Audit", "Pay the Crew", 
                               "Bob's Collection", "Paid & Closed"],
        "Completed": ["Request Review"],
        "Lost": ["Hold", "Rehash", "Lost"]
    },
    "Insurance": {
        "Lead": ["Lead", "Contacting", "Appointment Scheduled", "Adjuster Appt. Scheduled", "Needs Rescheduling"],
        "Estimating": ["Waiting on Adjuster", "Estimating", "Estimate Sent", "Bob's Estimate Sent"],
        "Sold": ["Signed Contract"],
        "In Production": ["Supplementing", "Appraisal", "Pre-Production", "Ready for Install", 
                         "Job Scheduled", "In Progress", "Job Completed", "Final Walk Through",
                         "Lawyer (Appraisal/Litigation)"],
        "Accounts Receivable": ["Invoiced Insurance", "Invoiced Customer", "Back End Audit", 
                               "Pay the Crew", "Paid & Closed", "Bob's Collection"],
        "Completed": ["Request Review"],
        "Lost": ["Hold", "Rehash", "Lost"]
    },
    "Repairs": {
        "Lead": ["New Lead", "Contacting", "Appointment Scheduled"],
        "Estimating": ["Estimating", "Estimate Sent", "Bob's Estimate Sent"],
        "Sold": ["Signed Contract"],
        "In Production": ["Repair Scheduled", "Repair in Progress", "Job Complete"],
        "Accounts Receivable": ["Invoice Sent", "Bob's Collection", "Paid & Closed"],
        "Completed": ["Request Review"],
        "Lost": ["Lost Repairs", "Rehash", "Referral/Newsletter"]
    },
    "Real Estate": {
        "Lead": ["Lead", "Contacting", "Appointment Scheduled", "Needs Rescheduling"],
        "Estimating": ["Estimating", "Estimate Sent", "Bob's Estimate Sent"],
        "Sold": ["Signed Contract"],
        "In Production": ["Pre-Production", "Ready for Install", "Job Scheduled", 
                         "In Progress", "Job Complete", "Final Walk Through"],
        "Accounts Receivable": ["Invoiced Customer", "Back End Audit", "Pay the Crew", 
                               "Bob's Collection", "Paid & Closed"],
        "Completed": ["Request Review"],
        "Lost": ["Hold", "Rehash", "Lost"]
    },
    "Maintenance Plan": {
        "Lead": ["Enrolled"],
        "Sold": ["Scheduled"],
        "In Production": ["In Progress", "Service Complete"],
        "Completed": ["Renewal", "Referral/Newsletter"]
    },
    "Legacy": {
        "Lead": ["Lead", "Booking"],
        "Estimating": ["Proposal Sent"],
        "Sold": ["Signed Contract"],
        "In Production": ["Pre-Production", "Delivery", "In Progress", "Job Complete"],
        "Accounts Receivable": ["Invoiced", "Pending Payments", "Paid & Closed"],
        "Completed": ["Pending Google Review"],
        "Lost": ["Lost", "Rehash"],
        "None": ["Data Migration Review"]
    }
}

# Function to get stage
def get_stage(record_type_or_name, status_name):
    # Handle numeric record_type ID
    if isinstance(record_type_or_name, int):
        workflow = RECORD_TYPE_TO_WORKFLOW.get(record_type_or_name, "Unknown")
    else:
        # Handle record_type_name string
        workflow = record_type_or_name
        # Map variations to base workflow
        if workflow in ["Window Replacement", "Siding Replacement", "Gutter Replacement"]:
            workflow = "Roof Replacement"
    
    stage_map = STAGE_MAPPINGS.get(workflow, {})
    for stage, statuses in stage_map.items():
        if status_name in statuses:
            return stage
    return None  # Unknown status

# Example usage:
# get_stage(62, "Appointment Scheduled")  # Returns "Lead"
# get_stage("Insurance", "Waiting on Adjuster")  # Returns "Estimating"

# Example dashboard queries using status_name:
def get_monthly_sales(jobs, year, month):
    """Get jobs that reached 'Paid & Closed' in a specific month"""
    completed_statuses = ['Paid & Closed', 'Request Review']
    return [
        job for job in jobs
        if job['status_name'] in completed_statuses
        and is_in_month(job['date_status_change'], year, month)
    ]

def get_conversion_rate(jobs, record_type_name):
    """Calculate lead-to-sale conversion rate for a job type"""
    # Get all jobs of this type
    type_jobs = [j for j in jobs if j['record_type_name'] == record_type_name]
    
    # Count leads (any job that started)
    total_leads = len(type_jobs)
    
    # Count wins (jobs that reached "Signed Contract")
    wins = len([j for j in type_jobs if j['status_name'] == 'Signed Contract'])
    
    return wins / total_leads if total_leads > 0 else 0

def get_pipeline_by_stage(jobs):
    """Group all active jobs by stage, regardless of workflow"""
    from collections import defaultdict
    pipeline = defaultdict(list)
    
    for job in jobs:
        if job['is_active'] and not job['is_archived']:
            stage = get_stage(job['record_type'], job['status_name'])
            if stage:
                pipeline[stage].append(job)
    
    return dict(pipeline)
```

---

## Filtering Best Practices

### Active Jobs Only
```
WHERE is_active = true AND is_archived = false
```

### Cross-Workflow Filtering (ALWAYS use status_name)
```
-- ✅ CORRECT: Use status_name for queries across multiple workflows
WHERE status_name = 'Paid & Closed'

-- ❌ WRONG: Status ID will only match one workflow
WHERE status = 490  -- This only matches Paid & Closed in ONE workflow
```

### Single-Workflow Filtering (can use status ID)
```
-- ✅ OK: When filtering within one record_type, status ID is safe
WHERE record_type = 62 AND status = 742
```

### Exclude Test/Invalid Jobs
```
WHERE record_type_name IS NOT NULL
AND customer IS NOT NULL
```

### Date Range Filtering
Use `date_status_change` for stage conversion tracking
Use `date_created` for new lead reporting
Use `date_updated` for recent activity

---

## Notes

- All dates are Unix timestamps (seconds since 1970-01-01)
- All monetary values are in USD dollars (not cents)
- Job numbers are auto-incrementing integers
- JNIDs are permanent unique identifiers (use for API references)
- **Workflows are customizable** - status names and stage mappings can be modified in Job Nimbus settings
- Always validate current workflow configuration if statuses seem unexpected
- Some record types share the same workflow structure (e.g., all exterior replacement jobs use Roof Replacement workflow)
- **⚠️ CRITICAL:** `status` IDs are workflow-specific. The same status name (e.g., "Lost") will have different IDs across workflows. Always use `status_name` for cross-workflow queries.
