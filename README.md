# Daily Expense Tracker

A lightweight personal expense tracking web app built with React, Vite, Tailwind CSS, and Chart.js. The application stores data locally in the browser and provides dashboards, transaction management, category analytics, and CSV export without requiring any backend.

## Overview

Daily Expense Tracker helps users capture daily spending, browse expense history, and analyze spending patterns over time. It is designed as a browser-first local application where all data is saved directly in localStorage for persistence across reloads and restarts.

## Key Features

- Add, edit, and delete expenses with date, category, amount, and optional notes
- Dashboard view with summary metrics and recent transactions
- Expense list with search, filters, sorting, and quick delete
- Analytics view with pie and line charts for category and monthly spending
- Settings to customize the dashboard title and default currency
- Local storage persistence for expenses and settings
- CSV export for offline export and external analysis
- Dark glassmorphism UI using Tailwind CSS utility styles

## Built With

- React 19
- Vite 4
- Tailwind CSS 4
- Chart.js 4
- react-chartjs-2
- date-fns
- lucide-react
- uuid

## How It Works

### Data Flow

- `src/context/ExpenseContext.jsx` manages the global expense state and settings.
- The context exposes actions for adding, editing, deleting, exporting, and updating settings.
- `src/utils/storage.js` reads and writes a single localStorage key (`daily_expense_tracker_v1`).
- Expense objects include an auto-generated UUID, creation timestamp, category, amount, date, and optional notes.

### Views and Routing

The application does not use a router. Instead, `src/App.jsx` manages the current active page through local component state:

- `dashboard` — quick overview and recent transactions
- `expenses` — expense table with filters and sort controls
- `analytics` — charts and spending breakdowns
- `settings` — app customization and data controls

### Charts and Analytics

- `src/pages/AnalyticsPage.jsx` generates:
  - A pie chart showing category distribution for the current month
  - A line chart showing spending trend across the last 6 months
- Chart data is derived from utility functions in `src/utils/helpers.js`.

## Project Structure

```
├── index.html
├── package.json
├── vite.config.js
├── src
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── context
│   │   └── ExpenseContext.jsx
│   ├── components
│   │   ├── ExpenseModal.jsx
│   │   ├── Sidebar.jsx
│   │   └── Toast.jsx
│   ├── pages
│   │   ├── AnalyticsPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ExpensesPage.jsx
│   │   └── SettingsPage.jsx
│   └── utils
│       ├── helpers.js
│       └── storage.js
└── public
```

## Installation

1. Make sure you have Node.js installed.
2. Open a terminal in the project folder.
3. Install dependencies:

```bash
npm install
```

## Running Locally

Start the development server with:

```bash
npm run dev
```

Then open the local URL shown in the terminal, usually `http://localhost:5173`.

## Building for Production

Generate an optimized production build with:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Usage

- Use the sidebar to navigate between Dashboard, Expenses, Analytics, and Settings.
- Add a new expense from the sidebar or dashboard action button.
- Edit or delete expenses from the Expenses page.
- Filter expenses by category and month, and sort by date or amount.
- Export all existing expenses to CSV from the sidebar or settings page.
- Customize the app name and currency via Settings.
- Clear all stored data from Settings when you need a fresh start.

## Styling and UX

The app uses custom CSS in `src/index.css` alongside Tailwind CSS for rapid styling. The theme is a dark modern UI with glass-effect cards, soft gradients, and responsive layout behavior.

## Notes for Developers

- There is no backend API: all storage is browser-local.
- The app is designed for single-user local usage.
- Expense persistence is handled automatically whenever you add, update, or delete expense records.
- CSV export is client-side and generates a downloadable file from the current expense state.

## Contribution

To contribute or extend the app:

1. Fork the repository or work from a local clone.
2. Install dependencies with `npm install`.
3. Create a feature branch.
4. Make changes, test locally, and submit a pull request.

## License

This repository does not include a license file. Add one if you plan to open source the project.
