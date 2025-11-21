# Workflow Configurations

Complete reference for all 9 Job Nimbus workflows with status-to-stage mappings.

---

## Overview

Job Nimbus uses "workflows" (also called record types) to represent different job categories. Each workflow has its own set of statuses that progress through universal business stages.

**9 Workflows:**
1. Roof Replacement (+ Window, Siding, Gutter use same)
2. Insurance
3. Repairs
4. Real Estate
5. Maintenance Plan
6. Legacy (Bob's Workflow)

---

## Record Type IDs

| record_type | record_type_name | Workflow Used |
|------------|------------------|---------------|
| 47 | Legacy (Bob's Workflow) | Legacy |
| 57 | Insurance | Insurance |
| 58 | Repairs | Repairs |
| 59 | Maintenance Plan | Maintenance Plan |
| 61 | Real Estate | Real Estate |
| 62 | Roof Replacement | Roof Replacement |
| 63 | Window Replacement | Roof Replacement |
| 64 | Siding Replacement | Roof Replacement |
| 65 | Gutter Replacement | Roof Replacement |

---

## Universal Stages

All workflows map to these business stages:
1. **Lead** - Initial contact, not yet qualified
2. **Estimating** - Creating estimate/proposal
3. **Sold** - Contract signed
4. **In Production** - Work being performed
5. **Accounts Receivable** - Billing/payment collection
6. **Completed** - Job finished, customer satisfied
7. **Lost** - Did not close the deal

---

See [STAGE-MAPPINGS.md](./STAGE-MAPPINGS.md) for complete status → stage mappings.
