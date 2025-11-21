# Jobs API Reference

Complete reference for the Job Nimbus Jobs endpoint.

---

## Endpoint

```
GET https://app.jobnimbus.com/api/v1.6/jobs
```

**Authentication:**
```bash
--header 'Authorization: bearer YOUR_TOKEN'
--header 'Content-Type: application/json'
```

**Example Request:**
```bash
curl --location 'https://app.jobnimbus.com/api/v1.6/jobs' \
  --header 'Authorization: bearer YOUR_TOKEN' \
  --header 'Content-Type: application/json'
```

---

## Response Structure

```json
{
  "count": 441,
  "results": [
    {
      "jnid": "mi7oqvx6gfj7d6r2ulv3se3",
      "number": "1505",
      "name": "5317 West 141st Terr - Katie Patterson",
      "record_type": 62,
      "record_type_name": "Roof Replacement",
      "status": 742,
      "status_name": "Appointment Scheduled",
      "date_created": 1763658520,
      "date_status_change": 1763658647,
      "date_updated": 1763660589,
      "is_active": true,
      "is_archived": false,
      "is_closed": false,
      "is_lead": false,
      "approved_estimate_total": 0,
      "approved_invoice_total": 0,
      "sales_rep": "m9d3tifvv4yqp5wz16bslcx",
      "sales_rep_name": "Michael Blake",
      "source": 18,
      "source_name": "Michael's Referral",
      "owners": [...],
      "primary": {...},
      "related": [...],
      // ... custom fields
    }
  ]
}
```

---

## Core Fields

### Identification
| Field | Type | Description |
|-------|------|-------------|
| `jnid` | string | Unique Job Nimbus ID (permanent) |
| `number` | integer | User-facing job number (#1505) |
| `recid` | integer | Legacy record ID |
| `name` | string | Auto-generated display name |
| `type` | string | Always "job" |

### Job Classification
| Field | Type | Description |
|-------|------|-------------|
| `record_type` | integer | Job type ID (62 = Roof Replacement) |
| `record_type_name` | string | Job type name |

**All Record Types:**
| ID | Name | Workflow |
|----|------|----------|
| 47 | Legacy (Bob's Workflow) | Legacy |
| 57 | Insurance | Insurance |
| 58 | Repairs | Repairs |
| 59 | Maintenance Plan | Maintenance Plan |
| 61 | Real Estate | Real Estate |
| 62 | Roof Replacement | Roof Replacement |
| 63 | Window Replacement | Roof Replacement |
| 64 | Siding Replacement | Roof Replacement |
| 65 | Gutter Replacement | Roof Replacement |

### Status & Pipeline
| Field | Type | Description |
|-------|------|-------------|
| `status` | integer | Status ID (unique per workflow) |
| `status_name` | string | Status name (e.g., "Appointment Scheduled") |
| `is_lead` | boolean | Currently in Lead stage |
| `is_closed` | boolean | Job is closed |
| `is_active` | boolean | Job is active (not deleted) |
| `is_archived` | boolean | Job is archived |

**⚠️ CRITICAL:** `status` IDs are workflow-specific. Same status names have different IDs across workflows. Always use `status_name` for cross-workflow queries.

### Dates (Unix Timestamps)
| Field | Type | Description |
|-------|------|-------------|
| `date_created` | integer | When job was created |
| `date_status_change` | integer | Last status change |
| `date_updated` | integer | Last modification to any field |

### Revenue Fields
| Field | Type | Description |
|-------|------|-------------|
| `approved_estimate_total` | float | Total of approved estimates (USD) |
| `approved_invoice_total` | float | Total of approved invoices (USD) |
| `last_estimate` | float | Most recent estimate amount |
| `last_invoice` | float | Most recent invoice amount |
| `last_budget_gross_margin` | float | From Profit Tracker |
| `last_budget_gross_profit` | float | From Profit Tracker |
| `last_budget_revenue` | float | From Profit Tracker |

### Attribution
| Field | Type | Description |
|-------|------|-------------|
| `sales_rep` | string | Sales rep JNID (gets credit) |
| `sales_rep_name` | string | Sales rep name |
| `owners` | array | Current job owners (responsibility) |
| `created_by` | string | User/automation that created job |
| `created_by_name` | string | Creator name |

### Lead Source
| Field | Type | Description |
|-------|------|-------------|
| `source` | integer | Lead source ID |
| `source_name` | string | Lead source name (e.g., "Michael's Referral") |

### Customer Information
| Field | Type | Description |
|-------|------|-------------|
| `customer` | string | Parent customer/account JNID |
| `primary` | object | Primary contact for job |
| `related` | array | All related records (contacts, etc.) |

**Primary Contact Structure:**
```json
{
  "id": "mi7oq08a4mf8r7c7lp5xpxe",
  "name": "Katie Patterson",
  "number": "1616",
  "type": "contact",
  "email": "katie@example.com",
  "subject": null
}
```

### Location
| Field | Type | Description |
|-------|------|-------------|
| `address_line1` | string | Street address |
| `address_line2` | string | Apt/Suite |
| `city` | string | City |
| `state_text` | string | State abbreviation |
| `zip` | string | ZIP code |
| `country_name` | string | Country |
| `geo` | object | {lat, lon} coordinates |

### Additional
| Field | Type | Description |
|-------|------|-------------|
| `attachment_count` | integer | Number of attachments |
| `task_count` | integer | Number of tasks |
| `subcontractors` | array | Assigned subcontractors |
| `tags` | array | Job tags |

---

## Custom Fields

Custom fields follow naming pattern: `cf_<type>_<number>`

### Field Types:
- `cf_string_*` - Text fields
- `cf_long_*` - Number fields  
- `cf_boolean_*` - Yes/No checkboxes
- `cf_date_*` - Date fields

**See [Custom Fields Guide](../workflows/CUSTOM-FIELDS.md) for complete mapping.**

---

## Common Queries

### Get All Active Jobs
```python
GET /api/v1.6/jobs
Filter: is_active = true AND is_archived = false
```

### Get Jobs by Type
```python
GET /api/v1.6/jobs
Filter: record_type = 62  # Roof Replacement
```

### Get Jobs by Status
```python
GET /api/v1.6/jobs
Filter: status_name = "Signed Contract"
# Note: Use status_name, not status ID
```

### Get Jobs Created This Month
```python
GET /api/v1.6/jobs
Filter: date_created >= start_of_month_timestamp
```

### Get Jobs by Sales Rep
```python
GET /api/v1.6/jobs
Filter: sales_rep_name = "Michael Blake"
```

---

## Filtering Best Practices

### ✅ DO:
- Use `status_name` for cross-workflow filtering
- Filter by `is_active = true` for active jobs
- Use `record_type_name` for job type filtering
- Check `is_archived = false` to exclude archived jobs

### ❌ DON'T:
- Use `status` ID for cross-workflow queries
- Forget to filter out archived jobs
- Trust `is_lead` flag alone (calculate stage from status)

---

## Rate Limiting

Job Nimbus doesn't publish official rate limits, but recommended practices:
- Max 100 requests per minute
- Implement exponential backoff on 429 errors
- Cache job data, refresh hourly or daily

---

## Related Documentation

- **[Stage Mappings](../workflows/STAGE-MAPPINGS.md)** - How to determine stage from status
- **[Workflow Configurations](../workflows/WORKFLOW-CONFIGURATIONS.md)** - All workflow details
- **[Custom Fields](../workflows/CUSTOM-FIELDS.md)** - Custom field reference
- **[Revenue Calculations](../business-logic/REVENUE-CALCULATIONS.md)** - Using job financial data

---

## Code Examples

### Fetch All Jobs
```python
import requests

headers = {
    "Authorization": "bearer YOUR_TOKEN",
    "Content-Type": "application/json"
}

response = requests.get(
    "https://app.jobnimbus.com/api/v1.6/jobs",
    headers=headers
)

data = response.json()
jobs = data['results']
total_count = data['count']

print(f"Retrieved {len(jobs)} of {total_count} jobs")
```

### Filter Active Jobs
```python
active_jobs = [
    job for job in jobs 
    if job['is_active'] and not job.get('is_archived', False)
]
```

### Group by Job Type
```python
from collections import defaultdict

by_type = defaultdict(list)
for job in jobs:
    job_type = job['record_type_name']
    by_type[job_type].append(job)

for job_type, type_jobs in by_type.items():
    print(f"{job_type}: {len(type_jobs)} jobs")
```

### Get Jobs with Sales Rep
```python
michael_jobs = [
    job for job in jobs
    if job.get('sales_rep_name') == 'Michael Blake'
]
```

---

**See Also:**
- [Payments API](./PAYMENTS-API.md)
- [System Architecture](../technical/ARCHITECTURE.md)
- [Dashboard PRD](../prd/DASHBOARD-PRD.md)
