# Feature: Git Clone to Local File System

## Overview

Enable Maglev users to clone their Railway projects directly to their local machine from the web interface, without needing to use terminal commands or have git installed.

## User Story

As a Maglev user, I want to clone my deployed Railway project to my local machine with a single click, so I can start developing locally without needing to manually run git commands.

## Technical Approach

### Primary Solution: isomorphic-git + File System Access API

For modern browsers (Chrome, Edge) that support the File System Access API, we can provide a seamless experience:

1. **isomorphic-git**: Pure JavaScript git implementation that runs in browsers
2. **File System Access API**: Write files directly to user's chosen directory
3. **CORS proxy**: Handle cross-origin repository access

### Implementation Details

#### Core Components

```typescript
// app/lib/git-clone/git-clone.ts
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/web'

export async function cloneToLocalDirectory(
  repoUrl: string,
  projectName: string,
) {
  // Request directory access from user
  const dirHandle = await window.showDirectoryPicker({
    id: 'maglev-projects',
    startIn: 'documents',
    mode: 'readwrite',
  })

  // Create project folder
  const projectDir = await dirHandle.getDirectoryHandle(projectName, {
    create: true,
  })

  // Clone repository using isomorphic-git
  await git.clone({
    fs: new FileSystemAccessFS(projectDir), // Custom FS adapter
    http,
    dir: '/',
    url: repoUrl,
    corsProxy: 'https://cors.isomorphic-git.org',
  })
}
```

#### File System Adapter

Bridge between isomorphic-git and File System Access API:

```typescript
// app/lib/git-clone/fs-adapter.ts
class FileSystemAccessFS {
  constructor(private rootHandle: FileSystemDirectoryHandle) {}

  async writeFile(filepath: string, data: Uint8Array) {
    const path = filepath.split('/')
    const filename = path.pop()!
    let dir = this.rootHandle

    // Navigate to directory structure
    for (const segment of path) {
      if (segment) {
        dir = await dir.getDirectoryHandle(segment, { create: true })
      }
    }

    // Write file
    const fileHandle = await dir.getFileHandle(filename, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(data)
    await writable.close()
  }

  async readFile(filepath: string): Promise<Uint8Array> {
    // Implementation for reading files
  }

  async mkdir(filepath: string): Promise<void> {
    // Implementation for creating directories
  }

  async readdir(filepath: string): Promise<string[]> {
    // Implementation for reading directory contents
  }

  async stat(filepath: string): Promise<any> {
    // Implementation for file stats
  }

  // Additional methods required by isomorphic-git
}
```

### Fallback Solutions

For browsers without File System Access API support (Firefox, Safari):

#### Option 1: Download as ZIP

```typescript
import JSZip from 'jszip'

async function downloadAsZip(repoUrl: string, projectName: string) {
  const zip = new JSZip()

  // Clone to memory using isomorphic-git with InMemoryFS
  const files = await cloneToMemory(repoUrl)

  // Add files to zip
  for (const file of files) {
    zip.file(file.path, file.content)
  }

  // Generate and download zip
  const blob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(blob, `${projectName}.zip`)
}
```

#### Option 2: Show Clone Command

```typescript
function CloneInstructions({ repoUrl }: { repoUrl: string }) {
  const command = `git clone ${repoUrl}`

  return (
    <div>
      <p>Your browser doesn't support direct file system access.</p>
      <p>Run this command in your terminal:</p>
      <code>{command}</code>
      <Button onClick={() => navigator.clipboard.writeText(command)}>
        Copy Command
      </Button>
    </div>
  )
}
```

## Integration Points

### Railway API

Query Railway for repository information:

```graphql
query GetProjectRepo($projectId: String!) {
  project(id: $projectId) {
    id
    name
    repository {
      fullRepoUrl
      defaultBranch
      provider
    }
  }
}
```

### UI Integration

Add clone button to project detail page:

```typescript
// app/blocks/project-actions.tsx
export const ProjectActions = ({ project, railwayData }) => {
  const handleClone = async () => {
    try {
      const repoUrl = railwayData?.repository?.fullRepoUrl

      if (!repoUrl) {
        throw new Error('No repository URL found')
      }

      // Detect browser capabilities
      if ('showDirectoryPicker' in window) {
        // Use File System Access API
        await cloneToLocalDirectory(repoUrl, project.name)
        toast.success('Project cloned to your local directory!')
      } else {
        // Fall back to ZIP download
        await downloadAsZip(repoUrl, project.name)
        toast.info('Project downloaded as ZIP file')
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        // User cancelled directory picker
        return
      }
      toast.error(`Failed to clone: ${error.message}`)
    }
  }

  return (
    <Button onClick={handleClone} icon={<GitBranch />}>
      Clone to Computer
    </Button>
  )
}
```

## Browser Compatibility

| Browser    | Support Level | Method                                  |
| ---------- | ------------- | --------------------------------------- |
| Chrome 86+ | Full          | File System Access API + isomorphic-git |
| Edge 86+   | Full          | File System Access API + isomorphic-git |
| Opera 72+  | Full          | File System Access API + isomorphic-git |
| Firefox    | Partial       | ZIP download or clone command           |
| Safari     | Partial       | ZIP download or clone command           |

## Security Considerations

1. **User Consent**: All file system access requires explicit user permission through directory picker
2. **Directory Scope**: App can only access the directory/files the user explicitly grants
3. **CORS Proxy**: Required for cross-origin git repositories
4. **Rate Limiting**: Consider implementing rate limits for clone operations
5. **Authentication**: Handle private repositories with appropriate auth tokens

## Benefits

1. **Zero Configuration**: Users don't need git installed locally
2. **One-Click Experience**: Direct from web UI to local development
3. **Seamless Workflow**: Template → Deploy → Clone → Develop
4. **Cross-Platform**: Works on any OS with a modern browser
5. **Progressive Enhancement**: Graceful fallbacks for unsupported browsers

## Implementation Phases

### Phase 1: MVP

- Basic clone functionality for public repos
- File System Access API implementation for Chrome/Edge
- Simple ZIP fallback for other browsers

### Phase 2: Enhanced Experience

- Private repository support with auth
- Progress indicators during clone
- Selective file/folder cloning
- Clone specific branches/tags

### Phase 3: Advanced Features

- Shallow clone options for large repos
- Resume interrupted clones
- Local git config setup (user name, email)
- Integration with local IDEs (VS Code, etc.)

## Dependencies

```json
{
  "dependencies": {
    "isomorphic-git": "^1.25.0",
    "jszip": "^3.10.0"
  }
}
```

## Alternative Approaches Considered

1. **Browser Extension**: Could provide deeper system integration but adds installation friction
2. **Desktop App**: More powerful but defeats the purpose of a web-first approach
3. **WebContainers**: Could run git in browser but requires significant infrastructure

## Future Enhancements

- **Sync Changes**: Push/pull changes back to Railway from local clone
- **Branch Management**: Create and switch branches from web UI
- **Conflict Resolution**: Handle merge conflicts in the browser
- **Live Preview**: Preview local changes before deploying to Railway

## References

- [File System Access API Spec](https://wicg.github.io/file-system-access/)
- [isomorphic-git Documentation](https://isomorphic-git.org/)
- [Chrome File System Access Guide](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access)
- [Railway API Documentation](https://docs.railway.app/reference/public-api)
