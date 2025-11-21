# Quick Start Guide

Get up and running with Job Nimbus integration in 30 minutes.

---

## Step 1: Get API Access (5 minutes)

### Create API Token
1. Log into Job Nimbus: https://app.jobnimbus.com
2. Go to **Settings** → **API**
3. Click **New API Key**
4. Copy and save your token securely

**Important:** Keep this token secret. It has full access to your Job Nimbus account.

---

## Step 2: Test API Connection (5 minutes)

### Test Jobs Endpoint
```bash
curl --location 'https://app.jobnimbus.com/api/v1.6/jobs' \
  --header 'Authorization: bearer YOUR_TOKEN_HERE' \
  --header 'Content-Type: application/json'
```

**Expected:** JSON response with `count` and `results` array.

### Test Payments Endpoint
```bash
curl --location 'https://app.jobnimbus.com/api1/payments' \
  --header 'Authorization: bearer YOUR_TOKEN_HERE' \
  --header 'Content-Type: application/json'
```

**Expected:** JSON response with payment records.

---

## Step 3: Calculate This Month's Revenue (5 minutes)

### Run Revenue Calculator
```bash
python scripts/calculate_revenue.py YOUR_TOKEN_HERE
```

**You should see:**
- This month's total revenue
- Revenue by job type
- Revenue by sales rep
- Payment method breakdown

**If it fails:** Check your API token and network connection.

---

## Step 4: Understand the Data (10 minutes)

### Read Core Documentation
1. **[Jobs API](./api-reference/JOBS-API.md)** (5 min)
   - What fields are available
   - How to filter jobs
   - Understanding status vs status_name

2. **[Payments API](./api-reference/PAYMENTS-API.md)** (5 min)
   - Payment structure
   - How payments link to jobs
   - Revenue calculations

### Key Concepts
- **record_type:** Job category (62 = Roof Replacement)
- **status_name:** Current status ("Appointment Scheduled")
- **stage:** Business stage (Lead, Estimating, Sold, etc.)
- **date_payment:** When payment was received (use for revenue)

---

## Step 5: Choose Your Path (5 minutes)

### For Backend Developers
**Next Steps:**
1. Read [System Architecture](./technical/ARCHITECTURE.md)
2. Review [Data Models](./technical/DATA-MODELS.md)
3. Set up database schema
4. Implement data sync

### For Frontend Developers
**Next Steps:**
1. Read [Dashboard PRD](./prd/DASHBOARD-PRD.md)
2. Review UI requirements
3. Build revenue dashboard mockup
4. Connect to backend API

### For Product/Business
**Next Steps:**
1. Read [Dashboard PRD](./prd/DASHBOARD-PRD.md)
2. Review [Implementation Plan](./implementation/)
3. Prioritize features
4. Set success metrics

---

## Common Issues & Solutions

### Issue: "Authentication Failed"
**Solution:** Check that your API token is correct and hasn't expired.

### Issue: "No payments returned"
**Solution:** You may not have payment records yet. Try the jobs endpoint first.

### Issue: "Rate limited"
**Solution:** Wait 60 seconds and try again. Implement exponential backoff.

### Issue: "Missing fields in JSON"
**Solution:** Some fields are optional. Always check if field exists before using.

---

## Quick Reference

### API Endpoints
```
Jobs:     GET https://app.jobnimbus.com/api/v1.6/jobs
Payments: GET https://app.jobnimbus.com/api1/payments
```

### Key Files
```
README.md                        ← Start here
api-reference/JOBS-API.md        ← Job data structure
api-reference/PAYMENTS-API.md    ← Payment data structure
workflows/STAGE-MAPPINGS.md      ← Business logic
prd/DASHBOARD-PRD.md             ← What to build
scripts/calculate_revenue.py     ← Working example
```

### Record Types (Job Categories)
```
47 = Legacy (Bob's Workflow)
57 = Insurance
58 = Repairs
59 = Maintenance Plan
61 = Real Estate
62 = Roof Replacement
63 = Window Replacement
64 = Siding Replacement
65 = Gutter Replacement
```

### Universal Stages
```
Lead → Estimating → Sold → In Production → Accounts Receivable → Completed
                                 ↓
                               Lost
```

---

## Next Steps

### Immediate (Today):
- [ ] Get API token
- [ ] Test API connection
- [ ] Run revenue calculator
- [ ] Read Jobs API docs

### This Week:
- [ ] Choose dashboard platform
- [ ] Set up development environment
- [ ] Build first dashboard view
- [ ] Test with real data

### This Month:
- [ ] Complete core dashboard
- [ ] Add pipeline tracking
- [ ] Implement team leaderboard
- [ ] Launch to team

---

## Need Help?

### Documentation
- Main README: [README.md](./README.md)
- Full docs: See folder structure in README

### Job Nimbus Resources
- API Docs: https://documenter.getpostman.com/view/3919598/S11PpG4x
- Support: https://support.jobnimbus.com

---

**You're ready to start building!** 🚀

Next action: Run the revenue calculator to see your data in action.
