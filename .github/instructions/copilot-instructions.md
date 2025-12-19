---
applyTo: '**'
---
# Project Overview

This application is a web platform to digitally manage and conduct homeowners / property owner meetings.
It allows organizations to manage properties, create meetings, define agenda items (TOPs), document decisions, and provide structured access for participants.
The target audience is property managers and property owners. The focus is correctness, security, and long-term maintainability.

The application is deployed on Cloudflare Workers and optimized for edge execution.

---

## Tech Stack

### Runtime / Platform
- **Cloudflare Workers** (edge runtime with Node.js compatibility via `nodejs_compat` flag)
- **@opennextjs/cloudflare** adapter for Next.js deployment
- **Cloudflare D1** (SQLite database)
- **Cloudflare R2** (Object storage for file uploads)
- **Cloudflare AI** (For text summarization features)
- Environment variables via `.dev.vars` (local) and Cloudflare secrets (production)

### Frontend
- **Next.js 15** (App Router)
- **React 19** (functional components, hooks only)
- **TypeScript** (strict mode enabled)
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Hook Form** + **Zod** for form validation
- **react-hot-toast** for notifications

### Backend / Data
- **Drizzle ORM** with D1 adapter
- **Cloudflare D1** (SQLite) database
- Schema-first approach with migrations
- **Better Auth** for authentication (Google/Microsoft OAuth)

### Tooling
- **pnpm** (package manager)
- **Biome** (formatting and linting)
- **TypeScript** compiler for type safety
- **Wrangler** for Cloudflare Workers development

---

## Coding Guidelines

### General
- Write clean, readable, and maintainable code
- Prefer clarity over cleverness
- Small, focused modules and components
- No dead code, no commented-out code
- No `any` in TypeScript
- In React: never use `undefined`, use `null` explicitly
- **No Magic Strings**: Never hardcode URLs, status values, or configuration strings - use constants or enums
- **Route Management**: ALWAYS use route definitions from `*.route.ts` files - NEVER hardcode paths like `"/meetings"` or `"/dashboard"`

### TypeScript
- Strict typing everywhere
- Prefer explicit return types on exported functions
- Use discriminated unions over boolean flags
- Avoid type assertions (`as`) unless unavoidable

### React / Next.js
- Functional components only
- Follow idiomatic Next.js App Router patterns
- Use server components by default, client components only when required
- Keep side effects isolated and predictable
- No business logic in JSX

### Styling (Tailwind)
- Use Tailwind utilities consistently
- Avoid duplicating long class strings – extract reusable components when needed
- No inline styles
- Keep accessibility in mind (contrast, focus states)

### Security
- **Input Validation**: ALL external inputs MUST be validated with Zod schemas using `.parse()` (never `.safeParse()` without proper error handling)
- **Authentication**: Always use `await requireAuth()` in Server Actions before any business logic
- **Authorization**: Use `await requireMember(organizationId)` or `await requireOwner(organizationId)` for permission checks
- **Multi-Tenancy Isolation**: ALWAYS filter database queries by `organizationId` to prevent data leaks between organizations
- **File Uploads**: Use `validateFile()` from `@/lib/file-validation` to check MIME types, extensions, and size limits
- **SQL Injection**: Use Drizzle ORM with typed queries (eq, and, or) - NEVER use raw SQL or string interpolation
- **XSS Prevention**: React automatically escapes JSX content - avoid dangerouslySetInnerHTML unless absolutely necessary
- **Error Handling**: Never expose stack traces or internal errors to clients - use generic error messages in production
- **Secrets Management**: Use Cloudflare secrets (production) and `.dev.vars` (local) - NEVER hardcode credentials
- **Rate Limiting**: Rely on Better Auth's built-in rate limiting for authentication endpoints

### Performance (Cloudflare Workers)
- **Bundle Size**: Keep dependencies minimal - audit with `pnpm why <package>` before adding new packages
- **Edge Compatibility**: Avoid Node.js-specific APIs where possible (use Web APIs instead)
- **Server Components**: Use React Server Components by default - only create Client Components when interactivity is required
- **Database Queries**: 
  - Use `.limit()` on all queries that could return unbounded results
  - Prefer `.innerJoin()` over multiple queries to reduce round trips
  - Use `Promise.all()` for parallel independent queries
- **Caching Strategy**:
  - Use `revalidatePath()` after mutations to invalidate Next.js cache
  - Consider edge caching for public/static content
  - Avoid over-fetching - select only required columns
- **Async Operations**: Use `Promise.race()` with timeouts for external API calls (e.g., middleware session validation)
- **Asset Optimization**: Use Next.js Image component for automatic optimization

### Maintainability & Error Handling
- **Explicit Error Handling**: Always wrap async operations in try-catch blocks
- **Structured Logging**: Use `console.error("Context:", error)` with descriptive prefixes for debugging
- **User-Facing Errors**: Use `toast.error()` in Client Components - NEVER use `alert()`
- **Server Action Returns**: Always return `{ success: boolean; error?: string; data?: T }` pattern
- **HTTP Status Codes**: Use appropriate codes (401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error)
- **No Sensitive Data**: Never log passwords, tokens, session IDs, or internal implementation details
- **Error Recovery**: Use `NEXT_REDIRECT` error detection in catch blocks - re-throw if detected
- **Validation Errors**: Zod parse errors should be caught and converted to user-friendly messages

---

## Project Structure

### Module-Based Architecture (`src/modules/`)
Each domain is organized as a module with consistent structure:

```
src/
├── modules/              # Domain modules
│   ├── meetings/        # Core: meetings & agenda management
│   │   ├── features/    # Page components (Server Components by default)
│   │   └── shared/      # Actions, schemas, routes, components
│   ├── organizations/   # Multi-tenancy & invitations
│   ├── properties/      # Real estate properties
│   ├── owners/         # Property owners
│   ├── units/          # Property units
│   └── auth/           # Authentication
├── app/                # Next.js App Router pages and layouts
├── components/         # Shared UI components (Radix-based)
├── lib/               # Utilities and helpers
├── db/                # Database setup and schema exports
└── services/          # External service integrations (email, AI)
```

**Convention**: 
- `features/` = Page-level components (usually Server Components)
- `shared/` = Reusable actions, schemas, utilities
- Each module exports `*.route.ts` for centralized URL management - **ALWAYS use these route constants**
- Each module has `*.action.ts` files with `"use server"` directive

**Route Usage Example**:
```typescript
// ✅ CORRECT: Import and use route constants
import { meetingsRoutes } from "@/modules/meetings/shared/meetings.route";
revalidatePath(meetingsRoutes.list);
redirect(meetingsRoutes.detail(meetingId));

// ❌ WRONG: Hardcoded strings
revalidatePath("/meetings");
redirect(`/meetings/${meetingId}`);
```

---

## Critical Patterns

### 1. Server vs Client Components

**Server Components** (default):
- All page components in `features/` folders
- Data fetching with `async` functions
- Use Server Actions for mutations

**Client Components** (`"use client"`):
- Interactive UI (forms, dialogs, buttons with state)
- Hooks usage (useState, useRouter, useForm)
- Toast notifications

**Example**: `StartMeetingButton` (client) is used in `MeetingDetailPage` (server) - clean separation!

### 2. Database Access (Drizzle + D1)
```typescript
import { getDb } from "@/db";

// In Server Actions or Server Components:
const db = await getDb();
const results = await db.select().from(meetings).where(eq(meetings.id, id));
```

**Important**: Always use `getDb()` - it handles Cloudflare context and caching.

### 3. Authentication Flow
```typescript
import { requireAuth } from "@/modules/auth/shared/utils/auth-utils";

// Protect pages/actions:
await requireAuth(); // Throws redirect if not authenticated

// Get current user:
const user = await getAuthUser();
```

**Middleware**: `/middleware.ts` protects `/dashboard/*` and other routes with session timeout (5s).

### 4. Server Actions Pattern
```typescript
"use server";

export async function createMeeting(
    data: FormData
): Promise<{ success: boolean; error?: string; meetingId?: number }> {
    try {
        await requireAuth();
        const db = await getDb();
        // ... logic
        revalidatePath("/meetings");
        return { success: true, meetingId: result[0].id };
    } catch (error) {
        console.error("Error creating meeting:", error);
        return { success: false, error: "Error message" };
    }
}
```

**CRITICAL Convention**: 
- Always return `{ success: boolean; error?: string; ... }` - NEVER throw errors to clients
- Use `console.error()` for server-side logging (visible in Cloudflare dashboard with `removeConsole: false`)
- Call `revalidatePath()` after mutations to invalidate Next.js cache
- **NEVER** use `redirect()` inside try/catch without re-throwing `NEXT_REDIRECT` errors:
  ```typescript
  try {
      // ...
      redirect("/some-path");
  } catch (error) {
      if (error?.message?.includes("NEXT_REDIRECT")) {
          throw error; // Re-throw Next.js redirects
      }
      console.error("Error:", error);
      return { success: false, error: "Failed" };
  }
  ```

### 5. Error Handling (Client-Side)
```typescript
// Client-side: Use toast.error (NOT alert())
import toast from "react-hot-toast";

const result = await someMutation();
if (!result.success) {
    toast.error(result.error || "Default error message");
}
```

**Important**: All error notifications must use `toast.error()` for consistency.

### 6. Organization-Based Multi-Tenancy
Every resource belongs to an `organizationId`. Use permission helpers:
```typescript
import { requireMember, requireOwner } from "@/modules/organizations/shared/organization-permissions.action";

await requireMember(organizationId);  // Throws if user not a member
await requireOwner(organizationId);   // Throws if user not owner/admin
```

---

## Development Workflow

### Local Development (Recommended)
```bash
# Terminal 1: Wrangler for D1 access
pnpm run wrangler:dev

# Terminal 2: Next.js with HMR
pnpm run dev
```

### Database Operations
```bash
# Generate migration after schema changes
pnpm run db:generate

# Apply migrations locally
pnpm run db:migrate:local

# Inspect tables
pnpm run db:inspect:local

# Studio (local)
pnpm run db:studio:local
```

### Deployment
```bash
# Build for Cloudflare
pnpm run build:cf

# Deploy to production
pnpm run deploy

# Deploy to preview
pnpm run deploy:preview
```

---

## Key Files Reference

- **Database setup**: `src/db/index.ts` - Use `getDb()` everywhere
- **Auth config**: `src/modules/auth/shared/utils/auth-utils.ts`
- **Cloudflare bindings**: `wrangler.jsonc` (D1: `DB`, R2: `BUCKET`, AI: `AI`)
- **Schema exports**: `src/db/schema.ts` - Central export of all Drizzle schemas
- **Middleware**: `middleware.ts` - Session validation with timeout

---

## Common Gotchas & Enterprise Best Practices

1. **Console logs in production**: `next.config.ts` has `removeConsole: false` - logs are kept for Cloudflare observability via Workers Logs
2. **Redirect in Server Actions**: Next.js uses errors for redirects - ALWAYS check for `NEXT_REDIRECT` in catch blocks and re-throw
3. **Client components**: Must be separate files when used in Server Components - can't mix `"use client"` and `"use server"` in same file
4. **D1 Migrations**: ALWAYS run locally first (`db:migrate:local`), then preview, then production - verify schema changes carefully
5. **File uploads**: Use R2 API routes (`/api/agenda-items/[id]/attachments`) - NOT Server Actions (FormData size limits)
6. **Node.js compatibility**: Available via `nodejs_compat` flag, but prefer Web APIs when possible for better edge performance
7. **Input Validation**: EVERY Server Action must validate inputs with Zod `.parse()` - no exceptions
8. **Query Limits**: ALWAYS use `.limit()` on database queries - prevent unbounded result sets
9. **Multi-Tenancy**: EVERY query must filter by `organizationId` - NEVER trust client-provided IDs without permission checks
10. **Error Messages**: Use generic messages for production - specific messages only in development (check `process.env.NODE_ENV`)
11. **Session Timeout**: Middleware uses 5s timeout with `Promise.race()` - adjust if needed but keep reasonable limits
12. **Type Safety**: Never use `as` type assertions without comment explaining why it's safe
13. **Magic Strings**: NEVER hardcode URLs, paths, status strings, or config values - use constants from `*.route.ts` or enums
14. **Route Constants**: ALWAYS import routes from `*.route.ts` files - NEVER use string literals like `"/meetings"` or `"/dashboard"`

---

## Resources

- Drizzle migrations via pnpm scripts
- Biome config defines formatting and lint rules
- Tailwind config defines design tokens and breakpoints
- Cloudflare environment variables (`.dev.vars` local, secrets in production)

---

## Expectations for AI Agents

- Follow the rules and structure defined in this file
- Do not introduce new libraries without strong justification
- Node.js APIs are available but prefer Web APIs
- Prefer secure, explicit, and boring solutions
- Generated code should be production-ready, not demo-quality
- Always use the module structure and patterns described above