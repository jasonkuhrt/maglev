# Template Launch

## User Journeys

### Journey 1: First-Time Template Deployment

**Actor**: Developer with Railway API token configured

**Starting Point**: User browsing template marketplace at `/market`

**Steps**:

1. User views grid of available Railway templates
2. User reads template details (name, description, service count, GitHub repos)
3. User clicks "Deploy" button on chosen template
4. System initiates deployment immediately
5. Browser navigates to `/dashboard` (new project visible)
6. User sees real-time deployment progress
7. User receives deployment completion notification
8. User accesses deployed application via provided URL

### Journey 2: Deployment Failure Recovery

**Actor**: Developer experiencing deployment failure

**Starting Point**: Dashboard showing project with failed deployment

**Steps**:

1. User views project in "failed" status
2. User reads error message with specific failure reason
3. User clicks "View Details" to see full error context
4. User identifies issue (e.g., missing environment variables)
5. User clicks "Retry Deployment"
6. System attempts deployment with same configuration
7. User monitors new deployment attempt

## Failure States

| Failure Type              | Trigger                                    | User Experience                                                                                                                                 | Recovery Method                          |
| ------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Railway API Unavailable   | Railway API returns 503 or times out       | Error banner: "Railway services temporarily unavailable"<br>Cached template data displayed if available<br>Deploy buttons disabled with tooltip | Automatic retry with exponential backoff |
| Invalid Railway Token     | Railway API returns 401 Unauthorized       | Redirect to token configuration prompt<br>Previous token cleared from settings<br>Error: "Railway API token is invalid or expired"              | User provides new valid token            |
| Template No Longer Exists | Railway returns 404 for template           | Error: "This template is no longer available"<br>Suggestion to refresh template list<br>Alternative templates shown                             | User selects different template          |
| Deployment Quota Exceeded | Railway API returns quota error            | Error message with specific quota limit<br>Link to Railway billing page<br>List of existing projects                                            | User upgrades plan or deletes projects   |
| Network Interruption      | Connection lost after deployment initiated | Project in "deploying" state<br>Status polling continues<br>Message: "Connection lost - deployment continuing"                                  | Automatic sync when connection restored  |

## Database Schema Design

```edgeql
module default {
  # Status enums
  scalar type ProjectStatus extending enum<
    'initializing',    # Maglev record created, Railway API pending
    'deploying',       # Railway deployment active
    'active',          # Successfully deployed
    'failed',          # Deployment failed
    'stopped'          # User stopped project
  >;

  scalar type DeploymentStatus extending enum<
    'QUEUED',
    'BUILDING',
    'DEPLOYING',
    'SUCCESS',
    'FAILED',
    'CANCELLED'
  >;

  # Template entity
  type Template {
    required code: str {
      constraint exclusive;
    }
    required name: str;
    description: str;
    serializedConfig: json;  # Railway template configuration
    serviceCount: int16 {
      default := 0;
    }
    githubRepos: array<str>;

    required createdAt: datetime {
      default := datetime_current();
    }
    updatedAt: datetime;

    index on (.code);
  }

  # Project entity with Railway integration
  type Project {
    required name: str;
    required link template -> Template;  # Link to Template entity

    # Railway identifiers
    required railwayProjectId: str {
      constraint exclusive;
    }
    railwayWorkflowId: str;
    railwayServiceIds: array<str>;
    railwayEnvironmentId: str;

    # Status tracking
    required status: ProjectStatus {
      default := ProjectStatus.initializing;
    }
    deploymentStatus: DeploymentStatus;

    # Deployment details
    deployedAt: datetime;
    url: str;
    lastError: json;  # {message, code, timestamp, details}

    required createdAt: datetime {
      default := datetime_current();
    }
    updatedAt: datetime;

    index on (.createdAt);
    index on (.status);
    index on (.railwayProjectId);
  }

  # Audit trail
  type DeploymentEvent {
    required link project -> Project;
    required eventType: str;  # 'status_change', 'error', 'milestone'
    required timestamp: datetime {
      default := datetime_current();
    }
    oldStatus: ProjectStatus;
    newStatus: ProjectStatus;
    details: json;

    index on (.timestamp);
    index on (.project, .timestamp);
  }
}
```

## External API Calls

### 1. List Templates

**Endpoint**: Railway GraphQL
**Operation**:

```graphql
query {
  templates(first: 50) {
    edges {
      node {
        id
        code
        name
        description
        serializedConfig
      }
    }
  }
}
```

**Response**:

```json
{
  "edges": [{
    "node": {
      "id": "uuid",
      "code": "template-code",
      "name": "Template Name",
      "description": "Description text",
      "serializedConfig": {
        "services": {
          "service-id": {
            "name": "service-name",
            "source": {
              "repo": "owner/repo",
              "branch": "main"
            }
          }
        }
      }
    }
  }]
}
```

**Error Cases**: 401 (invalid token), 503 (service unavailable)

### 2. Deploy Template

**Endpoint**: Railway GraphQL
**Operation**:

```graphql
mutation {
  templateDeployV2(input: {
    templateId: "template-uuid",
    serializedConfig: {}
  }) {
    projectId
    workflowId
  }
}
```

**Response**:

```json
{
  "projectId": "proj_uuid",
  "workflowId": "workflow_uuid"
}
```

**Error Cases**: 401 (invalid token), 404 (template not found), insufficient resources

### 3. Check Deployment Status

**Endpoint**: Railway GraphQL
**Operation**:

```graphql
query {
  workflowStatus(id: "workflow_uuid") {
    id
    status
    error
    completedAt
  }
}
```

**Response**:

```json
{
  "id": "workflow_uuid",
  "status": "SUCCESS",
  "error": null,
  "completedAt": "2024-01-15T10:30:00Z"
}
```

**Error Cases**: 404 (workflow not found)

### 4. Get Project Details

**Endpoint**: Railway GraphQL
**Operation**:

```graphql
query {
  project(id: "proj_uuid") {
    id
    name
    services {
      edges {
        node {
          id
          name
          domains {
            serviceDomain
            customDomain
          }
        }
      }
    }
    environments {
      edges {
        node {
          id
          name
          isDefault
        }
      }
    }
  }
}
```

**Response**:

```json
{
  "id": "proj_uuid",
  "name": "Project Name",
  "services": {
    "edges": [{
      "node": {
        "id": "service_uuid",
        "name": "web",
        "domains": {
          "serviceDomain": "app.up.railway.app",
          "customDomain": null
        }
      }
    }]
  },
  "environments": {
    "edges": [{
      "node": {
        "id": "env_uuid",
        "name": "production",
        "isDefault": true
      }
    }]
  }
}
```

**Error Cases**: 404 (project not found), 401 (unauthorized)
