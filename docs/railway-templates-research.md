# Railway Templates Research

## Key Findings

### 1. Template → GitHub Repo Mapping

**Railway templates expose GitHub repos in `serializedConfig`:**

```typescript
{
  serializedConfig: {
    services: {
      "<service-id>": {
        name: "service-name",
        source: {
          repo: "owner/repo-name" | "https://github.com/owner/repo",
          branch: "main" | null,
          rootDirectory: "/path" | null
        },
        // OR for Docker images
        source: {
          image: "docker.io/image:tag"
        }
      }
    }
  }
}
```

**Example templates with GitHub repos:**

- Next.js Boilerplate: `https://github.com/ixartz/Next-js-Boilerplate`
- Astro Tailwind: `jacksmithxyz/modern-astro-starter`
- Astro Starlight: `jacksmithxyz/astro-starlight-starter`

### 2. Enhanced Launch Flow Design

```
1. List templates from Railway API
   └─ Query: templates(first: 20)
   └─ Returns: id, code, name, description, serializedConfig

2. User clicks "Launch" on a template
   └─ Extract GitHub repo from serializedConfig.services[].source.repo

3. Deploy template to Railway
   └─ Call: templateDeployV2({ templateId, serializedConfig })
   └─ Returns: { projectId, workflowId }

4. Fork template to user's GitHub (OPTIONAL - enhanced feature)
   └─ Call: templateServiceSourceEject({
        projectId,
        serviceIds,
        repoOwner: "user-github-username",
        repoName: "generated-project-name",
        upstreamUrl: "original-template-repo-url"
      })
   └─ Creates NEW GitHub repo in user's account
   └─ Switches Railway service to deploy from user's fork
   └─ Maintains upstream link for updates

5. Clone to local disk
   └─ Run: gh repo clone user/generated-project-name ~/projects/...

6. Railway auto-deploys from user's repo
   └─ Already configured by templateServiceSourceEject
   └─ Push commits → automatic Railway deployments
```

### 3. API Flow Details

**Minimal MVP (no fork):**

```typescript
// 1. Load templates
const templates = await railway.query.templates({ $: { first: 20 } })

// 2. Deploy
const deployment = await railway.mutation.templateDeployV2({
  $: { input: { templateId: "template-id", serializedConfig: {...} } }
})

// 3. Done - deployed from template's source repo
```

**Enhanced flow (with fork):**

```typescript
// 1-2. Same as above

// 3. Fork to user's GitHub
const ejected = await railway.mutation.templateServiceSourceEject({
  $: {
    input: {
      projectId: deployment.projectId,
      serviceIds: ['service-id'],
      repoOwner: 'user-github-username',
      repoName: 'my-new-project',
      upstreamUrl: 'https://github.com/template/repo',
    },
  },
})

// 4. Clone locally
await exec('gh repo clone user/my-new-project ~/projects/my-new-project')

// 5. Now user can git commit/push → auto-deploy on Railway
```

### 4. Implementation Priority

**Phase 1: Railway Templates Gallery (MVP)**

- Query Railway templates API
- Display in Maglev UI
- Launch via `templateDeployV2`
- Save project metadata to Gel
- View deployed projects

**Phase 2: GitHub Integration (Enhanced)**

- Extract repo URLs from serializedConfig
- Use `templateServiceSourceEject` to fork
- Clone to local disk
- Full git workflow enabled

**Phase 3: Custom Templates**

- Add React Router RSC (not in Railway's catalog)
- Support custom GitHub repos
- Manual repo → Railway deployment

## Technical Notes

- Railway templates are NOT in a monorepo
- Each template references discrete GitHub repos
- `serializedConfig` is a JSON scalar (opaque to GraphQL introspection)
- Both `https://` URLs and `owner/repo` formats are valid
- `templateServiceSourceEject` creates real GitHub forks (requires GitHub auth)

## Implementation Status

### ✅ Completed

**Typed SerializedTemplateConfig Scalar**

Created strongly-typed custom scalar for `SerializedTemplateConfig` in Graffle:

```typescript
// app/lib/railway/types.ts
export type SerializedTemplateConfig = {
  services: Record<string, TemplateService>
}

export type TemplateService = {
  name: string
  icon?: string | null
  source: TemplateServiceSource
  variables?: Record<string, TemplateVariable>
  // ...
}

export type TemplateServiceSource =
  | { repo: string; branch?: string | null; rootDirectory?: string | null }
  | { image: string }
```

**Utility Functions:**

```typescript
import { extractGitHubRepos, isGitHubSource, Railway } from '#lib/railway'

// Extract all GitHub repos from a template config
const repos = extractGitHubRepos(config)

// Type-safe source checking
if (isGitHubSource(service.source)) {
  console.log(service.source.repo) // TypeScript knows this exists
}
```

**Usage Example:**

```typescript
const result = await railway.query.templates({
  $: { first: 20 },
  edges: {
    node: {
      serializedConfig: true, // Now strongly typed!
    },
  },
})

result.edges.forEach((edge) => {
  const repos = extractGitHubRepos(edge.node.serializedConfig)
  // repos is string[]
})
```

### 📝 Next Steps

1. Create `app/lib/railway/operations.ts` with deployment functions
2. Wire up market.tsx to load Railway templates
3. Implement launch flow with `templateDeployV2`
4. Add GitHub integration with `templateServiceSourceEject`
