#!/bin/bash

# Generate Gel client for CI/CD environments
# Skip if database connection is not available

echo "Checking for Gel database connection..."

# Check if GEL_SERVER_BACKEND_DSN or DATABASE_URL is set
if [ -n "$GEL_SERVER_BACKEND_DSN" ] || [ -n "$DATABASE_URL" ]; then
    echo "Database connection found, generating Gel client..."
    pnpm run gen:gel
else
    echo "No database connection available, creating stub Gel client..."
    # Create a minimal stub client to allow build to proceed
    mkdir -p ./node_modules/@gel/client
    echo '{"name":"@gel/client","type":"module","exports":{".":{"types":"./index.d.ts","import":"./index.mjs"}}}' > ./node_modules/@gel/client/package.json
    echo 'export const createClient = () => { throw new Error("Gel client not generated - database connection required") }' > ./node_modules/@gel/client/index.mjs
    echo 'export const createHttpClient = () => { throw new Error("Gel client not generated - database connection required") }' >> ./node_modules/@gel/client/index.mjs
    echo 'export declare function createClient(): any;' > ./node_modules/@gel/client/index.d.ts
    echo 'export declare function createHttpClient(): any;' >> ./node_modules/@gel/client/index.d.ts
fi