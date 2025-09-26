# Maglev

Browse curated templates → Click "Launch" → Get live Railway deployment in seconds.

## Getting Started

### Prerequisites

- **Railway Account** - Sign up at [railway.app](https://railway.app)
- **Railway API Token** - See setup instructions below
- **Gel (EdgeDB)** - Database for storing projects and templates (see Gel setup below)

### Setup Railway API Token

1. **Generate a token:**
   - Go to [Railway Account Settings → Tokens](https://railway.app/account/tokens)
   - Click "Create Token"
   - Give it a name (e.g., "Maglev Development")
   - Copy the token value

2. **Add to your shell config:**

   **For Fish shell:**
   ```fish
   # Add to ~/.config/fish/config.secrets.fish (or config.fish)
   export MAGLEV_RAILWAY_API_TOKEN='your_token_here'

   # Reload config
   source ~/.config/fish/config.fish
   ```

   **For Bash/Zsh:**
   ```bash
   # Add to ~/.bashrc or ~/.zshrc
   export MAGLEV_RAILWAY_API_TOKEN='your_token_here'

   # Reload config
   source ~/.bashrc  # or source ~/.zshrc
   ```

   **Note:** The app checks `MAGLEV_RAILWAY_API_TOKEN` first, falling back to `RAILWAY_API_TOKEN` if not set.

### Setup Gel

Gel (EdgeDB) is a modern graph-relational database used by Maglev to store projects and templates.

1. **Install Gel CLI:**
   ```bash
   # macOS/Linux
   curl --proto '=https' --tlsv1.2 -sSf https://sh.edgedb.com | sh

   # Or via Homebrew
   brew install edgedb/tap/edgedb-cli
   ```

   **Note:** The EdgeDB CLI is aliased as `gel` on most systems.

2. **Initialize the project database:**
   ```bash
   # This will create a local Gel instance for the project
   gel project init

   # The project is already configured with edgedb.toml
   # This will create an instance named after your project
   ```

3. **Run migrations:**
   ```bash
   # Apply the database schema
   gel migrate
   ```

4. **Generate TypeScript client (optional):**
   ```bash
   # If you modify the schema, regenerate the TypeScript client
   pnpm gen:gel
   ```

**Resources:**

- [Gel (EdgeDB) Documentation](https://www.edgedb.com/docs)
- [Gel + Effect Guide](https://www.edgedb.com/blog/building-with-effect-and-edgedb-part-1)

### Install and Run

```bash
# Install dependencies
pnpm install

# Generate all code (routes + Railway client)
pnpm gen

# Start dev server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) and configure your Railway API token in Settings.

## Configuration

The app stores user configuration in a local config file following the XDG Base Directory specification:

- **Location**: `~/.config/maglev/config.json`
- **Contents**: User-specific settings like Gel connection strings (Gel DSN)
- **Created**: Automatically when you save settings for the first time

Example config file:

```json
{
  "gelDsn": "edgedb://..."
}
```

This keeps sensitive configuration like database credentials separate from your code and secure in your home directory.

## Development

See [DEVELOPMENT.md](./DEVELOPMENT.md) for development workflow, architecture details, and common tasks.
