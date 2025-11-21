-- Growth Command Center - Vercel Postgres schema
-- Run with: psql "$POSTGRES_URL" -f docs/jobnimbus/technical/vercel-postgres-schema.sql

create table if not exists sales_reps (
    id text primary key,
    name text not null,
    email text,
    phone text,
    created_at timestamptz not null default now()
);

create table if not exists contacts (
    id text primary key, -- jnid
    display_name text not null,
    email text,
    phone text,
    contact_type text, -- Homeowner, Realtor, etc.
    lead_source text, -- Google, Referral, etc.
    sales_rep_id text references sales_reps(id),
    created_at timestamptz not null,
    updated_at timestamptz not null default now(),
    raw jsonb -- optional: store original API payload for auditing
);
create index if not exists idx_contacts_lead_source on contacts(lead_source);
create index if not exists idx_contacts_created_at on contacts(created_at desc);

create table if not exists jobs (
    id text primary key, -- jnid
    number integer,
    record_type_id integer,
    record_type_name text not null, -- workflow name
    status_id integer,
    status_name text not null,
    stage text, -- derived stage (Lead/Estimating/Sold/etc.)
    sales_rep_id text references sales_reps(id),
    source_name text,
    primary_contact_id text references contacts(id),
    approved_estimate_total numeric(14,2) default 0,
    approved_invoice_total numeric(14,2) default 0,
    date_created timestamptz not null,
    date_status_change timestamptz,
    date_sold timestamptz,
    date_completed timestamptz,
    is_won boolean default false,
    is_closed boolean default false,
    is_lost boolean default false,
    owners text[], -- assigned users
    tags text[],
    updated_at timestamptz not null default now(),
    raw jsonb
);
create index if not exists idx_jobs_record_type on jobs(record_type_name);
create index if not exists idx_jobs_stage on jobs(stage);
create index if not exists idx_jobs_sales_rep on jobs(sales_rep_id);
create index if not exists idx_jobs_created_at on jobs(date_created desc);

create table if not exists job_status_history (
    id bigserial primary key,
    job_id text not null references jobs(id) on delete cascade,
    status_id integer,
    status_name text not null,
    stage text,
    changed_at timestamptz not null,
    recorded_at timestamptz not null default now()
);
create index if not exists idx_job_status_history_job on job_status_history(job_id, changed_at desc);

create table if not exists payments (
    id text primary key, -- jnid
    job_id text references jobs(id) on delete set null,
    contact_id text references contacts(id),
    amount numeric(14,2) not null,
    total_paid numeric(14,2),
    balance numeric(14,2),
    date_payment timestamptz not null,
    payment_method text,
    processor text, -- JobNimbus/Payrix/etc.
    status text, -- paid/pending/failed
    created_at timestamptz not null default now(),
    raw jsonb
);
create index if not exists idx_payments_date on payments(date_payment desc);
create index if not exists idx_payments_job on payments(job_id);

create table if not exists expenses (
    id text primary key,
    job_id text references jobs(id) on delete set null,
    amount numeric(14,2) not null,
    expense_type text, -- materials/labor/subcontractor/etc.
    vendor text,
    date_expense timestamptz not null,
    created_at timestamptz not null default now(),
    raw jsonb
);
create index if not exists idx_expenses_job on expenses(job_id);
create index if not exists idx_expenses_date on expenses(date_expense desc);

create table if not exists workflow_status_lookup (
    id bigserial primary key,
    record_type_id integer,
    record_type_name text not null,
    status_id integer,
    status_name text not null,
    stage text not null,
    unique(record_type_id, status_id)
);
create index if not exists idx_workflow_lookup_name on workflow_status_lookup(record_type_name, status_name);

create table if not exists jobnimbus_raw_events (
    id bigserial primary key,
    entity_type text not null, -- job/contact/payment/etc.
    entity_id text,
    payload jsonb not null,
    received_at timestamptz not null default now()
);
create index if not exists idx_raw_events_entity on jobnimbus_raw_events(entity_type, entity_id);

create table if not exists jobnimbus_ingestion_log (
    id bigserial primary key,
    source text not null, -- jobs/contacts/payments/expenses
    last_success_at timestamptz,
    last_cursor text,
    note text,
    updated_at timestamptz not null default now()
);
