# Product Guide - Utility Bill Tracker

## Initial Concept
The Utility Bill Tracker is a multi-property management tool for tracking Water, Sewer, Electricity, and Gas bills. It automates the billing cycle by predicting future bills based on an initial manual entry. The dashboard features a "Bills Due Soon" section with alerts at 5, 3, and 1-day intervals. Key features include a detailed payment recording system (including service fees and confirmation codes), specific status tracking (e.g., "Paid but not charged in books"), and data export to Excel/CSV.

## Target Audience
The primary user is a professional property manager overseeing a large portfolio of properties. This user manually tracks distinct utility bills (water, sewer, electricity, and gas) per unit across various billing cycles and providers. The application aims to eliminate the logistical burden of checking multiple websites and the high risk of missed payments.

## Core Goals
- **Zero Missed Payments:** Ensure every bill is identified, tracked, and paid before its deadline through a robust alert system.
- **Time Savings:** Centralize disparate utility data to drastically reduce the time spent logging into multiple vendor portals and manual date tracking.
- **Financial Accuracy:** Provide a precise record of all payments, including service fees and confirmation codes, ensuring data is ready for financial reporting and accounting.

## Key Features

### Centralized Dashboard
- **Urgency-First Alerts:** Separate "Overdue" and "Upcoming" alert sections that prioritize bills based on status and due dates.
- **Financial Summary:** Multiple tiles providing an overview of "Total Due", "Total Paid", and total "Properties Managed".
- **Property Portfolio View:** A searchable, comprehensive list of all properties showing the real-time status of each utility.
- **Visual Calendar:** A bird's-eye view of the entire portfolio's billing schedule, showing upcoming and past-due dates.

### Predictive Billing Engine
- **Next-Bill Scaffolding:** Upon entry of an initial bill, the system can generate a placeholder record for the following cycle to assist with tracking.
- **Smart Chain Reaction:** When a placeholder bill (amount $0) is updated with the actual amount, the system automatically generates the next month's placeholder, ensuring the tracking chain continues without manual intervention.
- **Trend Analysis:** The system estimates future bill amounts based on historical data (e.g., a 3-month rolling average) to assist with financial planning.

### Management & Reporting
- **Bill Editing:** Edit bill details (amount, dates, notes) directly from the dashboard or bill list to keep records accurate.
- **Simple Vendor Association:** Link properties and bills to specific utility providers for quick reference.
- **Detailed Payment Tracking:** Capture specific statuses such as "Paid but not charged in books," along with service fees and transaction IDs.
- **Financial Export:** Export current views and payment history to Excel/CSV for seamless integration with accounting workflows.