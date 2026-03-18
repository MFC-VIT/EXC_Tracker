# EXC Tracker

Attendance tracker for Mozilla Firefox Club, VIT Vellore EXC courses.

This app is built as a protected admin website where club members can:

- import the registered EXC student roster from CSV
- create course events with duration, venue, and schedule
- mark attendance per event
- track each student against the 90-hour completion requirement
- manage admin access with simple RBAC

## Stack

- Next.js 15
- TypeScript
- Prisma ORM
- Neon Postgres
- Custom JWT cookie auth

## Core Data Model

`Student`
- `registrationNumber` as primary key
- name, VIT email, phone number, department, year, notes

`AdminUser`
- name, email, password hash
- role: `ADMIN` or `SUPER_ADMIN`

`ClubEvent`
- title, category, venue, description
- start date/time
- duration in minutes

`AttendanceRecord`
- one record per student per event
- status: `PRESENT` or `ABSENT`
- attended minutes for partial attendance support

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file:

```bash
cp .env.example .env
```

3. Create a Neon database and copy its connection strings into `.env`.

Use:

- `DATABASE_URL` for the app connection
- `DIRECT_URL` for Prisma schema pushes and admin operations

4. Create the schema and Prisma client:

```bash
npm run db:push
```

5. Seed the default admin and sample students:

```bash
npm run db:seed
```

6. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Seeded Admin

The seed script creates a default super admin using env vars:

- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Change these in `.env` before seeding.

## Student CSV Format

Use a CSV with these headers:

```csv
name,registrationNumber,email,phoneNumber,department,year,notes
```

A sample file is included at [data/students.example.csv](/Users/adith/Documents/Dev/MFC/EXC_Tracker/data/students.example.csv).

If you place your real roster at `data/students.csv`, the seed script will import that file automatically.

## RBAC

- `ADMIN`: create events, mark attendance, import students
- `SUPER_ADMIN`: all admin actions plus admin management

## Suggested Next Steps

- add student self-view or export reports if you want students to check their own progress
- add QR or OTP attendance capture if you want on-site automated check-in later
