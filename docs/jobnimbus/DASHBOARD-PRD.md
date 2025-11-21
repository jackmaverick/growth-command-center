# Dashboard Product Requirements Document (PRD)

**Project:** Job Nimbus Sales & Revenue Dashboard  
**Version:** 1.0  
**Last Updated:** November 20, 2025  
**Owner:** Development Team

---

## Executive Summary

Build a comprehensive sales and conversion analytics dashboard that provides real-time visibility into revenue, pipeline health, and team performance across all job types.

**Primary Goal:** Accurate monthly revenue tracking based on actual payments received.

---

## Problem Statement

### Current Pain Points
1. **No revenue visibility** - Can't see this month's revenue without manual calculations
2. **No pipeline tracking** - Don't know how many jobs are in each stage
3. **No rep performance data** - Can't compare sales rep effectiveness
4. **No lead source ROI** - Don't know which marketing channels convert best
5. **Manual data entry** - Custom fields require manual updates

### Business Impact
- Can't make data-driven decisions
- No early warning on revenue shortfalls
- Can't optimize sales process
- Can't allocate marketing budget effectively

---

## Success Criteria

### Phase 1 (Week 2)
- [ ] This month's revenue visible in <5 seconds
- [ ] Revenue breakdown by job type
- [ ] Sales rep leaderboard
- [ ] Data refreshes daily automatically

### Phase 2 (Month 1)
- [ ] Lead source conversion rates
- [ ] Pipeline value by stage
- [ ] Average days to close
- [ ] Month-over-month growth trends

### Phase 3 (Month 2)
- [ ] Gross margin tracking
- [ ] Predictive revenue forecasting
- [ ] AI auto-tagging operational
- [ ] Alert system for stalled jobs

---

## User Personas

### 1. Owner/Executive
**Needs:**
- High-level revenue numbers
- Growth trends
- Profitability by job type
- Team performance

**Use Cases:**
- Check this month's revenue daily
- Review month-end reports
- Compare job type profitability
- Make hiring/firing decisions

### 2. Sales Manager
**Needs:**
- Rep performance metrics
- Pipeline visibility
- Conversion rates
- Lead source ROI

**Use Cases:**
- Morning pipeline review
- Weekly rep 1-on-1s with data
- Identify coaching opportunities
- Allocate leads to reps

### 3. Sales Rep
**Needs:**
- Personal performance
- Own pipeline
- Comparison to team
- Commission tracking

**Use Cases:**
- Check personal revenue
- See open opportunities
- Track progress to quota
- Identify stalled leads

### 4. Operations Manager
**Needs:**
- Jobs in production
- Subcontractor assignments
- Material delivery tracking
- Job completion rates

**Use Cases:**
- Daily production review
- Assign subcontractors
- Track job progress
- Identify bottlenecks

---

## Core Features

### 1. Revenue Dashboard (P0 - Must Have)

**Primary Metrics:**
- This Month's Revenue (big number)
- Last Month's Revenue
- Year-to-Date Revenue
- Month-over-Month % Change

**Breakdown Views:**
- Revenue by Job Type (bar chart)
- Revenue by Sales Rep (leaderboard)
- Revenue by Payment Method
- Daily revenue trend (line chart)

**Data Source:** Payments API (`date_payment` field)

**Refresh:** Real-time or hourly

**Requirements:**
- Loads in <2 seconds
- Mobile responsive
- Export to PDF/Excel
- Date range picker

---

### 2. Pipeline Dashboard (P0 - Must Have)

**Metrics:**
- Total Pipeline Value
- Jobs by Stage (funnel chart)
- Conversion Rates (Lead → Sold)
- Average Days Per Stage

**Filters:**
- Job Type
- Sales Rep
- Date Range
- Lead Source

**Requirements:**
- Click stage to see jobs
- Drill down to individual jobs
- Show stalled jobs (>30 days in stage)

---

### 3. Sales Rep Performance (P0 - Must Have)

**Leaderboard Showing:**
- Revenue (this month)
- Jobs Won
- Conversion Rate
- Average Job Value
- Current Pipeline Value

**Individual Rep View:**
- Personal metrics
- Jobs by stage
- Recent wins/losses
- Activity timeline

**Requirements:**
- Sortable columns
- Trend indicators (↑↓)
- Link to CRM records

---

### 4. Job Type Analysis (P1 - Should Have)

**Per Job Type:**
- Total Revenue
- Number of Jobs
- Average Job Value
- Win Rate
- Average Days to Close
- Gross Margin %

**Comparisons:**
- Side-by-side job type comparison
- Trend over time
- Seasonal patterns

---

### 5. Lead Source Performance (P1 - Should Have)

**Per Source:**
- Total Leads
- Conversion Rate
- Revenue Generated
- Average Job Value
- Cost Per Lead (if tracked)
- ROI (if costs tracked)

**Use Case:**
- Identify best marketing channels
- Optimize marketing budget
- Track referral programs

---

### 6. Operational Dashboard (P2 - Nice to Have)

**Metrics:**
- Jobs in Production
- Jobs with Subcontractors
- Pending Payments
- Overdue Invoices

**Alerts:**
- Jobs stalled >30 days
- Payment due >7 days
- Missing required fields

---

## Technical Requirements

### Data Sources
1. **Job Nimbus Jobs API**
   - Endpoint: `GET https://app.jobnimbus.com/api/v1.6/jobs`
   - Refresh: Hourly

2. **Job Nimbus Payments API**
   - Endpoint: `GET https://app.jobnimbus.com/api1/payments`
   - Refresh: Hourly

3. **Stage Determination Logic**
   - See [Stage Mappings](../workflows/STAGE-MAPPINGS.md)
   - Calculate stage from `record_type` + `status_name`

### Performance Requirements
- Dashboard loads in <3 seconds
- Real-time updates (< 1 hour lag)
- Support 1000+ jobs
- Support 10+ concurrent users

### Data Quality Requirements
- Exclude archived jobs/payments
- Handle null values gracefully
- Validate date fields
- Handle partial data scenarios

### Security Requirements
- API tokens stored securely (environment variables)
- Role-based access (exec vs rep vs ops)
- Audit log for data access
- HTTPS only

---

## Data Model

### Jobs Table
```sql
jobs (
  jnid VARCHAR PRIMARY KEY,
  number INT,
  name VARCHAR,
  record_type INT,
  record_type_name VARCHAR,
  status_name VARCHAR,
  stage VARCHAR,  -- Calculated field
  date_created TIMESTAMP,
  date_status_change TIMESTAMP,
  approved_estimate_total DECIMAL,
  approved_invoice_total DECIMAL,
  sales_rep_name VARCHAR,
  source_name VARCHAR,
  is_active BOOLEAN,
  is_archived BOOLEAN
)
```

### Payments Table
```sql
payments (
  jnid VARCHAR PRIMARY KEY,
  job_jnid VARCHAR REFERENCES jobs(jnid),
  total DECIMAL,
  credit DECIMAL,
  date_payment TIMESTAMP,
  sales_rep_name VARCHAR,
  method_id INT,
  created_by_processor VARCHAR,
  is_archived BOOLEAN
)
```

### Stage Mapping (Reference Data)
```sql
stage_mappings (
  record_type_name VARCHAR,
  status_name VARCHAR,
  stage VARCHAR,
  stage_order INT,
  PRIMARY KEY (record_type_name, status_name)
)
```

See [Data Models](../technical/DATA-MODELS.md) for complete schema.

---

## User Interface Mockup

### Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│  🏠 Dashboard  │ 📊 Pipeline │ 👥 Team │ 📈 Reports │
├─────────────────────────────────────────────────────┤
│                                                       │
│  This Month's Revenue         Last Month's Revenue  │
│    $125,432.00  ↑ 12%            $112,100.00        │
│                                                       │
│  YTD Revenue                  Avg Job Value          │
│    $987,234.00                   $15,250.00          │
│                                                       │
├──────────────────────┬──────────────────────────────┤
│                      │                               │
│  Revenue by Type     │  Revenue by Rep               │
│  ┌─────────────┐    │  1. Michael Blake  $45k       │
│  │■■■■■■ Roof  │    │  2. Jack Blake     $42k       │
│  │■■■■ Insurance│    │  3. Bob Blake      $38k       │
│  │■■ Repairs   │    │                               │
│  └─────────────┘    │                               │
│                      │                               │
└──────────────────────┴──────────────────────────────┘
```

### Key UI Components
- Big numbers at top (revenue focus)
- Visual charts (bars, lines, funnels)
- Leaderboards with rankings
- Trend indicators (↑↓)
- Date range picker
- Export buttons
- Filters (job type, rep, date)

---

## Metrics Definitions

### Revenue
**This Month's Revenue:**
```python
SUM(payment.total - payment.credit)
WHERE payment.date_payment >= start_of_month
  AND payment.date_payment < end_of_month
  AND payment.is_archived = false
```

### Conversion Rate
**Lead to Sold:**
```python
COUNT(status_name = "Signed Contract") / COUNT(stage = "Lead")
```

### Average Days to Close
```python
AVG(date_signed_contract - date_created)
WHERE status_name = "Signed Contract"
```

### Pipeline Value
```python
SUM(approved_estimate_total)
WHERE stage IN ("Estimating", "Sold", "In Production")
  AND is_active = true
  AND is_archived = false
```

### Win Rate
```python
COUNT(status_name = "Signed Contract") / 
  (COUNT(stage = "Lead") + COUNT(stage = "Lost"))
```

See [Revenue Calculations](../business-logic/REVENUE-CALCULATIONS.md) for all formulas.

---

## API Integration Points

### Data Sync Flow
```
Job Nimbus API
     ↓  (hourly cron)
[Data Warehouse]
     ↓  (on query)
[Dashboard App]
     ↓
   User Browser
```

### Endpoints Used
1. `GET /api/v1.6/jobs` - All job data
2. `GET /api1/payments` - All payment data
3. Stage mapping logic (local)

### Error Handling
- API rate limit: Exponential backoff
- API timeout: Retry 3x
- Invalid data: Log and skip
- Missing fields: Use defaults

---

## Non-Functional Requirements

### Scalability
- Support 10,000+ jobs
- Support 1,000+ payments/month
- Handle 50+ concurrent users

### Reliability
- 99.5% uptime
- Data sync SLA: < 1 hour
- Backup daily

### Maintainability
- Well-documented code
- Automated tests (>80% coverage)
- Clear error messages
- Logging and monitoring

---

## Out of Scope (V1)

### Explicitly NOT Included:
- ❌ Editing Job Nimbus data (read-only)
- ❌ Creating new jobs
- ❌ Sending notifications
- ❌ Mobile app (mobile web only)
- ❌ Expense tracking (Phase 2)
- ❌ Document management
- ❌ Calendar integration
- ❌ Email integration

These may be added in future phases.

---

## Dependencies

### Required Before Start:
- [ ] Job Nimbus API token
- [ ] API access confirmed
- [ ] Payment data structure validated
- [ ] Stage mappings documented

### Technical Dependencies:
- Job Nimbus API availability
- Database (PostgreSQL recommended)
- Hosting platform
- Authentication system

---

## Timeline

### Phase 1: Core Dashboard (Weeks 1-2)
- Week 1: Setup + Revenue Dashboard
- Week 2: Pipeline + Team Performance

### Phase 2: Enhanced Features (Weeks 3-4)
- Week 3: Job Type Analysis + Lead Sources
- Week 4: Historical Trends + Exports

### Phase 3: AI & Automation (Weeks 5-8)
- Week 5-6: Smart Tagging Agent
- Week 7-8: Checkbox Automation + Alerts

### Phase 4: Advanced Analytics (Weeks 9-12)
- Week 9-10: Profitability Tracking
- Week 11-12: Predictive Analytics

---

## Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| API rate limiting | High | Implement caching, hourly sync |
| Incomplete payment data | High | Validated - data is complete ✅ |
| Status name changes | Medium | Use status_name not IDs |
| Data quality issues | Medium | Validation + error handling |
| Performance at scale | Low | Index database, paginate results |

---

## Success Metrics

### Adoption Metrics:
- 90%+ of team checks dashboard daily
- <5 support tickets per week
- 4.5+ user satisfaction rating

### Business Impact:
- Revenue tracking accuracy >99%
- Time to get revenue number: <5 seconds (vs 30+ minutes manual)
- 20% reduction in stalled jobs
- 15% improvement in conversion rate (via visibility)

---

## Appendix

### Related Documents
- [Jobs API Reference](../api-reference/JOBS-API.md)
- [Payments API Reference](../api-reference/PAYMENTS-API.md)
- [Stage Mappings](../workflows/STAGE-MAPPINGS.md)
- [System Architecture](../technical/ARCHITECTURE.md)
- [Implementation Plan](../implementation/PHASE-1-CORE-DASHBOARD.md)

### Contact
Questions? See [README.md](../README.md)
