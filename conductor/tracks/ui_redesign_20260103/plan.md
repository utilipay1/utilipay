# Plan: Modern Monochrome UI Redesign

## Phase 1: Foundation & Theme Setup [checkpoint: e5f2cf2]
- [x] Task: Define Monochrome Design System variables in Tailwind CSS (Colors, Elevation). 3c3c308
- [x] Task: Implement `next-themes` for Light/Dark/System switching. c69f871
- [x] Task: Update `globals.css` with monochrome base styles and font hierarchy. 42d102f
- [ ] Task: Conductor - User Manual Verification 'Foundation & Theme Setup' (Protocol in workflow.md)

## Phase 2: Navigation & Layout Refactoring [checkpoint: 4553e6f]
- [x] Task: Redesign `Navbar.tsx` to remove redundant links and keep only branding/user settings. 8e0e2d9
- [x] Task: Consolidate navigation into the existing `Tabs` component on the main page. a15bb3b
- [x] Task: Update the main Layout component to ensure consistent spacing for the new design. 540b36d
- [ ] Task: Conductor - User Manual Verification 'Navigation & Layout Refactoring' (Protocol in workflow.md)

## Phase 3: Dashboard & Summary Tile [checkpoint: c43edd2]
- [x] Task: Create the `SummaryTile` component for "Total Due" and "Next 3 Bills". a61b430
- [x] Task: Integrate SummaryTile at the top of the Dashboard view. e701cbd
- [x] Task: Update data fetching logic (or prop drilling) to provide aggregated "Total Due" data to the SummaryTile. e701cbd
- [ ] Task: Conductor - User Manual Verification 'Dashboard & Summary Tile' (Protocol in workflow.md)

## Phase 4: Urgency Indicators & Component Refresh [checkpoint: 417cdbe]
- [x] Task: Implement "Days Remaining" logic for subtle urgency coloring in `BillsDueSoon` and `BillList`. 66a9c32
- [x] Task: Replace standard Shadcn/UI badges with subtle accent lines and text coloring for urgency. 66a9c32
- [x] Task: Refactor `PortfolioTable` and `PropertyList` to match the monochrome aesthetic (borders, typography, contrast). 7070abb
- [ ] Task: Conductor - User Manual Verification 'Urgency Indicators & Component Refresh' (Protocol in workflow.md)

## Phase 5: Final Polish & Verification
- [x] Task: Conduct a full audit of all UI components (`Button`, `Input`, `Dialog`) for monochrome consistency. 417cdbe
- [x] Task: Verify responsive behavior on mobile and tablet views. 417cdbe
- [x] Task: Run existing tests and update if UI changes caused breakages (e.g., searching for text that was in badges). 417cdbe
- [ ] Task: Conductor - User Manual Verification 'Final Polish & Verification' (Protocol in workflow.md)
