# Growth Command Center Data Models (Vercel Postgres)

Schema for persisting JobNimbus data so the dashboard and future AI agents can run fast analytics without hitting the API on every request.

## Data Flow
- **Raw landing:** Store unmodified API payloads in `jobnimbus_raw_events` for audit/backfill.
- **Normalized tables:** `contacts`, `jobs`, `payments`, `expenses`, `workflow_status_lookup`, `job_status_history`.
- **Analytics:** Dashboard queries and any materialized views pull from normalized tables (e.g., revenue by month, pipeline by stage, velocity).
- **Stage mapping:** Always derive `stage` from `status_name` using the mappings in `docs/jobnimbus/JobNimbus-JSON-Data-Dictionary.md`. Never rely on `status` IDs across workflows.

## Core Tables (what to hydrate from JobNimbus)
- `sales_reps`: Id/name/email for attribution; referenced by contacts/jobs.
- `contacts`: jnid, display name, email/phone, `lead_source`, `contact_type`, `sales_rep_id`, timestamps, raw payload.
- `jobs`: jnid, job number, `record_type_id`/`record_type_name`, `status_id`/`status_name`, derived `stage`, `sales_rep_id`, `source_name`, `primary_contact_id`, revenue totals, key dates (`date_created`, `date_status_change`, `date_sold`, `date_completed`), flags (`is_won`, `is_closed`, `is_lost`), owners/tags, raw payload.
- `job_status_history`: Append-only table for velocity; one row per status change with `stage` + `changed_at`.
- `payments`: jnid, `job_id`, `contact_id`, amount/paid/balance, `date_payment`, method, processor, status, raw payload (covers both JobNimbus Payments + Payrix if added).
- `expenses`: jnid, `job_id`, amount, `expense_type` (materials/labor/subcontractor), vendor, `date_expense`, raw payload.
- `workflow_status_lookup`: Authoritative mapping of `record_type` + `status` → `stage` for consistent aggregation.
- `jobnimbus_raw_events`: Landing table for raw JSON (contacts/jobs/payments/expenses) to debug ingestion.
- `jobnimbus_ingestion_log`: Track cursors/timestamps for incremental fetches.

## DDL
- SQL lives at `docs/jobnimbus/technical/vercel-postgres-schema.sql`.
- Columns favor `timestamptz`, `numeric(14,2)` for money, and `text` for enums; indexes cover dimensions used by dashboards (`record_type_name`, `stage`, `sales_rep_id`, dates).

## Ingestion Rules
1) **UPSERT by jnid** for contacts, jobs, payments, expenses. Keep `raw` updated for transparency.
2) **Status history:** Append to `job_status_history` whenever `status_id`/`status_name` changes; derive `stage` from the mapping table on insert.
3) **Stage mapping seed:** Populate `workflow_status_lookup` from the stage lists in `JobNimbus-JSON-Data-Dictionary.md` (per record_type). This makes the API status → stage deterministic.
4) **Timestamps:** Convert JobNimbus epoch seconds to `timestamptz`. Store `date_created`/`date_status_change`/`date_sold`/`date_completed` when available; default `updated_at` to `now()` on upsert.
5) **Data hygiene:** Strip “Jane Tester” and “Legacy” rows upstream if you don’t want them persisted; otherwise keep them and filter in queries.

## Vercel Postgres Setup
1) Create the database: `vercel postgres create growth-command-center` (or use the Vercel dashboard).
2) Pull the connection string locally: `vercel env pull .env.local` (or add `POSTGRES_URL` manually).
3) Apply schema: `psql "$POSTGRES_URL" -f docs/jobnimbus/technical/vercel-postgres-schema.sql`.
4) Seed `workflow_status_lookup` with the stage mappings (copy from the data dictionary per workflow).
5) Add `POSTGRES_URL` to Vercel project Environment Variables so the Next API routes can connect.

## Query Patterns (dashboard coverage)
- **Revenue YTD / by month:** sum `payments.amount` filtered by `date_payment` and `job_id` join to `jobs.record_type_name`.
- **Pipeline by stage:** count/sum `jobs` grouped by `stage`/`record_type_name`; use `job_status_history` for velocity (avg days between stages).
- **Rep/lead source performance:** group `jobs`/`contacts` by `sales_rep_id` and `lead_source`.
- **Cash flow + gross margin:** pair `payments` with `expenses` per `job_id`.

## Next Steps
- Hook ingestion scripts to JobNimbus API endpoints (jobs, contacts, payments, expenses) and populate the tables via UPSERT + history append.
- Add lightweight API routes in Next.js that read from Postgres instead of the live JobNimbus API to speed up the dashboard.
