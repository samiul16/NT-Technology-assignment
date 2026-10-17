# AI-Powered Task Manager

A full-stack task management application built with Next.js, TypeScript,
PostgreSQL, Prisma, and Anthropic Claude. It provides a Kanban workflow
for managing tasks, secure authentication, task priorities and due
dates, and AI-assisted task planning.

> **Project status:** The AI task-description generator has been
> confirmed working. The deadline/priority suggestion and
> duplicate-detection features are included below as planned
> integrations; verify that their API routes and UI components are
> integrated in your current branch before presenting them as completed
> features.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database and Prisma](#database-and-prisma)
- [Authentication and Security](#authentication-and-security)
- [API Reference](#api-reference)
- [AI Features](#ai-features)
- [Production Deployment on Vercel](#production-deployment-on-vercel)
- [Validation and Testing](#validation-and-testing)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)

## Features

### Task management

- Kanban board with **To Do**, **In Progress**, and **Done** statuses.
- Create, view, edit, and delete tasks.
- Task priorities: **Low**, **Medium**, and **High**.
- Optional due dates and overdue-task indicators.
- Task detail modal with status, priority, description, due date, and
  timestamps where available.
- Drag-and-drop task interaction using dnd-kit.
- PostgreSQL persistence through Prisma.

### Authentication and security

- Sign-up and sign-in endpoints.
- Password hashing with `bcryptjs`.
- JWT-based authentication stored in an HttpOnly cookie.
- Protected dashboard routes.
- Server-side validation for authentication inputs and task
  operations.
- Task ownership checks for protected update/delete operations.

### AI-assisted productivity

- **AI task-description generator:** generates a clearer description,
  actionable checklist, and acceptance criteria from a task title. The
  user reviews the suggestion and can accept or reject it.
- **AI deadline and priority suggestions:**
  planned/integration-dependent feature that can suggest a priority,
  estimated effort, due date, and reasoning.
- **AI duplicate-task detection:** planned/integration-dependent
  feature that can compare a new task with existing tasks and let the
  user review possible matches before creating it.

AI suggestions should be reviewed by the user. They are recommendations,
not guarantees.

## Technology Stack

---

Area Technology

---

Framework Next.js App Router

Language TypeScript

UI React, Material UI (MUI)

Drag and drop dnd-kit

State management Zustand

Database PostgreSQL (hosted on Supabase)

ORM Prisma 7

PostgreSQL driver `pg` with `@prisma/adapter-pg`

Authentication JWT, HttpOnly cookies,
`jose`/project auth utilities

Password hashing bcryptjs

AI Anthropic Claude API

Deployment target Vercel

---

## Architecture

The application uses Next.js App Router pages and route handlers. The
browser communicates with API routes; route handlers validate requests,
check authentication where required, and access PostgreSQL through
Prisma.

```text
Browser / React UI
        |
        v
Next.js App Router + API Route Handlers
        |
        +---- Authentication helpers (JWT + HttpOnly cookie)
        |
        +---- Anthropic Claude API (AI features)
        |
        v
Prisma Client + PostgreSQL adapter
        |
        v
Supabase PostgreSQL
```

## Getting Started

### Prerequisites

- Node.js version compatible with the project's Next.js release.
- npm.
- A PostgreSQL database (the project uses Supabase PostgreSQL).
- An Anthropic API key for AI features.

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd assignment-nt-tech
```

Replace `<YOUR_REPOSITORY_URL>` with your repository URL.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root. See [Environment
Variables](#environment-variables).

Never commit `.env.local` or expose private API keys in client-side
code.

### 4. Generate the Prisma client

```bash
npx prisma generate
```

The Prisma generator is configured to output the client to
`src/generated/prisma`.

### 5. Start the development server

```bash
npm run dev
```

Open <http://localhost:3000>.

### 6. Create an account

Use the application's sign-up page to create an account, then sign in to
access protected dashboard pages.

## Environment Variables

Set the following variables in `.env.local` for local development and in
Vercel's **Project Settings → Environment Variables** for deployment.

---

Variable Required Purpose

---

`DATABASE_URL` Yes PostgreSQL connection
string used by the
Prisma PostgreSQL
adapter. Use the
connection format
recommended by your
Supabase project.

`ANTHROPIC_API_KEY` For AI features Server-side Anthropic
API key. Do not prefix
it with `NEXT_PUBLIC_`.

`ANTHROPIC_MODEL` Optional Overrides the model
configured as the
default in the AI route
handlers.

JWT signing secret Yes, if required by Set the exact
`src/lib/auth.ts` environment-variable
name expected by your
auth helper. Use a
long, random secret and
never commit it.

---

Example template (replace all placeholders with your own values):

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
ANTHROPIC_API_KEY="your-anthropic-api-key"
ANTHROPIC_MODEL="your-supported-claude-model"
```

Add the JWT signing secret using the exact variable name read by
`src/lib/auth.ts`. Do not paste real credentials into the README or
source control.

## Database and Prisma

- Database engine: PostgreSQL.
- Hosted database: Supabase.
- Prisma schema: `prisma/schema.prisma`.
- Generated client output: `src/generated/prisma`.
- Task status values in the database: `TODO`, `IN_PROGRESS`, `DONE`.
- Task priority values in the database: `LOW`, `MEDIUM`, `HIGH`.
- Task records include a UUID identifier, title, optional description,
  status, priority, optional due date, timestamps, and a user
  reference where configured.

Prisma 7 uses the PostgreSQL adapter in this project. The generated
client must exist before Next.js compiles the application.

### Useful database commands

```bash
# Generate Prisma Client
npx prisma generate

# Validate the Prisma schema
npx prisma validate

# Inspect the database interactively
npx prisma studio
```

Use the database workflow already established for your Supabase schema.
Do not run destructive schema commands against a database containing
important data without reviewing the migration plan and taking a backup.

## Authentication and Security

- Passwords are hashed before being stored; plaintext passwords should
  never be persisted.
- The authentication token is stored in an HttpOnly cookie, which
  helps prevent client-side JavaScript from reading the token.
- Authentication and authorization must be enforced in server-side
  route handlers, not only in the UI.
- Validate all request bodies and enum values on the server.
- Do not trust a client-supplied user ID to determine task ownership;
  derive the authenticated user from the verified session.
- Keep database credentials, JWT signing secrets, and Anthropic API
  keys in environment variables.
- Configure production cookies to use `Secure` in HTTPS environments
  and appropriate SameSite settings.
- Confirm that task listing visibility matches the intended assignment
  requirements. The current project discussion includes a request for
  `GET /api/tasks` to return all tasks, while protected update/delete
  routes may be scoped to the owning user. Review this behavior before
  public deployment.

## API Reference

The endpoints below reflect the routes discussed/implemented in the
project. Confirm the response shape and authorization rules in the
current source before relying on them in external clients.

### Authentication

---

Method Endpoint Purpose

---

`POST` `/api/auth/signup` Validate input, create
an account, hash the
password, and set the
authentication cookie.

`POST` `/api/auth/signin` Authenticate an
existing user and set
the cookie.

`POST` `/api/auth/signout` Clear the
authentication cookie.

`GET` `/api/auth/me` Return the current
authenticated user's
information.

---

### Tasks

---

Method Endpoint Purpose

---

`GET` `/api/tasks` Retrieve tasks. Check
the route for its
current
visibility/filtering
behavior.

`POST` `/api/tasks` Create a task for the
authenticated user.

`GET` `/api/tasks/[id]` Retrieve a task if this
handler is implemented
in the current branch.

`PATCH` `/api/tasks/[id]` Update an authorized
task.

`DELETE` `/api/tasks/[id]` Delete an authorized
task.

---

### AI routes

---

Method Endpoint Purpose

---

`POST` `/api/ai/generate-description` Generate a description,
checklist, and
acceptance criteria
from a task title.

`POST` `/api/ai/suggest-task-plan` Intended to suggest
task priority, effort,
and a due date; confirm
that the route is
integrated.

`POST` `/api/ai/detect-duplicates` Intended to find
similar existing tasks;
confirm that the route
is integrated.

---

AI endpoints should require authentication, validate input, limit
output, and return safe error messages. Keep provider credentials on the
server.

## AI Features

### Task-description generation

1.  The user enters a task title.
2.  The frontend sends the title to the authenticated API route.
3.  The server calls Anthropic Claude and requests structured JSON.
4.  The response includes a description, actionable checklist, and
    acceptance criteria.
5.  The user reviews the result and accepts or rejects it.
6.  Accepted text is placed into the description field; the user remains
    in control of saving the task.

### Duplicate detection

This feature compares a proposed task
with existing tasks and shows likely matches for review. A warning
should not silently prevent the user from continuing; the user should be
able to cancel or explicitly continue when that behavior is part of the
UI.

Both AI features is implemented using Anthropic model.

## Production Deployment on Vercel

1.  Push the project to a Git repository and import it into Vercel.

2.  Add `DATABASE_URL`, the JWT signing secret expected by the auth
    helper, and `ANTHROPIC_API_KEY` in Vercel environment variables. Add
    `ANTHROPIC_MODEL` only if you want to override the route's default.

3.  Ensure the Prisma schema and any `prisma.config.ts` required by the
    project are committed.

4.  Set the build script in `package.json` to generate Prisma Client
    before building:

    ```json
    "build": "prisma generate && next build"
    ```

5.  Deploy and inspect the build logs.

6.  Test sign-up, sign-in, sign-out, task CRUD, drag-and-drop
    persistence, due dates, and each enabled AI feature on the deployed
    URL.

The Prisma generator output is configured as:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}
```

Imports should consistently use the project's `@` alias for the `src`
directory, for example:

```ts
import { PrismaClient } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";
```

Do not mix `@/generated/prisma/client` with
`@/src/generated/prisma/client` if `@` already maps to `src`.

## Validation and Testing

Run these checks before submitting or deploying:

```bash
# Generate the client
npx prisma generate

# Validate Prisma schema
npx prisma validate

# TypeScript check
npx tsc --noEmit

# Lint
npm run lint

# Production build
npm run build
```

Also test manually:

- Invalid signup input is rejected with a useful message.
- Duplicate email registration is handled.
- Wrong credentials do not authenticate.
- Protected routes reject unauthenticated requests.
- Task title, status, priority, and due date validation works.
- Users cannot update or delete tasks they do not own, according to
  the chosen access policy.
- Changes to task status persist after drag-and-drop and page refresh.
- AI failure, invalid model configuration, and empty input are handled
  gracefully.
- AI recommendations can be rejected without modifying the form.
- The deployed application works with production environment
  variables.

Automated unit, integration, and end-to-end tests should be added and
run as part of the final submission if they are required by the
assignment.

## Troubleshooting

### `Module not found: ... generated/prisma/client`

- Confirm `generator client` outputs to `../src/generated/prisma`.
- Confirm imports use `@/generated/prisma/client` when `@` aliases
  `src`.
- Run `npx prisma generate`.
- Ensure `package.json` uses
  `"build": "prisma generate && next build"`.

### Database connection errors

- Verify `DATABASE_URL` in the local `.env.local` or Vercel
  environment settings.
- Check the Supabase connection host, credentials, SSL requirements,
  and network availability.
- Regenerate Prisma Client after schema changes.

### AI requests fail

- Confirm `ANTHROPIC_API_KEY` is configured server-side.
- Verify the configured model is available to your Anthropic account.
- Check server logs for the detailed provider error; return only a
  safe generic message to the browser.

### Authentication works locally but not in production

- Verify the JWT signing secret is configured in Vercel using the
  exact name expected by `src/lib/auth.ts`.
- Confirm production cookie settings and HTTPS.
- Redeploy after changing environment variables.

## Future Improvements

- Add automated tests for authentication, task CRUD, ownership, and AI
  route validation.
- Add rate limiting for sign-in, sign-up, and AI endpoints.
- Add pagination and filtering for larger task lists.
- Add a clear permission model for shared versus user-owned tasks.
- Add CI checks for linting, type checking, schema validation, and
  production builds.
- Document a demo account only if one has been intentionally created;
  never publish real user credentials.

## License

Add the license required by your project or assignment. If no license is
specified, treat the code as all rights reserved by default.
