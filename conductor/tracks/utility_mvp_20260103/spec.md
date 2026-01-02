# Spec: Utility Bill Tracker MVP

## Overview
The goal of this track is to implement the core functionality of the Utility Bill Tracker. This includes property management, bill tracking with predictive logic, a centralized dashboard with urgency alerts, and high-precision payment recording.

## User Stories
- **Property Management:** As a property manager, I want to add and manage properties with their specific utility needs and tenant details.
- **Urgent Dashboard:** As a property manager, I want to see a "Bills Due Soon" section that highlights bills due in 1, 3, or 5 days.
- **Predictive Billing:** As a property manager, I want the system to automatically generate a draft bill for the next cycle when I enter a current bill.
- **Detailed Payments:** As a property manager, I want to record payments with specific methods, confirmation codes, and financial statuses (e.g., "Paid but not charged").

## Technical Requirements

### Data Models (MongoDB)
- **Property:** `address`, `owner_info`, `tenant_status`, `tenant_info`, `utilities_managed` (array/flags), `notes`, `is_archived`.
- **Bill:** `property_id`, `utility_type`, `amount`, `account_number`, `billing_period_start`, `billing_period_end`, `bill_date`, `due_date`, `status` (Unpaid, Overdue, Paid-Uncharged, Paid-Charged), `notes`.
- **Payment (Sub-doc or separate):** `payment_date`, `method`, `confirmation_code`, `service_fee`.

### Core Logic
- **`lib/billing.ts`:**
    - `calculateNextBill(currentBill)`: Generates a draft bill for the next 30-day cycle.
    - `getAlertStatus(dueDate)`: Returns the alert level (Critical, Warning, Info) based on the current date.
- **`lib/mongodb.ts`:** Singleton connection pattern for the native driver.

### UI/UX (shadcn/ui)
- **Dashboard:**
    - Urgency-First Alert list.
    - Searchable Property Table.
- **Forms:**
    - `AddPropertyForm`: Zod-validated multi-field form.
    - `AddBillForm`: Includes property/utility selection and date pickers.
    - `RecordPaymentModal`: Modal for capturing payment-specific details.

## Success Criteria
- Property management (Add/View/Archive) is functional.
- Bill entry triggers the creation of the next cycle's draft bill.
- Dashboard correctly displays alerts at 5, 3, and 1-day intervals.
- Data export to Excel/CSV correctly captures all recorded payment details.
