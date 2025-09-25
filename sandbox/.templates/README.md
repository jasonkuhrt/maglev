# Sandbox Templates

Template files for the `sandbox/` directory.

## Usage

Initialize sandbox from templates:

```bash
pnpm sandbox:init
```

This will:

1. Remove all `.ts` files from `sandbox/`
2. Copy fresh `.ts` templates from `sandbox/.template/` into `sandbox/`

**Note:** The `.template/` directory itself is preserved and tracked in git.
