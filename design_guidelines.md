# CRM Mastodonte Design Guidelines

## Design Approach

**Selected Approach**: Design System (Linear + Notion hybrid)
- **Justification**: Enterprise task management tool requiring clarity, efficiency, and data density
- **References**: Linear's clean task management UI, Notion's structured content layouts, Asana's Kanban boards
- **Principles**: Information hierarchy, scan-ability, professional restraint, functional density

## Typography System

**Font Family**: Inter (via Google Fonts CDN)

**Hierarchy**:
- **Page Titles**: text-2xl font-semibold (Client names, section headers)
- **Section Headers**: text-lg font-medium (Meeting History, Tasks, etc.)
- **Card Titles**: text-base font-medium (Task cards, client cards)
- **Body Text**: text-sm font-normal (Meeting notes, descriptions)
- **Metadata**: text-xs font-normal (Dates, assignees, tags)
- **Labels**: text-xs font-medium uppercase tracking-wide (Form labels, column headers)

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section spacing: space-y-6, space-y-8
- Card gaps: gap-4, gap-6
- Page margins: px-6, px-8

**Container Strategy**:
- Sidebar: Fixed w-64 with navigation
- Main content: flex-1 with max-w-7xl mx-auto px-8
- Forms/Modals: max-w-2xl

## Core Components

### Navigation Structure
- **Left Sidebar** (w-64 fixed):
  - Logo/Brand at top (h-16)
  - Primary nav items with icons (Heroicons)
  - User profile at bottom
  - Active state: subtle background treatment

### Dashboard/Kanban Board
- **Three-column layout**: flex space-x-6
- **Column Structure**:
  - Header: Uppercase label + count badge
  - Cards container: space-y-3, min-h-screen for drop zones
- **Task Cards** (rounded-lg p-4):
  - Title: font-medium text-base
  - Client badge: inline-flex items-center gap-2 text-xs
  - Priority indicator: Leading accent bar (w-1 h-full absolute left-0)
  - Metadata row: flex justify-between text-xs (assignee avatar + due date)
  - Tags: flex flex-wrap gap-2 mt-3

### Client Profile (360° View)
- **Split Layout**:
  - Left column (2/3): Client details + tabs (Meetings, Documents)
  - Right column (1/3): Pending tasks sidebar
- **Header Section**:
  - Client name: text-2xl font-semibold
  - Status badge + action buttons (flex items-center gap-3)
  - Key info grid: grid grid-cols-2 gap-x-8 gap-y-4
- **Meeting Timeline**:
  - Reverse chronological list
  - Each entry: border-l-2 pl-6 pb-8 (timeline connector)
  - Date badge + meeting type tag
  - Rich text content area

### Forms & Modals
- **Modal Overlay**: Fixed full-screen, centered content
- **Form Container**: max-w-2xl, rounded-lg, p-6
- **Input Groups**: space-y-6
- **Field Structure**:
  - Label above (text-xs font-medium uppercase tracking-wide mb-2)
  - Input: rounded-md p-3 w-full
  - Helper text: text-xs mt-1
- **Button Group**: flex justify-end gap-3 mt-8

### Tables & Lists
- **Client List Table**:
  - Header: sticky top-0, text-xs font-medium uppercase
  - Rows: hover state, py-4 px-6
  - Columns: Name (flex-1), Status (w-32), Last Contact (w-40), Actions (w-24)

### Filtering System
- **Filter Bar**: flex items-center gap-4 mb-6
- **Dropdowns**: inline-flex items-center gap-2, rounded-md px-4 py-2
- **Active Filters**: Pill-style badges with dismiss icon

## Component Details

### Icons
- **Library**: Heroicons (via CDN)
- **Sizes**: w-4 h-4 (inline), w-5 h-5 (buttons), w-6 h-6 (prominent)
- **Usage**: Navigation items, status indicators, action buttons

### Badges & Tags
- **Structure**: inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
- **Variants**: Status (dot + text), Priority (icon + text), Category (text only)

### Rich Text Editor
- **Toolbar**: Sticky top bar with formatting buttons
- **Content Area**: min-h-64, p-4, prose styling
- **Buttons**: Icon-only, w-8 h-8, rounded hover states

### Drag & Drop Visual States
- **Dragging Card**: Slight transparency, subtle shadow elevation
- **Drop Zone Active**: Dashed border treatment
- **Placeholder**: h-24 rounded-lg dashed border

## Responsive Behavior

**Desktop (lg+)**: Full three-column Kanban, sidebar visible
**Tablet (md)**: Sidebar collapses to hamburger, Kanban scrolls horizontally
**Mobile**: Stack to single column, tabs for Kanban sections

## Animations

**Minimal Motion**:
- Card drag: transform transition (duration-200)
- Modal entry: fade + scale (duration-300)
- Dropdown menus: slide down (duration-150)
- No scroll animations or complex effects

## Images

This is a data-focused business application. Images are used sparingly:
- **User Avatars**: 32px circles for task assignees and navigation
- **Empty States**: Simple illustration placeholders (max 200px) for empty Kanban columns
- **No hero images**: This is a tool-focused dashboard, not a marketing page