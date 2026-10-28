# Issue Tracker

A full-stack issue tracking application built with React, Express, Prisma, and PostgreSQL. The application supports issue discovery, filtering, pagination, issue details, workflow transitions, comments, and audit history.

## Features

- Responsive dashboard UI built with React and Tailwind CSS
- Issue search, status filtering, priority filtering, and pagination
- Issue detail view with reporter, assignee, metadata, comments, and audit history
- Issue creation form
- Comments on issues
- Server-enforced workflow transitions
- Automatic audit records for issue changes
- Zod request validation on the main issue and comment endpoints
- Jest and Supertest backend tests

## Project structure

```text
ISSUE_TRACKER/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── App.jsx
│       ├── components/
│       │   ├── PageSkeleton.jsx
│       │   └── issues/
│       └── services/api.js
└── server/                 # Express + Prisma backend
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.js
    ├── src/
    │   ├── routes/issueRoutes.js
    │   ├── services/issueService.js
    │   └── utils/workflow.js
    └── tests/workflow.test.js
```

## Prerequisites

- Node.js 20 or newer
- npm
- PostgreSQL database

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd ISSUE_TRACKER
```

### 2. Configure the backend

```bash
cd server
copy .env.example .env
```

On macOS or Linux, use:

```bash
cp .env.example .env
```

Set the following values in `server/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
PORT=5000
CLIENT_URL=http://localhost:5173
```

Install dependencies and prepare Prisma:

```bash
npm install
npx prisma generate
npm run db:push
npm run db:seed
```

### 3. Configure the frontend

Open a second terminal:

```bash
cd client
npm install
```

The frontend defaults to:

```text
http://localhost:5000/api
```

To use another backend URL, create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Running the application

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend in a second terminal:

```bash
cd client
npm run dev
```

Open the Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

## Available API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/issues` | List, search, filter, and paginate issues |
| `POST` | `/api/issues` | Create an issue |
| `GET` | `/api/issues/:id` | Get issue details, comments, and history |
| `PATCH` | `/api/issues/:id` | Update an issue and record changes |
| `POST` | `/api/issues/:id/comments` | Add a comment |

## Data model and design decisions

The PostgreSQL schema is managed with Prisma.

### Main entities

- **User**: reporters, assignees, comment authors, and history actors
- **Project**: groups related issues and project members
- **ProjectMember**: many-to-many relationship between users and projects
- **Issue**: title, description, type, priority, status, labels, reporter, assignee, and timestamps
- **Comment**: discussion entries attached to an issue
- **IssueHistory**: field-level audit records for issue changes

### Design decisions

1. **Express and Prisma separation**  
   Express routes handle HTTP concerns, while issue update logic is kept in `issueService.js`.

2. **Transactional updates and audit history**  
   Issue changes and their history records are written in one Prisma transaction so the audit trail cannot be saved independently of the update.

3. **Server-side workflow enforcement**  
   The frontend displays valid transitions for convenience, but the backend remains authoritative:

   ```text
   OPEN -> IN_PROGRESS -> IN_REVIEW -> CLOSED
   CLOSED -> OPEN
   ```

4. **Zod validation at the API boundary**  
   Request bodies, route IDs, filters, pagination, and update payloads are validated before Prisma queries run.

5. **Responsive client-side dashboard**  
   The frontend uses reusable React components for the issue list, issue details, history timeline, creation modal, and loading skeleton.

6. **PostgreSQL arrays for labels**  
   Labels are stored as a PostgreSQL string array because the current requirements only need simple labels rather than a separate label-management domain.

## Current status

### Finished

- React/Vite frontend setup
- Modern responsive dashboard UI
- Full-page loading skeleton
- Issue list and issue selection
- Search, status filtering, priority filtering, and pagination
- Issue detail view
- Workflow transition controls
- Issue creation API and UI
- Comment creation API and UI
- Audit history display
- Prisma PostgreSQL schema
- Demo seed data
- Backend validation with Zod
- Backend workflow and issue creation/comment tests

### Not finished

- Authentication and authorization
- Real current-user identity
- Editing or deleting comments
- Editing issue fields through a complete form
- Project and user management screens
- Separate project selection in the issue creation form
- Dedicated API validation tests for every invalid input case
- Production deployment
- Automated CI/CD pipeline

The current demo uses the issue reporter as the acting user for status changes and comments because authentication has not yet been implemented.

### What I would do with more time

1. Add authentication with protected routes and server-derived user identity.
2. Add project, user, and assignee selectors to the frontend.
3. Add comment editing and deletion with authorization checks.
4. Add issue editing, deletion, and optimistic UI updates.
5. Add stronger integration tests using an isolated test database.
6. Improve dashboard metrics so status counts are calculated across all matching issues rather than only the current page.
7. Add Docker configuration and deploy the frontend, API, and PostgreSQL database.
8. Add CI checks for linting, builds, Prisma validation, and tests.

## Testing and quality checks

Frontend:

```bash
cd client
npm run lint
npm run build
```

Backend:

```bash
cd server
npm test
```

Backend tests require a reachable PostgreSQL database configured through `DATABASE_URL`.

## AI tools used

I used **GitHub Copilot through the Copilot SDK in VS Code** during development for:

- Inspecting and understanding the existing project structure
- Generating and refining the server package configuration
- Adding request validation and backend tests
- Improving the dashboard UI and loading experience
- Reviewing build, lint, and test output while iterating

All generated changes were reviewed against the existing source code and validated with the project’s lint, build, and test commands.

## Live demo

Check it live here - https://issue-tracker-sage-eta.vercel.app
