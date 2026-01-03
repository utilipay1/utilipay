# Specification: Modern Monochrome UI Redesign

## 1. Overview
A complete visual and UX overhaul of the Utility Bill Tracker to adopt a modern, clean, monochrome-first aesthetic. The redesign prioritizes clarity for non-technical users by simplifying navigation, refining urgency indicators, and surfacing key financial data (Total Due) prominently.

## 2. Functional Requirements

### 2.1 Visual Theming
- **Monochrome Palette:** Implement a design system based primarily on shades of black, white, and gray.
- **Theme Support:** Support "Light" and "Dark" modes, with an option to sync with the system preference.
    - *Light Mode:* Crisp white backgrounds, subtle gray borders, deep black text.
    - *Dark Mode:* Charcoal backgrounds, soft white text, subtle elevation.

### 2.2 Urgency & Status Indicators
- **Remove:** Standard "Success/Warning/Critical" solid badges.
- **Implement:** "Days Remaining" indicators using:
    - **Text Color:** Subtle coloring of the due date text (e.g., Soft Red for < 3 days, Muted Orange for < 7 days).
    - **Accent Lines:** A thin vertical border or accent line on the bill card/row to reinforce urgency without visual clutter.

### 2.3 Navigation Structure
- **Remove:** The top header navigation links (Home, Dashboard, etc.) to eliminate redundancy.
- **Implement:** A primary **Tabs-based interface** as the main navigation method (e.g., "Dashboard", "Properties", "Settings") located at the top of the main content area.

### 2.4 Dashboard Summary (Total Due)
- **Remove:** The Global Notification Center.
- **Implement:** A **Header Summary Tile** at the very top of the Dashboard view.
    - Display the **"Total Due"** for the upcoming period prominently.
    - Provide a concise summary of the next 3 bills due.

## 3. Non-Functional Requirements
- **Aesthetics:** The UI must feel "beautiful, modern, and clean."
- **Usability:** UX must be intuitive for a non-technical client (high readability, clear hierarchy).
- **Responsiveness:** Ensure the layout remains elegant on different screen sizes.

## 4. Acceptance Criteria
- [ ] Application supports Light, Dark, and System theme preferences.
- [ ] Top header links are removed; navigation is handled entirely by the Tab bar.
- [ ] Bill rows/cards display urgency via subtle text color and accent lines, not solid colored badges.
- [ ] "Total Due" is prominently displayed at the top of the Dashboard.
- [ ] The overall interface adheres to a strict monochrome theme with minimal color usage.

## 5. Out of Scope
- Changes to backend bill calculation logic or database schemas.
- New features unrelated to the visual redesign (e.g., new export formats).
