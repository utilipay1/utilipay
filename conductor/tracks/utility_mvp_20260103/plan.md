# Plan: Utility Bill Tracker MVP

## Phase 1: Foundation & Project Scaffolding [checkpoint: 0a61e9a]
- [x] Task: Initialize Next.js 15 project with TypeScript, Tailwind, and shadcn/ui. f00d4c5
- [x] Task: Set up MongoDB connection singleton in `lib/mongodb.ts`. 32c28f9
- [x] Task: Define Zod schemas for Properties and Bills. d758492
- [x] Task: Implement basic Layout with navigation and Global Notification Center (empty). 8ab4bac
- [x] Task: Conductor - User Manual Verification 'Phase 1: Foundation & Project Scaffolding' (Protocol in workflow.md) 0a61e9a

## Phase 2: Property Management
- [ ] Task: Create `AddPropertyForm` component and API route.
- [ ] Task: Implement Property List view with search and "Soft Delete" (Archive) functionality.
- [ ] Task: Write tests for Property CRUD operations.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Property Management' (Protocol in workflow.md)

## Phase 3: Billing & Prediction Engine
- [ ] Task: Implement `lib/billing.ts` for next-cycle calculation and alert logic.
- [ ] Task: Create `AddBillForm` component and API route.
- [ ] Task: Implement the "Predictive Billing" logic: Automatically create draft bills on current bill submission.
- [ ] Task: Write tests for billing logic and predictive engine.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Billing & Prediction Engine' (Protocol in workflow.md)

## Phase 4: Dashboard & Alerts
- [ ] Task: Build the Dashboard "Bills Due Soon" section with 5/3/1 day high-contrast alerts.
- [ ] Task: Implement the Portfolio Table showing utility status per property.
- [ ] Task: Integrate the Global Notification Center with real-time alert counts.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Dashboard & Alerts' (Protocol in workflow.md)

## Phase 5: Payments & Reporting
- [ ] Task: Create `RecordPaymentModal` and implementation for financial status transitions.
- [ ] Task: Implement sub-tabs for Bill Status (All, Unpaid, Overdue, Paid views).
- [ ] Task: Implement Excel export functionality using the `xlsx` library.
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Payments & Reporting' (Protocol in workflow.md)
