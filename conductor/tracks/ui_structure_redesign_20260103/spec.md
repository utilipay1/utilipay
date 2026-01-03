# Specification: UI Structure and Form Redesign

## 1. Overview
This track involves a significant redesign of the application's layout and core data entry forms. The goal is to improve navigation via a header-based view switcher and to standardize the data captured for properties, bills, and payments according to specific business requirements.

## 2. Functional Requirements

### 2.1 Navigation & Layout
- **Header Navigation:** Implement a persistent header with three primary navigation items: **Dashboard**, **Properties**, and **Bills**.
- **Dynamic Views:** Switching between these items will update the main content area without a full page reload (Single Page View switching).
- **Dashboard View:**
    - **Summary Tiles:** Display "Total Due", "Total Paid", and "Properties Managed".
    - **Alerts/Action Items:** Section for "Bills Due Soon" or "Overdue Bills".
    - **Portfolio Overview:** High-level table/chart showing expense distribution (Portfolio Table).
- **Properties View:** Displays the list of properties and an "Add Property" button.
- **Bills View:** Displays the list of bills with existing management functionality and an "Add Bill" button.

### 2.2 Form Redesign (Modals)
The following forms will be implemented as modals, replacing existing versions entirely to match the requested fields.

#### 2.2.1 "Add New Property" Form
- **Property Address:** Text Input.
- **Owner Name:** Text Input (Optional).
- **Owner Contact:** Text Input (Optional).
- **Tenant Status:** Dropdown (Vacant, Occupied).
- **Tenant Name:** Text Input (Dynamic: Only visible if "Occupied" selected).
- **Tenant Contact:** Text Input.
- **Utilities Managed:** Multi-select Checkboxes (Water, Sewer, Gas, Electric).
- **Notes:** Text Area.

#### 2.2.2 "Add New Bill" Form
- **Property:** Dropdown (Select from existing properties).
- **Utility Type:** Dropdown (Water, Sewer, Gas, Electric).
- **Amount:** Numeric/Currency Input.
- **Account Number:** Text/Numeric Input.
- **Billing Period Start/End:** Date Pickers.
- **Bill Date:** Date Picker.
- **Due Date:** Date Picker.
- **Notes:** Text Area.

#### 2.2.3 "Record Payment" Form
- **Header Info:** Read-only display of Property Address, Utility Type, and Bill Amount.
- **Payment Date:** Date Picker.
- **Payment Method:** Dropdown (AGR Trust Account, Credit Card, Bank Transfer, Check, Other).
- **"Other" Specification:** Text Input (Visible only if "Other" is selected as Payment Method).
- **Confirmation Code:** Text Input.
- **Service/Convenience Fee:** Numeric Input.
- **Total Paid:** Calculated field (Bill Amount + Service Fee).

### 2.3 Bills Dashboard Updates
- **Charged in Books:** Add a checkbox or toggle for each bill to track recording in internal accounting software.

## 3. Visual & Aesthetic Requirements
- Maintain the current "beautiful" and modern aesthetic.
- Incorporate slightly more color while maintaining a professional and balanced UI.

## 4. Acceptance Criteria
- Header navigation correctly toggles between the three views.
- All forms contain exactly the specified fields and dynamic logic (e.g., "Other" field, "Tenant Name" visibility).
- "Total Paid" is correctly calculated in the Record Payment modal.
- "Charged in Books" status is persisted correctly.
- Dashboard accurately summarizes the data.

## 5. Out of Scope
- Backend database migration beyond what is necessary to support these new fields.
- User authentication or multi-user roles.
