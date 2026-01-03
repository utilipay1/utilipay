# Product Guidelines - Utility Bill Tracker

## Tone and Voice
- **Clinical and Efficient:** The application should communicate with precision and brevity. Avoid flowery language or unnecessary conversational fillers.
- **Data-Centric:** Focus on high-density information display to cater to an expert user managing a large portfolio.
- **Proactive:** Notifications should be direct and actionable (e.g., "5 Bills Due: Action Required" instead of "You might want to check your bills").

## Visual Identity & UI Design (shadcn/ui + Tailwind)
- **Information Density:** Prioritize compact layouts. Use small padding, condensed tables, and tabs to maximize the amount of data visible on a single screen without requiring excessive scrolling.
- **Subtle Monochrome Urgency:** Use relative daily countdowns (e.g., "In 3 days") with subtle text coloring and vertical accent lines instead of high-contrast solid badges.
- **Modern Cleanliness:** While dense, the UI must remain clean. Use consistent alignment, subtle borders, and professional typography to maintain a premium, trustworthy feel.
- **Theme Support:** Modern monochrome aesthetic supporting both Light and Dark modes.

## User Experience & Interaction
- **Alert Visibility:**
    - **Dashboard Financial Summary:** Prominent "Total Due" and "Next 3 Bills" tiles on the main overview.
    - **Contextual Indicators:** Subtle urgency lines and text integrated directly into property and bill lists.
    - **Persistent Critical Banner:** A top-level sticky banner for any bills due within 24 hours.
- **Safe Destructive Actions:**
    - **Archival over Deletion:** Implement "Soft Deletes" by default. Properties and bills are moved to an "Archive" state to preserve financial history and audit trails.
    - **Instant Recovery:** Provide "Undo" capabilities via toast notifications for common actions.

## Data Presentation
- **Search & Filter:** Advanced filtering must be available on every major list (Search by address, filter by utility type, status, or due date range).
- **Responsive Tables:** Ensure that high-density tables degrade gracefully on smaller screens, potentially hiding less critical columns.
