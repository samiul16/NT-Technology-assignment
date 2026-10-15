# 🧩 Real-Time Kanban Board Application

A modern Kanban-style task management board built with **Next.js (App Router)**, **Supabase**, and **Zustand**, featuring **real-time synchronization**, **drag-and-drop task management**, and **optimistic UI updates**.

---

# 🚀 Features

- User Login
- Kanban Board UI
- Drag & Drop Tasks
- Add / Edit / Move Tasks
- Real-Time Updates
- Optimistic UI Updates
- Broadcast Notifications
- Supabase PostgreSQL Database
- Responsive Layout (Sidebar + Navbar)

---

# 🏗️ Architecture Overview

The application follows a modular layered architecture:

UI Components  
↓  
Zustand Store (Client State)  
↓  
Next.js API Routes  
↓  
Supabase (PostgreSQL + Realtime)

### Why This Architecture?

- Keeps UI clean
- Separates business logic
- Supports scalability
- Enables real-time collaboration
- Maintains production-level structure

---

# 📁 Folder Structure

```
app/
│
├── (auth)/
│   └── login/
│       └── page.tsx
│
├── (dashboard)/
│   ├── layout.tsx
│   │
│   ├── _component/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │
│   └── board/
│       ├── page.tsx
│       │
│       ├── _components/
│       │   ├── Board/
│       │   │   ├── Board.tsx
│       │   │   ├── Column.tsx
│       │   │   ├── DragOverlay.tsx
│       │   │   └── TaskCard.tsx
│       │   │
│       │   ├── AddTaskModal.tsx
│       │   └── EditTaskModal.tsx
│
├── api/
│   ├── login/
│   │
│   └── tasks/
│       ├── route.ts
│       ├── move/
│       │   └── route.ts
│       ├── update/
│       │   └── route.ts
│       └── delete/
│           └── route.ts
│
├── layout.tsx
├── globals.css
```

---

# 🧠 State Management Approach

State is managed using **Zustand**, a lightweight state management library.

## Store Responsibilities

Located in:

```
/store/useTaskStore.ts
```

The store manages:

- Task list
- Notifications
- API communication
- Real-time subscriptions
- Optimistic updates

---

## Key State Features

### Global Task State

```
tasks: Task[]
notification: string | null
```

All UI components share synchronized state.

---

### Optimistic UI Updates

Used in:

```
moveTask()
```

Flow:

User moves task  
↓  
UI updates instantly  
↓  
API request sent  
↓  
Rollback if failed

Benefits:

- Faster UI response
- Better user experience
- Reduced perceived latency

---

### API-Based Server Communication

All database operations go through:

```
/api/tasks/*
```

Instead of:

```
UI → Supabase directly ❌
```

We use:

```
UI → API → Supabase ✅
```

Benefits:

- Security
- Validation support
- Maintainability
- Future extensibility

---

# ⚡ Real-Time Implementation Approach

Real-time functionality is implemented using **Supabase Realtime**.

Two systems are used:

---

# 1️⃣ Postgres Changes (Data Sync)

Synchronizes database updates across clients.

Channel:

```
tasks-db-changes
```

Event:

```
postgres_changes
```

Triggers:

- INSERT
- UPDATE
- DELETE

Flow:

Database Change  
↓  
Realtime Event  
↓  
Fetch Updated Tasks  
↓  
Update UI

---

## Error Handling

The application includes structured error boundaries using:

- `app/error.tsx` — Global errors
- `app/(dashboard)/error.tsx` — Dashboard errors
- `app/not-found.tsx` — 404 handling

These improve resilience and user experience.

# 2️⃣ Broadcast Channel (User Notifications)

Used to send UI notifications between users.

Channel:

```
board-notifications
```

Event:

```
task-moved
```

Example:

"John moved a task to Done"

Important logic:

Ignore own notifications to prevent duplicate alerts.

---

# Realtime Initialization Strategy

Realtime is initialized using:

```
initRealtime()
```

Protected using:

```
let isRealtimeInitialized = false;
```

Prevents:

- Duplicate subscriptions
- Memory leaks
- Repeated events

Realtime starts inside:

```
board/page.tsx
```

---

# 🔄 API Design

All database operations are handled through Next.js API routes.

## Endpoints

### Get Tasks

```
GET /api/tasks
```

### Add Task

```
POST /api/tasks
```

### Move Task

```
PATCH /api/tasks/move
```

Used for:

- Drag-and-drop updates
- Status changes
- Order updates

---

### Update Task

```
PATCH /api/tasks/update
```

Used for:

- Title editing
- Description updates

---

### Delete Task

```
DELETE /api/tasks/delete
```

Used for:

- Removing tasks

---

# 🧩 UI Component Architecture

Core components:

## Board

Responsible for:

- Drag-and-drop control
- Rendering columns

---

## Column

Responsible for:

- Displaying tasks by status

Statuses:

- todo
- in_progress
- done

---

## TaskCard

Responsible for:

- Displaying individual task
- Edit/Delete actions

---

## Modals

- AddTaskModal
- EditTaskModal

Used for:

- Creating tasks
- Editing tasks

---

# ⚖️ Trade-offs and Assumptions

## Trade-offs

### Full Table Refetch

Behavior:

Fetch all tasks after change.

Trade-off:

✅ Simpler logic  
❌ Higher network usage

Reason:

Keeps implementation simple.

Future:

Row-level updates optimization.

---

### Broadcast + Postgres Changes

Used together:

Postgres → Sync data  
Broadcast → Show UI messages

Trade-off:

✅ Better UX  
❌ Slight complexity

---

### Zustand Instead of Redux

Chosen because:

- Lightweight
- Minimal boilerplate
- Fast setup

Trade-off:

Less tooling than Redux.

---

### Optimistic Updates

Chosen to:

Improve responsiveness.

Trade-off:

Requires rollback handling.

Handled using:

Restore previous state on failure.

---

# Assumptions

- Each task belongs to one board
- Users identified using cookies
- Supabase Realtime enabled
- Task ordering handled using:

```
order_index
```

---

# 🧪 Future Improvements

- User Presence Tracking
- Role-based Permissions
- Pagination
- Activity History
- Task Comments
- File Attachments
- Performance Optimization
- Offline Support

---

# 🛠️ Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Zustand
- Supabase
- PostgreSQL
- Supabase Realtime
- DnD Kit

---

# ▶️ Running the Project

Install dependencies:

```
npm install
```

Run development server:

```
npm run dev
```

Open:

```
http://localhost:3000
```

---

# 📌 Summary

This project demonstrates:

- Real-time architecture
- Optimistic UI updates
- Scalable folder structure
- API-based data management
- Production-ready design patterns
