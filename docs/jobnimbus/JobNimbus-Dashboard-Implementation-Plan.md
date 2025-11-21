# Job Nimbus Dashboard Implementation Plan

## Phase 1: Core Dashboard Setup (Week 1-2)

### Essential API Endpoints Needed
1. **Jobs/Contacts Endpoint** - Already have ✅
   - `GET /api/v1.6/jobs`
   - Returns all job data with custom fields

2. **Payments Endpoint** - **NEXT STEP** 🚨
   - `GET /api1/payments` 
   - Needed for accurate revenue recognition
   - Filter by date_payment for monthly revenue
   - **Run test script first:** `python test_payments_api.py <your_token>`

3. **Payment Processing Context:**
   - **Job Nimbus Payments** - Payment records in your CRM
   - **Payrix** - Your actual payment processor (like Stripe)
   - Start with Job Nimbus payments endpoint
   - If incomplete, can integrate Payrix API as backup

4. **Expenses Endpoint** - For profitability
   - `GET /api/v1.6/expenses` or check Profit Tracker API
   - Needed for gross margin calculations

5. **Lead Sources Lookup** - Optional
   - May need to query for all unique source IDs/names
   - Build reference table

### Core Metrics to Build First

**Priority 1 - Sales Velocity:**
```
1. This Month's Revenue (payment-based)
2. Pipeline Value by Stage
3. New Leads This Month
4. Conversion Rate (Lead → Won)
5. Average Days to Close
```

**Priority 2 - Job Type Performance:**
```
6. Revenue by record_type_name
7. Jobs Won by record_type_name
8. Average Job Value by type
9. Win Rate by type
```

**Priority 3 - Sales Rep Performance:**
```
10. Revenue by sales_rep_name
11. Jobs Won by sales_rep
12. Conversion Rate by sales_rep
13. Pipeline by sales_rep
```

### Data Structure
```python
# Recommended data warehouse structure
class Job:
    # Core fields
    jnid: str
    number: int
    record_type: int
    record_type_name: str
    status: int
    status_name: str
    stage: str  # Calculated from status_name
    
    # Revenue
    approved_estimate_total: float
    approved_invoice_total: float
    
    # Attribution
    sales_rep: str
    sales_rep_name: str
    source_name: str
    
    # Dates
    date_created: int  # Unix timestamp
    date_status_change: int
    date_sold: int  # When hit "Signed Contract"
    date_completed: int  # When hit "Paid & Closed"
    
    # Calculated fields
    stage: str
    is_won: bool
    is_closed: bool
    is_lost: bool
    days_in_stage: int
    days_to_close: int

class Payment:
    jnid: str
    job_jnid: str
    amount: float
    date_payment: int  # Unix timestamp
    payment_method: str
    
class Expense:
    jnid: str
    job_jnid: str
    amount: float
    type: str  # materials, labor, subcontractor
    date_expense: int
```

---

## Phase 2: Critical Workflow Improvements (Week 3-4)

### 🔴 MUST FIX: Status Name Inconsistencies

**Problem:** "Completed" means different things across workflows
- Repairs: "Completed" = In Production stage
- Maintenance Plan: "Completed" = In Production stage  
- Others: "Completed" = different meaning

**Solution - Rename in Job Nimbus:**
```
BEFORE                          AFTER
----------------------------------------
Repairs - Completed         →   Repairs - Job Complete
Maintenance - Completed     →   Maintenance - Service Complete
Legacy - Job Completed      →   Legacy - Job Complete
All others - Completed      →   Job Complete (standardize)
```

**Impact:** Makes status_name unambiguous for reporting

**Time to implement:** 30 minutes in Job Nimbus settings

---

### 🟡 RECOMMENDED: Add Missing Statuses

**1. Add "Deposit Received" (Sold Stage)**
- Goes between "Signed Contract" and "Pre-Production"
- Critical for cash flow tracking
- Identifies financing issues early

**2. Add "Contract Sent" (Estimating Stage)**
- Goes between "Estimate Sent" and "Signed Contract"
- Shows active pursuit vs stalled estimates
- Improves close rate tracking

**3. Split "Lost" Reasons**
- Lost - Price Too High
- Lost - Timing Not Right
- Lost - Chose Competitor
- Lost - No Response
- Lost - Not Interested

This enables loss analysis and improves future estimates.

---

### 🟢 NICE TO HAVE: Standardize Stage Names

**Current inconsistencies:**
- Some workflows: "In Production"
- Others: "Production"
- Some: "Accounts Receivable"
- Others: Skip it entirely

**Proposed Standard Stages:**
1. Lead
2. Estimating
3. Sold
4. Production (not "In Production")
5. Invoicing (not "Accounts Receivable")
6. Completed
7. Follow-Up (for reviews/renewals)
8. Lost

**Implementation:**
- Edit each workflow in Job Nimbus settings
- Update stage dropdown for each status
- Takes 2-3 hours for all workflows
- Massive improvement to cross-workflow reporting

---

## Phase 3: AI Agent Automation (Week 5-8)

### Auto-Population Agents

**Agent 1: Field Extractor (Email/Document Parser)**
```python
# Monitors inbox for estimate requests/insurance claims
# Extracts and auto-fills:
- Insurance Company name
- Claim Number
- Adjuster Name, Phone, Email
- Initial Appt. Date from calendar invites

Trigger: New email from known insurance domain
Action: Parse email → Create/update job → Fill custom fields
```

**Agent 2: Checkbox Automator**
```python
# Monitors job status changes and document uploads
# Auto-checks boxes based on events:

Status = "Estimating" → Check "Initial Appt. Completed"
Document type = "supplement" uploaded → Check "Supplement Complete"
Status = "Pre-Production" → Check "Permit Pulled" (if permit doc exists)
Status = "Job Scheduled" → Check "Delivery Confirmed"

Trigger: Status change or document upload
Action: Update boolean custom fields
```

**Agent 3: Smart Tagger**
```python
# Tags jobs based on data patterns
Rules:
- approved_estimate_total > 20000 → Tag: "high-value"
- Days in "Lead" stage > 30 → Tag: "stalled"
- source_name contains "referral" → Tag: "referral"
- status = "Signed Contract" AND no deposit → Tag: "payment-risk"
- Insurance job + supplement count > 2 → Tag: "scope-change"
- Maintenance Plan + renewal due in 30 days → Tag: "renewal-pending"

Trigger: Nightly batch process
Action: Update tags array
```

**Agent 4: Data Enrichment**
```python
# Enriches job data from external sources
- Lookup property records → Fill "Roof Age"
- Check weather data for damage dates → Insurance claims
- Geocode address → Confirm Market Type (residential vs commercial)
- Lookup business entity → Commercial Market Type

Trigger: New job created
Action: Call external APIs → Update custom fields
```

### Implementation Priority
1. **Start with Agent 2 (Checkbox Automator)** - Easiest, immediate time savings
2. **Then Agent 3 (Smart Tagger)** - High value, enables smart filtering
3. **Then Agent 1 (Field Extractor)** - More complex, needs email integration
4. **Finally Agent 4 (Data Enrichment)** - Requires external API subscriptions

---

## Phase 4: Advanced Analytics (Week 9-12)

### Predictive Metrics

**Lead Scoring:**
```python
# Predict likelihood to close based on:
- Lead source (historical conversion rates)
- Job type
- Estimate value range
- Response time
- Days in stage

Output: Lead score 0-100
Use: Prioritize sales rep follow-up
```

**Revenue Forecasting:**
```python
# Predict monthly revenue based on:
- Current pipeline by stage
- Historical stage conversion rates
- Average days per stage
- Seasonality adjustments

Output: Expected revenue by month (3-month forecast)
Use: Cash flow planning
```

**Margin Alerts:**
```python
# Flag jobs with margin risk:
- Actual costs exceeding budget by 10%+
- Jobs in Production >30 days (labor overrun)
- Multiple supplements (scope creep)

Output: Alert list with risk factors
Use: Project management intervention
```

---

## Data Integration Architecture

### Recommended Setup

```
Job Nimbus API
     ↓
[n8n Automation Platform]
     ↓
PostgreSQL Database
     ↓
[Dashboard App]
     ↓
User Interface
```

**Why this approach:**
1. n8n handles API polling, data transformation, AI agents
2. PostgreSQL stores clean, structured data
3. Dashboard reads from database (fast queries)
4. Decoupled = easier to change/improve

**Alternative (Simpler):**
```
Job Nimbus API
     ↓
[Dashboard App with caching]
     ↓
User Interface
```

**Pros:** Simpler, fewer moving parts
**Cons:** Slower, harder to add AI agents, limited historical analysis

---

## Critical Next Steps

### This Week:
1. ✅ **TEST PAYMENTS API** - Run the test script to see actual payment structure
   ```bash
   python test_payments_api.py <your_api_token>
   ```
   This will show you:
   - What fields are available in payment records
   - How payments link to jobs
   - This month's revenue calculation
   - Payment grouping by job
   
2. ✅ Get API access to Job Nimbus payments endpoint
3. ✅ Query actual payment records, confirm data structure
4. ✅ Build simple "This Month Revenue" report (payment-based)
5. ✅ Rename "Completed" statuses across workflows

### Next Week:
1. Build stage mapping lookup (use Python code from data dictionary)
2. Create job type performance dashboard
3. Add sales rep leaderboard
4. Set up daily data sync from Job Nimbus

### Month 2:
1. Add lead source conversion tracking
2. Implement smart tagging (Agent 3)
3. Build pipeline velocity metrics
4. Add gross margin tracking (once expense data available)

---

## Quick Wins (Do These First)

### 1. Fix "Completed" Status Names (30 min)
Go into Job Nimbus → Settings → Workflows → Rename all "Completed" statuses to be specific:
- "Job Complete" for production-stage completions
- "Paid & Closed" stays as-is
- "Request Review" stays as-is

### 2. Add "Deposit Received" Status (15 min)
In all workflows:
- Add new status: "Deposit Received"
- Stage: Sold
- Position: Between "Signed Contract" and "Pre-Production"

### 3. Build Simple Revenue Dashboard (2 hours)
Using payment data:
- This Month Revenue
- Last Month Revenue
- Year-to-Date Revenue
- Revenue by Job Type (top 5)
- Revenue by Sales Rep (top 5)

This gives immediate value while you build more sophisticated reporting.

---

## Questions to Resolve

### Payment Data Structure
**Need to know:**
- What endpoint returns payment records?
- Do payments have date_payment field?
- Can we filter payments by date range?
- Are partial payments recorded separately or aggregated?

### Expense/Cost Data
**Need to know:**
- How are material costs recorded?
- Are subcontractor payments tracked in Job Nimbus?
- Where does labor cost come from?
- Is there a Profit Tracker API endpoint?

### Custom Field Mapping
**Need to know:**
- Complete cf_* field mapping (which number = which field name)
- Can we get this from API or only by inspection?

---

## Success Metrics

### After 1 Month:
- [ ] Accurate monthly revenue reporting
- [ ] Pipeline visibility by stage and job type
- [ ] Sales rep performance tracking
- [ ] Lead source conversion rates
- [ ] Status names standardized

### After 3 Months:
- [ ] Gross margin tracking operational
- [ ] AI agents auto-tagging jobs
- [ ] Predictive lead scoring
- [ ] Automated checkbox updates
- [ ] Historical trend analysis

### After 6 Months:
- [ ] Full AI field extraction from emails
- [ ] Revenue forecasting
- [ ] Margin risk alerts
- [ ] Subcontractor performance analytics
- [ ] Seasonal pattern recognition

---

## Budget Considerations

**Option 1: DIY with n8n + Simple Dashboard**
- n8n: Free (self-hosted) or $20/mo (cloud)
- PostgreSQL: Free (self-hosted) or $25/mo (managed)
- Dashboard: Build in React/Next.js (your time)
- **Total:** $45/mo + dev time

**Option 2: Low-Code Platform**
- Retool, Appsmith, or similar: $50-100/mo
- Includes database, dashboard, automation
- **Total:** $50-100/mo + setup time

**Option 3: Hire Developer**
- Custom dashboard + automation
- **Total:** $5-15K one-time + hosting

**Recommendation:** Start with Option 1, upgrade if needed

---

## Final Thoughts

**You're in great shape:**
- Clean data structure in Job Nimbus
- Clear workflow definitions
- Good custom field foundation

**Biggest impact moves:**
1. Fix status name inconsistencies (30 min, massive clarity)
2. Get payment data flowing (enables accurate revenue)
3. Build simple dashboard first (don't overcomplicate)
4. Add AI agents incrementally (start with tagging)

**The path forward is clear.** Want me to build any of these components for you?
