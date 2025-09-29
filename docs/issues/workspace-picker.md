# Workspace Picker for Template Launch

## Current Issue

In `/app/routes/api.template-launch.tsx` (line 62-63), we have a TODO:

```typescript
// todo don't hardcard selection of workspace
const workspace = me?.workspaces?.[0]
```

Currently, the system automatically selects the first workspace when launching a template, which may not be the desired workspace for users with multiple Railway workspaces.

## Problem

Users who have access to multiple Railway workspaces cannot choose which workspace to deploy their template to. This is problematic for:

- Users with personal and organization workspaces
- Users managing multiple projects across different workspaces
- Users with different billing/resource allocations per workspace

## Proposed Solution

### 1. Add Workspace Selection to Template Launch Flow

#### Option A: Pre-fetch and Select (Recommended)

- When user clicks "Launch Template", first fetch available workspaces
- Show a workspace picker dialog/dropdown before the project name input
- Pass selected workspace ID to the template launch action

#### Option B: Include in Launch Form

- Add workspace dropdown directly to the template launch form
- Fetch workspaces when form opens
- Include workspace ID in form submission

### 2. Implementation Details

#### Frontend Changes

- Modify `TemplateCard` component to fetch workspaces when launch is initiated
- Add workspace selection UI (dropdown or radio buttons)
- Store selected workspace in form state

#### Backend Changes

- Modify `/api/template-launch` action to accept `workspaceId` parameter
- Remove hardcoded workspace selection
- Validate that user has access to the selected workspace

### 3. UI/UX Considerations

- Show workspace details (name, projects count, region)
- Indicate default workspace if applicable
- Handle single workspace case gracefully (auto-select, no picker shown)
- Show loading state while fetching workspaces

### 4. Error Handling

- Handle case where user has no workspaces
- Handle workspace fetch failures
- Validate workspace access before deployment

## Code References

- Template launch action: `/app/routes/api.template-launch.tsx:42-73`
- Template card component: `/app/blocks/template-card.tsx`
- Current workspace fetching logic: `/app/routes/api.template-launch.tsx:45-82`

## Priority

Medium - This affects users with multiple workspaces and prevents proper project organization.

## Related Issues

- Railway API integration
- User settings and preferences
- Project organization and management
