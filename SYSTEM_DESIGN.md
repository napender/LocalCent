# LocalCent — System Design & Visual Identity Specification

## 1. Brand Identity & Typography

### Logo & Typography
* **Application Title:** **LocalCent**
* **Logo Style:** Minimalist, clean typography featuring an interlocking or accented monetary symbol integrated into the name. 
  * *Text Representation:* `Local` (Font Weight 400, Slate-800) + `Cent` (Font Weight 700, Indigo-600) with a subtle glowing dot or accent above the 'C'.
* **Font Family:** System UI Stack / Inter / SF Pro Display (`font-sans` in Tailwind). Clean, modern, highly legible for dense financial figures.

### Tagline & Descriptions
* **Short Tagline:** Privacy-first family finance, powered by local AI.
* **Meta Description:** A completely local, privacy-focused family finance dashboard. Ingest SMS and email transactions automatically, track budgets, and analyze spending with on-device security.
* **Favicon Description:** A minimalist square icon with rounded corners (`rounded-xl`), featuring a deep slate background (`#0F172A`) and a crisp indigo accent coin/node (`#4F46E5`) in the center.

### Web & Mobile Meta / SEO Tags
```html
<title>LocalCent — Private Family Finance</title>
<meta name="description" content="A completely local, privacy-focused family finance dashboard. Ingest SMS and email transactions automatically, track budgets, and analyze spending with on-device security." />
<meta name="application-name" content="LocalCent" />
<meta name="theme-color" content="#FFFFFF" />

<!-- PWA & Mobile Viewport -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="LocalCent" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />

Color Palette & UI Guidelines (Tailwind CSS)
To maintain a cohesive aesthetic across web and mobile viewports, stick strictly to these Tailwind classes:

Backgrounds:

App Canvas: bg-slate-50 (Light mode) / bg-slate-950 (Dark accents)

Cards/Containers: bg-white with shadow-sm border border-slate-100

Typography:

Primary Text: text-slate-900

Muted/Labels: text-slate-500

Accent Colors: text-indigo-600

Financial Status Indicators:

Income / Credit: text-emerald-600, bg-emerald-50

Expenses / Debit: text-rose-600, bg-rose-50

Alerts / Pending: text-amber-600, bg-amber-50


High-Level Architecture Diagram

+-----------------------------------------------------------------------+
|                            DATA SOURCES                               |
|  [Android SMSGate]      [iOS Shortcut]      [Bank Email PDFs via IMAP]|
+---------+----------------------+--------------------------+-----------+
          |                      |                          |
          v (HTTP POST)          v (HTTP POST)              v (IMAP Fetch)
+-----------------------------------------------------------------------+
|                    LOCALCENT BACKEND (Django REST)                    |
|                                                                       |
|   1. Ingestion Endpoint -> 2. SHA-256 Deduplication -> 3. Auto-Tag    |
|                                                                       |
|               +----------------------------------+                    |
|               |  SQLite Database (db.sqlite3)    |                    |
|               |  - Encrypted Passwords & Keys    |                    |
|               +----------------------------------+                    |
|                                                                       |
|   4. Analytics Engine  <------------->  5. External LLM API            |
|      (Aggregates JSON)                    (ChatGPT / Claude / DeepSeek)|
+-------------------------------+---------------------------------------+
                                |
                                v (Vite Reverse Proxy)
+-----------------------------------------------------------------------+
|                     FRONTEND UI (React + Tailwind)                    |
|                                                                       |
|   [ Mobile View ]                          [ Desktop View ]           |
|   - Fixed Header + Logo                    - Left Sidebar Navigation  |
|   - 1-Click AI Chips (Horizontal Scroll)   - Top Summary Cards        |
|   - Stacked Card Layout                    - Grid Layout (8 col / 4)  |
|   - Bottom Navigation Bar                  - Detailed Data Tables     |
+-----------------------------------------------------------------------+


Visual Layout Standards

Desktop Layout Structure
Sidebar: Fixed width (w-64), containing the LocalCent typography logo, family switcher, and navigation links (Dashboard, Transactions, Cards, Settings).

Main Stage: Max width container (max-w-7xl mx-auto), padded (p-8).

Grid Hierarchy: 12-column grid (grid grid-cols-12 gap-6).

Left Side (col-span-8): Summary Cards + Recent Transactions.

Right Side (col-span-4): Upcoming Bills + Credit Card Cycle Summary.

Mobile Viewport Structure (PWA First)
Top Bar: Fixed header (h-14) displaying the LocalCent logo left-aligned and the active family profile icon on the right.

Horizontal Action Rail: 1-click AI action chips (flex overflow-x-auto gap-2 scrollbar-none) rendered immediately below the header.

Content Stream: Single column stack (flex flex-col gap-4 p-4 mb-16).

Bottom Navigation Bar: Fixed bottom bar (fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 flex justify-around items-center z-50) with touch-friendly icons for quick navigation.


Instructions for AI Code Generator

When generating or reviewing code for LocalCent:

Always verify mobile responsiveness: Ensure every form, table, and card uses responsive Tailwind classes (e.g., grid-cols-1 md:grid-cols-3).

Strict Currency Formatting: Format all currency values using INR formatting (e.g., ₹1,50,000.00 or standard regional formats) using Intl.NumberFormat.

No Decorative Filler: Keep chart elements, status badges, and lists focused on readability with generous whitespace (padding, gap).

Preserve Navigation & Context: Always verify that components access useFamilyAuth() to display the active user's avatar/name in headers.
