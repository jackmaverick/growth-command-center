# Payments API Reference

Complete reference for the Job Nimbus Payments endpoint.

---

## Endpoint

```
GET https://app.jobnimbus.com/api1/payments
```

**Note:** Payments use `api1` not `api/v1.6`

**Authentication:**
```bash
--header 'Authorization: bearer YOUR_TOKEN'
--header 'Content-Type: application/json'
```

**Example Request:**
```bash
curl --location 'https://app.jobnimbus.com/api1/payments' \
  --header 'Authorization: bearer YOUR_TOKEN' \
  --header 'Content-Type: application/json'
```

---

## Response Structure

```json
{
  "count": 161,
  "results": [
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
      "created_by_processor": null,
      
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
          "type": "job"
        },
        {
          "id": "mf5mjnd4zpuy8iuu7j5sih6",
          "type": "contact"
        },
        {
          "id": "mg55gwaxbb3wd066c3kx344",
          "type": "invoice"
        }
      ],
      
      "invoices": [...],
      "is_active": true,
      "is_archived": false,
      "type": "payment"
    }
  ]
}
```

---

## Core Fields

### Payment Amount
| Field | Type | Description |
|-------|------|-------------|
| `total` | float | Total payment amount in USD |
| `credit` | float | Credit amount (usually 0) |
| **Net Amount** | - | `total - credit` = actual revenue |

**Important:** Always calculate net as `total - credit` for accurate revenue.

### Dates (Unix Timestamps)
| Field | Type | Description |
|-------|------|-------------|
| `date_payment` | integer | **USE THIS** - When payment was received |
| `date_created` | integer | When payment record was created |
| `date_updated` | integer | Last modification |

**⚠️ CRITICAL:** Use `date_payment` for monthly revenue calculations, NOT `date_created`.

### Payment Identification
| Field | Type | Description |
|-------|------|-------------|
| `jnid` | string | Unique payment ID |
| `reference` | string | Reference/check number |
| `type` | string | Always "payment" |

### Payment Method
| Field | Type | Description |
|-------|------|-------------|
| `method_id` | integer | Payment method type |
| `PaymentSource` | string | "Invoice" or null |
| `created_by_processor` | string | "Payrix" or null |

**Method IDs (Confirmed):**
- `1` = Check
- `3` = Credit Card

**Payment Types:**
- **Payrix Payment:** `created_by_processor: "Payrix"` (online credit card)
- **Manual Payment:** `created_by_processor: null` (check, cash, manual entry)

### Attribution
| Field | Type | Description |
|-------|------|-------------|
| `sales_rep` | string | Sales rep JNID |
| `sales_rep_name` | string | Sales rep name (e.g., "Jack Blake") |
| `created_by` | string | User who recorded payment |
| `created_by_name` | string | Creator name |

### Customer & Job Linking
| Field | Type | Description |
|-------|------|-------------|
| `customer` | string | Customer/account JNID |
| `primary` | object | Primary entity (usually job or invoice) |
| `related` | array | All related entities |

**Primary Structure:**
```json
{
  "id": "job_jnid_here",
  "name": "Job Name",
  "number": "1308",
  "type": "job"
}
```

### Invoice Details
| Field | Type | Description |
|-------|------|-------------|
| `invoices` | array | Related invoice records |

**Invoice Structure:**
```json
{
  "amount": 3000,
  "invoice_id": "mg55gwaxbb3wd066c3kx344",
  "invoice_no": "1143",
  "jnid": "mi7kbioizzrqbf8aeuhank_1",
  "created_by": "m9bnef14vrcjniytbs5n0nb",
  "date_created": 1763651085,
  "is_active": true
}
```

### Status Fields
| Field | Type | Description |
|-------|------|-------------|
| `is_active` | boolean | Payment is active |
| `is_archived` | boolean | **Exclude if true** |
| `refund_id` | string | Refund reference (if refunded) |
| `refunded_amount` | float | Amount refunded |

---

## Linking Payments to Jobs

### Method 1: Check Primary Field
```python
def get_job_from_payment(payment):
    """Get job JNID from payment - Method 1"""
    if payment.get('primary', {}).get('type') == 'job':
        return payment['primary']['id']
    return None
```

### Method 2: Search Related Array (Recommended)
```python
def get_job_from_payment(payment):
    """Get job JNID from payment - Method 2 (more reliable)"""
    for related_item in payment.get('related', []):
        if related_item.get('type') == 'job':
            return related_item['id']
    return None
```

**Use Method 2** - More reliable as `primary` might be an invoice.

---

## Revenue Calculations

### This Month's Revenue
```python
from datetime import datetime

def calculate_monthly_revenue(payments, year, month):
    """Calculate revenue for a specific month"""
    # Get month boundaries
    month_start = datetime(year, month, 1)
    if month == 12:
        month_end = datetime(year + 1, 1, 1)
    else:
        month_end = datetime(year, month + 1, 1)
    
    month_start_ts = int(month_start.timestamp())
    month_end_ts = int(month_end.timestamp())
    
    # Calculate revenue
    total_revenue = 0
    payment_count = 0
    
    for payment in payments:
        # Skip archived
        if payment.get('is_archived'):
            continue
        
        # Check date
        payment_date = payment.get('date_payment', 0)
        if month_start_ts <= payment_date < month_end_ts:
            # Calculate net
            total = payment.get('total', 0)
            credit = payment.get('credit', 0)
            net = total - credit
            
            total_revenue += net
            payment_count += 1
    
    return {
        'total_revenue': total_revenue,
        'payment_count': payment_count
    }
```

### Revenue by Job Type
```python
def revenue_by_job_type(payments, jobs):
    """Group revenue by record_type_name"""
    from collections import defaultdict
    
    # Create job lookup
    job_lookup = {job['jnid']: job for job in jobs}
    
    # Group by type
    by_type = defaultdict(float)
    
    for payment in payments:
        if payment.get('is_archived'):
            continue
        
        # Get job
        job_jnid = get_job_from_payment(payment)
        if not job_jnid:
            continue
        
        job = job_lookup.get(job_jnid)
        if not job:
            continue
        
        # Add to total
        job_type = job.get('record_type_name', 'Unknown')
        net = payment.get('total', 0) - payment.get('credit', 0)
        by_type[job_type] += net
    
    return dict(by_type)
```

### Revenue by Sales Rep
```python
def revenue_by_sales_rep(payments):
    """Group revenue by sales_rep_name"""
    from collections import defaultdict
    
    by_rep = defaultdict(float)
    
    for payment in payments:
        if payment.get('is_archived'):
            continue
        
        rep = payment.get('sales_rep_name', 'Unknown')
        net = payment.get('total', 0) - payment.get('credit', 0)
        by_rep[rep] += net
    
    return dict(by_rep)
```

---

## Common Queries

### Get All Active Payments
```python
active_payments = [
    p for p in payments 
    if not p.get('is_archived', False)
]
```

### Get This Month's Payments
```python
from datetime import datetime

now = datetime.now()
month_start = datetime(now.year, now.month, 1)
if now.month == 12:
    month_end = datetime(now.year + 1, 1, 1)
else:
    month_end = datetime(now.year, now.month + 1, 1)

month_start_ts = int(month_start.timestamp())
month_end_ts = int(month_end.timestamp())

this_month = [
    p for p in payments
    if not p.get('is_archived')
    and month_start_ts <= p.get('date_payment', 0) < month_end_ts
]
```

### Get Payrix (Online) Payments
```python
online_payments = [
    p for p in payments
    if p.get('created_by_processor') == 'Payrix'
]
```

### Get Manual Payments
```python
manual_payments = [
    p for p in payments
    if not p.get('created_by_processor')
]
```

### Get Payments for Specific Job
```python
def get_job_payments(payments, job_jnid):
    """Get all payments for a specific job"""
    job_payments = []
    for payment in payments:
        if get_job_from_payment(payment) == job_jnid:
            job_payments.append(payment)
    return job_payments
```

---

## Important Notes

### Archived Payments
Always exclude archived payments from revenue:
```python
if payment.get('is_archived'):
    continue  # Skip this payment
```

### Credit Handling
Some payments have credits applied:
```python
net_revenue = payment['total'] - payment['credit']
# Most have credit = 0, but always subtract
```

### Date Field Selection
**For Revenue:** Use `date_payment` (when customer paid)  
**For Audit:** Use `date_created` (when recorded in system)

### Payment to Job Linking
Not all payments link directly to jobs:
- Some link to invoices
- Some link to contacts
- Always check `related` array for `type: "job"`

---

## Integration with Jobs API

### Complete Revenue Picture
```python
import requests

headers = {
    "Authorization": "bearer YOUR_TOKEN",
    "Content-Type": "application/json"
}

# Fetch both
jobs_response = requests.get(
    "https://app.jobnimbus.com/api/v1.6/jobs",
    headers=headers
)
payments_response = requests.get(
    "https://app.jobnimbus.com/api1/payments",
    headers=headers
)

jobs = jobs_response.json()['results']
payments = payments_response.json()['results']

# Calculate job revenue
def calculate_job_revenue(job_jnid, payments):
    total = 0
    for payment in payments:
        if payment.get('is_archived'):
            continue
        if get_job_from_payment(payment) == job_jnid:
            total += payment['total'] - payment['credit']
    return total

# Add revenue to each job
for job in jobs:
    job['actual_revenue'] = calculate_job_revenue(job['jnid'], payments)
```

---

## Related Documentation

- **[Jobs API](./JOBS-API.md)** - Job records
- **[Revenue Calculations](../business-logic/REVENUE-CALCULATIONS.md)** - Business logic
- **[Dashboard PRD](../prd/DASHBOARD-PRD.md)** - Revenue dashboard requirements

---

## Ready-to-Use Script

See [calculate_revenue.py](../scripts/calculate_revenue.py) for complete working example.

```bash
python scripts/calculate_revenue.py YOUR_TOKEN
```

This script will show:
- This month's revenue
- Revenue by job type
- Revenue by sales rep
- Payment method breakdown
