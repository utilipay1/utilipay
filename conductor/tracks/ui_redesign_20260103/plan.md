# Plan: Modern Monochrome UI Redesign

## Phase 1: Foundation & Theme Setup
- [x] Task: Define Monochrome Design System variables in Tailwind CSS (Colors, Elevation). 3c3c308
- [x] Task: Implement `next-themes` for Light/Dark/System switching. c69f871
- [x] Task: Update `globals.css` with monochrome base styles and font hierarchy. 42d102f
- [ ] Task: Conductor - User Manual Verification 'Foundation & Theme Setup' (Protocol in workflow.md)

## Phase 2: Navigation & Layout Refactoring
- [ ] Task: Redesign `Navbar.tsx` to remove redundant links and keep only branding/user settings.
- [ ] Task: Consolidate navigation into the existing `Tabs` component on the main page.
- [ ] Task: Update the main Layout component to ensure consistent spacing for the new design.
- [ ] Task: Conductor - User Manual Verification 'Navigation & Layout Refactoring' (Protocol in workflow.md)

## Phase 3: Dashboard & Summary Tile
- [ ] Task: Create the `SummaryTile` component for "Total Due" and "Next 3 Bills".
- [ ] Task: Integrate `SummaryTile` at the top of the Dashboard view.
- [ ] Task: Update data fetching logic (or prop drilling) to provide aggregated "Total Due" data to the SummaryTile.
- [ ] Task: Conductor - User Manual Verification 'Dashboard & Summary Tile' (Protocol in workflow.md)

## Phase 4: Urgency Indicators & Component Refresh
- [ ] Task: Implement "Days Remaining" logic for subtle urgency coloring in `BillsDueSoon` and `BillList`.
- [ ] Task: Replace standard Shadcn/UI badges with subtle accent lines and text coloring for urgency.
- [ ] Task: Refactor `PortfolioTable` and `PropertyList` to match the monochrome aesthetic (borders, typography, contrast).
- [ ] Task: Conductor - User Manual Verification 'Urgency Indicators & Component Refresh' (Protocol in workflow.md)

## Phase 5: Final Polish & Verification
- [ ] Task: Conduct a full audit of all UI components (`Button`, `Input`, `Dialog`) for monochrome consistency.
- [ ] Task: Verify responsive behavior on mobile and tablet views.
- [ ] Task: Run existing tests and update if UI changes caused breakages (e.g., searching for text that was in badges).
- [ ] Task: Conductor - User Manual Verification 'Final Polish & Verification' (Protocol in workflow.md)
