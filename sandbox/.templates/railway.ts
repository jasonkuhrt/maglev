/**
 * Railway API Sandbox
 *
 * This sandbox provides a typed Railway GraphQL client for testing and exploration.
 *
 * Setup:
 * - API token is automatically read from MAGLEV_RAILWAY_API_TOKEN or RAILWAY_API_TOKEN
 * - Or pass explicitly: Railway.create({ apiToken: '...' })
 *
 * Example Queries:
 * - railway.query.me()
 * - railway.query.projects()
 * - railway.query.project({ id: '...' })
 *
 * Docs:
 * - Railway API: https://docs.railway.com/reference/public-api
 * - Graffle (client): https://graffle.js.org
 */

import { Railway } from '#lib/railway'

const railway = Railway.create()

// --------------- YOUR CODE BELOW ----------------

railway
