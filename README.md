# Maglev

Browse curated templates → Click "Launch" → Get live Railway deployment in seconds.

## Getting Started

### Prerequisites

- **Railway Account** - Sign up at [railway.app](https://railway.app)
- **Railway API Token** - See setup instructions below

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

## Development

See [DEVELOPMENT.md](./DEVELOPMENT.md) for development workflow, architecture details, and common tasks.
