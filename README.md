<div align="center">
  <br />
  <img src="public/favicon.svg" width="120" height="120" alt="Maglev Logo" />
  <h1 align="center">Maglev</h1>
  <p align="center"><strong>Your development workflow automation.</strong></p>
</div>

---

## Introduction

Maglev is inspired by Railway's focus on developer experience, and aims to build atop that foundation by bringing integrated GitHub repos, local checkout, Claude Code, and more into one consistent automated workflow.

You can run Maglev yourself (see Quick Start below) or use our hosted offering (forthcoming).

- **Current Focus**
  - **Railway Integration** - E.g. One-click deploy to production ✅
- **Future**
  - **Claude Code Integration** - AI-powered development workflows
  - **GitHub Repository Management** - Direct repo operations
  - **Local Checkout** - Work with projects locally

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/maglev.git
cd maglev

# Install dependencies
pnpm install

# Set up the database
gel project init
gel migrate

# Generate code
pnpm gen

# Start the dev server
pnpm dev
```

Then:

1. Open [http://localhost:5173](http://localhost:5173)
2. Sign in with GitHub
3. Add your Railway API token in Settings
4. Start deploying templates!

## Prerequisites

- **Node.js** 22+ and **pnpm** 10+
- **Railway Account** - Sign up at [railway.app](https://railway.app)
- **GitHub Account** - For authentication
- **Gel (EdgeDB)** - See [geldata.com/install](https://geldata.com/install)

## Installation

### Railway API Token

1. **Generate a token:**
   - Go to [Railway Account Settings → Tokens](https://railway.app/account/tokens)
   - Click "Create Token"
   - Give it a name (e.g., "Maglev")
   - Copy the token value

2. **Configure in Maglev:**
   - Log in with GitHub
   - Go to Settings
   - Paste your Railway API token
   - Save settings

### Gel Database

Gel is EdgeDB - a modern graph-relational database. Follow the installation instructions at [geldata.com/install](https://geldata.com/install).

After installing:

1. **Initialize the project database:**
   ```bash
   gel project init
   ```

2. **Run migrations:**
   ```bash
   gel migrate
   ```

3. **Generate TypeScript client (if needed):**
   ```bash
   pnpm gen:gel
   ```

## Tech Stack

- **Frontend**: React + React Router (RSC mode)
- **Styling**: Panda CSS
- **Backend**: Effect runtime system
- **Database**: Gel (EdgeDB)
- **Authentication**: GitHub OAuth
- **API**: Railway GraphQL API
- **Type Safety**: TypeScript + Graffle (GraphQL client)

## Development

See [DEVELOPMENT.md](./DEVELOPMENT.md) for development workflow, architecture details, and common tasks.

## License

MIT
