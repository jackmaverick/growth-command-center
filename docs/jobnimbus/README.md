# Job Nimbus CRM - Knowledge Base

Complete documentation for integrating with Job Nimbus API and building analytics dashboards.

---

## 📁 Documentation Structure

### 🚀 Getting Started
- **[Quick Start Guide](./GETTING-STARTED.md)** - Start here if you're new
- **[API Authentication](./api-reference/AUTHENTICATION.md)** - How to get and use API tokens

### 📖 API Reference
Core API endpoint documentation:
- **[Jobs API](./api-reference/JOBS-API.md)** - Job records, statuses, custom fields
- **[Payments API](./api-reference/PAYMENTS-API.md)** - Payment records, revenue tracking
- **[Contacts API](./api-reference/CONTACTS-API.md)** - Customer contact records
- **[API Overview](./api-reference/API-OVERVIEW.md)** - Base URLs, rate limits, response formats

### 🔄 Workflows & Business Logic
Understanding Job Nimbus workflows:
- **[Workflow Configurations](./workflows/WORKFLOW-CONFIGURATIONS.md)** - All 9 job type workflows
- **[Stage Mappings](./workflows/STAGE-MAPPINGS.md)** - Status → Stage determination
- **[Stage Determination Code](./workflows/STAGE-DETERMINATION.md)** - Implementation guide
- **[Custom Fields Guide](./workflows/CUSTOM-FIELDS.md)** - All custom fields explained

### 💰 Revenue & Analytics
Business metrics and calculations:
- **[Revenue Calculation Guide](./business-logic/REVENUE-CALCULATIONS.md)** - How to calculate revenue accurately
- **[Profitability Tracking](./business-logic/PROFITABILITY.md)** - Gross margin, job costing
- **[Lead Source Attribution](./business-logic/LEAD-SOURCE-ATTRIBUTION.md)** - Conversion tracking
- **[Sales Rep Performance](./business-logic/SALES-REP-METRICS.md)** - Leaderboard metrics

### 📋 Product Requirements
What we're building:
- **[Dashboard PRD](./prd/DASHBOARD-PRD.md)** - Dashboard feature requirements
- **[AI Agent PRD](./prd/AI-AGENT-PRD.md)** - Automation requirements
- **[Reporting Requirements](./prd/REPORTING-REQUIREMENTS.md)** - Reports needed

### 🏗️ Technical Implementation
For the development team:
- **[System Architecture](./technical/ARCHITECTURE.md)** - Overall system design
- **[Data Models](./technical/DATA-MODELS.md)** - Database schemas
- **[Integration Patterns](./technical/INTEGRATION-PATTERNS.md)** - How to integrate with Job Nimbus
- **[API Best Practices](./technical/BEST-PRACTICES.md)** - Rate limiting, error handling, caching

### 🤖 AI Agents
Automation specifications:
- **[Smart Tagging Agent](./ai-agents/SMART-TAGGING.md)** - Auto-tag jobs
- **[Field Extraction Agent](./ai-agents/FIELD-EXTRACTION.md)** - Parse emails for data
- **[Checkbox Automation Agent](./ai-agents/CHECKBOX-AUTOMATION.md)** - Auto-update checkboxes
- **[Data Enrichment Agent](./ai-agents/DATA-ENRICHMENT.md)** - External data lookup

### 🛠️ Scripts & Tools
Ready-to-use code:
- **[calculate_revenue.py](./scripts/calculate_revenue.py)** - Revenue calculator
- **[test_payments_api.py](./scripts/test_payments_api.py)** - Payment API tester
- **[stage_mapper.py](./scripts/stage_mapper.py)** - Stage determination helper

### 📝 Implementation Plan
Project roadmap:
- **[Phase 1: Core Dashboard](./implementation/PHASE-1-CORE-DASHBOARD.md)** - Weeks 1-2
- **[Phase 2: Workflow Improvements](./implementation/PHASE-2-WORKFLOWS.md)** - Weeks 3-4
- **[Phase 3: AI Agents](./implementation/PHASE-3-AI-AGENTS.md)** - Weeks 5-8
- **[Phase 4: Advanced Analytics](./implementation/PHASE-4-ANALYTICS.md)** - Weeks 9-12

---

## 🎯 Quick Links for Common Tasks

### For Backend Developers:
1. [Jobs API Reference](./api-reference/JOBS-API.md) - How to fetch and filter jobs
2. [Payments API Reference](./api-reference/PAYMENTS-API.md) - How to calculate revenue
3. [Stage Determination](./workflows/STAGE-DETERMINATION.md) - Business logic for stages
4. [Data Models](./technical/DATA-MODELS.md) - What to store in your database

### For Frontend Developers:
1. [Dashboard PRD](./prd/DASHBOARD-PRD.md) - What dashboard needs to show
2. [Revenue Calculations](./business-logic/REVENUE-CALCULATIONS.md) - How metrics are calculated
3. [Reporting Requirements](./prd/REPORTING-REQUIREMENTS.md) - Reports and filters needed

### For Product Managers:
1. [Dashboard PRD](./prd/DASHBOARD-PRD.md) - Feature requirements
2. [AI Agent PRD](./prd/AI-AGENT-PRD.md) - Automation opportunities
3. [Implementation Plan](./implementation/) - Timeline and phases

### For DevOps:
1. [System Architecture](./technical/ARCHITECTURE.md) - Infrastructure needs
2. [Integration Patterns](./technical/INTEGRATION-PATTERNS.md) - Data flow
3. [API Best Practices](./technical/BEST-PRACTICES.md) - Rate limits, caching

---

## 📊 Key Business Context

### The Company
Construction company handling:
- Roof replacements
- Insurance claims
- Repairs
- Real estate work
- Window/siding/gutter installation
- Maintenance plans

### Current State
- **CRM:** Job Nimbus
- **Job Types:** 9 workflows (record types)
- **Payment Processing:** Payrix + manual entry
- **Team:** Jack Blake, Michael Blake, Bob Blake (sales reps)
- **Data:** 161 payments, 441+ jobs in system

### Goals
1. **Primary:** Accurate revenue tracking by month
2. Build sales/conversion dashboard by job type
3. Track sales rep performance
4. Lead source conversion analysis
5. Automate data entry with AI agents

---

## 🚀 Quick Start for Developers

### 1. Authentication
Get your API token from Job Nimbus:
```bash
Settings → API → New API Key
```

### 2. Test API Access
```bash
curl --location 'https://app.jobnimbus.com/api/v1.6/jobs' \
  --header 'Authorization: bearer YOUR_TOKEN' \
  --header 'Content-Type: application/json'
```

### 3. Calculate This Month's Revenue
```bash
python scripts/calculate_revenue.py YOUR_TOKEN
```

### 4. Read Core Documentation
1. [Jobs API](./api-reference/JOBS-API.md) - Understand job data
2. [Payments API](./api-reference/PAYMENTS-API.md) - Understand payments
3. [Stage Mappings](./workflows/STAGE-MAPPINGS.md) - Business logic

### 5. Review Architecture
[System Architecture](./technical/ARCHITECTURE.md) - See how it all fits together

---

## 📈 Current Status

### ✅ Completed
- [x] Full API documentation
- [x] All 9 workflows mapped
- [x] Payment structure confirmed
- [x] Revenue calculation methodology
- [x] Stage determination logic
- [x] Custom fields documented
- [x] Status name cleanup ("Completed" → "Job Complete")

### 🔄 In Progress
- [ ] Dashboard platform selection
- [ ] First revenue dashboard build
- [ ] Data warehouse setup

### 📋 Upcoming
- [ ] Lead source tracking implementation
- [ ] AI agent development
- [ ] Gross margin calculations
- [ ] Predictive analytics

---

## 🤝 Contributing

### Documentation Updates
If you find errors or need clarification:
1. Note which doc has the issue
2. Describe what's unclear
3. Suggest improvement

### Code Contributions
Scripts and examples welcome in `/scripts` folder.

---

## 📞 Support

### Job Nimbus Resources
- API Docs: https://documenter.getpostman.com/view/3919598/S11PpG4x
- Support: https://support.jobnimbus.com

### Payrix Resources
- API Docs: https://docs.worldpay.com/apis/payrix

---

## 📄 License & Usage

Internal documentation for Maverick Exteriors development team.

---

**Last Updated:** November 20, 2025  
**Maintained By:** Development Team  
**Version:** 1.0.0
