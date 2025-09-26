# Maglev - Railway Template Deployment Tool

# Product

## Vision

Maglev is a rapid prototyping tool for developers that combines template discovery with instant Railway deployments. It showcases the power of Railway's GraphQL API through rich deployment management features.

**Target User:** Developers who want to quickly spin up prototypes without local setup overhead.

**Core Value:** Browse curated templates → Click "Launch" → Get live Railway deployment in seconds.

## Views

### Market

- A curated list by Maglev team
- List templates as cards
- Show name, description, tech stack
- Actions
  - Launch

### Dashboard

- List user's projects as cards
- Show status, URL, created date
- Quick actions: restart, delete

### Project

- Show Project info and template source
- Show Live deployment status and URL
- Show Real-time status updates
- Actions:
  - restart
  - stop/start
  - delete

### Settings

- Actions:
  Set Railway API token
  Set theme preference (light/dark/system)

## Actions

### Launch

- Generate project name
- Create Railway project + service via API
- Poll deployment status
- Redirect to Project detail on success

## User Journeys

### Create Project

1. Open app (local dev server at `localhost:5173`)
2. See templates (gallery with cards)
3. Pick template and click "Launch" button
4. See deployment progress
5. Redirect to Project detail when deployment completes

# Data Model

## Template

Curated deployment templates maintained in the database.

**Attributes:**

- `id` (string, unique) - e.g., "react-router-rsc"
- `name` - e.g., "React Router with RSC"
- `description` - Long-form description
- `shortDescription` - Brief description for cards
- `techStack` - Array of tags (["react", "typescript", "vite"])
- `category` - "frontend" | "backend" | "fullstack"
- `githubRepo` - GitHub URL for Railway deployment
- `previewImage` - Image URL/path
- `status` - "available" | "coming-soon"
- `order` - Sort order in gallery

**Initial Data:**

- 1 template with status "available" (React Router RSC)
- Additional templates with status "coming-soon"

## Project

Deployed Railway projects created from templates.

**Stored in Gel:**

- `id` (UUID)
- `name` - Auto-generated via @wollybeard/kit (e.g., "bold-river-42")
- `template` - Reference to Template
- `railwayProjectId` - Railway project ID
- `railwayServiceId` - Railway service ID
- `railwayEnvironmentId` - Railway environment ID
- `createdAt` - Timestamp
- `notes` - User notes (Maglev-specific)
- `tags` - Custom tags (Maglev-specific)
- `deletedAt` - Soft delete support

**Fetched from Railway API (not stored):**

- `status` - Current deployment status
- `url` - Live deployment URL
- `deployments` - Deployment history (optional)

## Settings

Singleton storing app-wide configuration.

**Attributes:**

- `railwayApiToken` - Railway API token (required)
- `autoDeleteAfterHours` - Auto-cleanup setting (0 = disabled)
- `defaultRegion` - Default Railway region
- `showComingSoonTemplates` - Toggle visibility

# Railway Integration

## Authentication

- User provides their own Railway API token
- Token stored in Gel Settings table
- All projects created in user's Railway account
- User pays Railway costs (not Maglev developer)

## Project Tagging

- Projects tagged with environment variable: `MAGLEV=true`
- Allows filtering "our" projects from user's other Railway projects

# Tools

These key tools are used to build Maglev:

- TypeScript for language
- Effect with @wollybeard/kit for standard library
- Gel for persistence layer
- Vite for build/framework
- React for UI components
- React Router for navigation and data loading
- Radix Themes for UI components and design system
- Railway GraphQL API for deployment management

# Architecture

## Deployment

- **Local web application** (not native desktop app)
- Runs as Vite dev server
- Accessed via browser at `localhost:5173`
- Gel database runs locally on user's machine
- No cloud deployment of Maglev required for interview

```
User's machine:
├── Gel database (local Gel instance)
├── Vite dev server (localhost:5173)
│   ├── React Router (SSR + RSC)
│   ├── Railway GraphQL API client
│   └── Gel database client
└── Browser → http://localhost:5173
```

## RSC

We use the stack of RR+R+RSC+Vite

- See docs at https://reactrouter.com/how-to/react-server-components
- We will use Framework Mode, not Data Mode see section:
  https://reactrouter.com/how-to/react-server-components#rsc-framework-mode.

## Effect

Using Effect for:

- Railway API client (error handling, retries, timeouts)
- Gel database queries (composable, type-safe)
- Orchestration of complex flows (launch, polling)
- Dependency injection (services for Railway, Gel, Settings)

Gel has official Effect integration guides:

- https://www.geldata.com/blog/building-with-effect-and-gel-part-1
- https://www.geldata.com/blog/building-with-effect-and-gel-part-2

# Appendix

## Future Service Potential

**Phase 1 (Current):** Local development

- Run via `pnpm dev`
- Single-user (local Gel database)
- No authentication needed

**Phase 2 (Future):** Hosted service

- Deploy Maglev to Railway/Vercel
- Shared Gel database (Gel Cloud)
- Multi-user with authentication
- User accounts and project sharing

## Future Ideas

- Template ratings/favorites
- Cost estimates per project
- Auto-shutdown idle projects
- Team collaboration
- Template customization before deploy
- Templates
  - Filter by category
  - Search functionality
  - Sort options
- Projects
  - Deployment logs viewer
  - Environment variables editor
  - Custom notes/tags
- Project Detail
  - Deployment history
  - Resource usage metrics
  - Custom domain support
