# Tech Stack - Utility Bill Tracker

## Core Framework
- **Next.js 15 (App Router):** Leveraging Server Components for data fetching and the latest React features.
- **TypeScript:** Ensuring type safety across the application, especially for complex bill and property schemas.

## Database & State
- **MongoDB (Native Driver):** Using the official MongoDB driver with a singleton connection pattern for efficient resource management.
- **Zod:** Schema validation for both database entities and form inputs.

## UI & Styling
- **shadcn/ui:** High-quality, accessible components (Tabs, Dialogs, Tables, Forms) built on Radix UI.
- **Tailwind CSS:** Utility-first CSS for rapid, responsive, and high-density styling.
- **Lucide React:** Icon library for consistent visual cues.

## Logic & Utilities
- **React Hook Form:** For performant and flexible form management.
- **date-fns:** Precise date manipulation for calculating bill cycles, due dates, and alert intervals.
- **xlsx:** Library for generating Excel exports of financial data.

## Services & Integration
- **Resend:** Transactional email service for password resets and critical billing alerts.
