<div align="center">
  <br />
  <img src="public/favicon.svg" width="120" height="120" alt="Maglev Logo" />
  <h1 align="center">Maglev</h1>
  <p align="center"><strong>🚄 Deploy Railway templates with one click</strong></p>
  <p align="center">
    <a href="#quick-start">Quick Start</a> •
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="./DEVELOPMENT.md">Development</a>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square" alt="TypeScript" />
    <img src="https://img.shields.io/badge/React-18.3+-61dafb?style=flat-square" alt="React" />
    <img src="https://img.shields.io/badge/Effect-3.0+-7c3aed?style=flat-square" alt="Effect" />
    <img src="https://img.shields.io/badge/Railway-API-0b0d0e?style=flat-square" alt="Railway" />
  </p>
</div>

---

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
4. Start deploying templates! 🚀

## Prerequisites

- **Node.js** 18+ and **pnpm** 8+
- **Railway Account** - Sign up at [railway.app](https://railway.app)
- **GitHub Account** - For authentication
- **Gel CLI** - Database management (installation below)

## Installation

### Railway API Token

1. **Generate a token:**
   - Go to [Railway Account Settings → Tokens](https://railway.app/account/tokens)
   - Click "Create Token"
   - Give it a name (e.g., "Maglev")
   - Copy the token value

2. **Configure the token** (choose one method):

   **Option A: In-app configuration (Recommended)**
   - Log in to Maglev with GitHub
   - Go to Settings
   - Paste your Railway API token
   - Save settings

   **Option B: Environment variable (for development)**
   ```bash
   # Add to your shell config (.bashrc, .zshrc, or config.fish)
   export RAILWAY_API_TOKEN='your_token_here'

   # Reload your shell config
   source ~/.bashrc  # or ~/.zshrc or ~/.config/fish/config.fish
   ```

### Gel Database

Gel is a modern graph-relational database (similar to EdgeDB) used by Maglev.

1. **Install Gel CLI:**
   ```bash
   # macOS/Linux
   curl --proto '=https' --tlsv1.2 -sSf https://sh.geldata.com | sh

   # Or via Homebrew (macOS)
   brew install gel/tap/gel-cli
   ```

2. **Initialize the project database:**
   ```bash
   # Create a local Gel instance for the project
   gel project init
   # This uses the existing gel.toml configuration
   ```

3. **Run migrations:**
   ```bash
   # Apply the database schema
   gel migrate
   ```

4. **Generate TypeScript client:**
   ```bash
   # After modifying the schema, regenerate the client
   pnpm gen:gel
   ```

### Project Setup

```bash
# Install dependencies
pnpm install

# Generate all code (routes + Railway GraphQL client)
pnpm gen

# Start dev server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173)

## Features

- 🚀 **One-Click Deploy** - Launch Railway templates instantly
- 🔐 **GitHub Auth** - Secure authentication via GitHub OAuth
- 📊 **Project Management** - Track all your deployed projects
- 🎨 **Template Marketplace** - Browse curated Railway templates
- 🌙 **Dark Mode** - Theme support with system preference detection
- ⚡ **Real-time Status** - Live deployment status from Railway API

## Configuration

The app stores user settings locally:

- **Railway API Token**: Stored in app settings (per-user basis)
- **Theme Preference**: Light/Dark/System mode
- **Session Data**: Authentication state and user info

Settings are managed through the Settings page in the app after logging in.

## Tech Stack

- **Frontend**: React + React Router (RSC mode)
- **Styling**: Panda CSS
- **Backend**: Effect runtime system
- **Database**: Gel (graph-relational, EdgeDB-like)
- **Authentication**: GitHub OAuth
- **API**: Railway GraphQL API
- **Type Safety**: TypeScript + Graffle (GraphQL client)

## Development

See [DEVELOPMENT.md](./DEVELOPMENT.md) for development workflow, architecture details, and common tasks.

## License

MIT
