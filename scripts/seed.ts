#!/usr/bin/env tsx

import { Ef } from 'effect'
import { createClient } from 'gel'

/**
 * Seed script for Gel database
 * Run with: tsx scripts/seed.ts
 *
 * Prerequisites:
 * 1. Gel CLI installed: curl --proto '=https' --tlsv1.2 -sSf https://sh.geldata.com | sh
 * 2. Gel project initialized: gel project init
 * 3. Migrations created: gel migration create
 * 4. Migrations applied: gel migrate
 */

const seedDatabase = Ef.gen(function*() {
  console.log('🌱 Starting database seed...')

  // Create client (will use project-linked instance)
  const client = createClient()

  // Test connection
  yield* Ef.tryPromise({
    try: async () => {
      await client.ensureConnected()
      console.log('✅ Connected to Gel')
    },
    catch: (error) => new Error(`Failed to connect to Gel: ${error}`),
  })

  // Seed templates
  const templates = [
    {
      name: 'React Router RSC',
      description:
        'A full-stack React application using React Router with Server Components. Features type-safe routing, server-side rendering, and modern React patterns.',
      shortDescription: 'Modern React with Server Components',
      techStack: ['React', 'TypeScript', 'Vite', 'React Router'],
      category: 'fullstack',
      githubRepo: 'https://github.com/remix-run/react-router-templates/tree/main/templates/rsc',
      status: 'available',
      order: 1,
    },
    {
      name: 'Next.js App Router',
      description:
        'Production-ready Next.js application using the App Router. Includes TypeScript, Tailwind CSS, and best practices.',
      shortDescription: 'Next.js with App Router',
      techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
      category: 'fullstack',
      githubRepo: 'https://github.com/vercel/next.js/tree/canary/examples/app-router',
      status: 'coming-soon',
      order: 2,
    },
    {
      name: 'Express API',
      description:
        'RESTful API built with Express.js. Features authentication, validation, and PostgreSQL integration.',
      shortDescription: 'Node.js REST API',
      techStack: ['Node.js', 'Express', 'TypeScript', 'PostgreSQL'],
      category: 'backend',
      githubRepo: 'https://github.com/expressjs/express/tree/master/examples',
      status: 'coming-soon',
      order: 3,
    },
    {
      name: 'FastAPI Python',
      description: 'High-performance Python API with automatic documentation. Includes async support and type hints.',
      shortDescription: 'Modern Python API',
      techStack: ['Python', 'FastAPI', 'SQLAlchemy', 'PostgreSQL'],
      category: 'backend',
      githubRepo: 'https://github.com/tiangolo/fastapi/tree/master/examples',
      status: 'coming-soon',
      order: 4,
    },
    {
      name: 'SvelteKit',
      description:
        'Full-stack Svelte application with server-side rendering. Fast, lightweight, and developer-friendly.',
      shortDescription: 'Svelte full-stack app',
      techStack: ['Svelte', 'SvelteKit', 'TypeScript', 'Vite'],
      category: 'fullstack',
      githubRepo: 'https://github.com/sveltejs/kit/tree/master/examples',
      status: 'coming-soon',
      order: 5,
    },
    {
      name: 'Vue 3 + Vite',
      description: 'Modern Vue 3 application with Composition API. Includes Pinia for state management and Vue Router.',
      shortDescription: 'Vue 3 with Composition API',
      techStack: ['Vue', 'TypeScript', 'Vite', 'Pinia'],
      category: 'frontend',
      githubRepo: 'https://github.com/vuejs/create-vue/tree/main/template',
      status: 'coming-soon',
      order: 6,
    },
  ]

  // Insert templates
  yield* Ef.tryPromise({
    try: async () => {
      console.log(`📝 Seeding ${templates.length} templates...`)

      // Note: This is raw GelQL since we don't have the query builder generated yet
      // Once `npx @gel/generate gel-js` is run, replace with:
      // await e.insert(e.Template, templates).run(client)

      for (const template of templates) {
        const query = `
          INSERT Template {
            name := <str>$name,
            description := <str>$description,
            shortDescription := <str>$shortDescription,
            techStack := <array<str>>$techStack,
            category := <str>$category,
            githubRepo := <str>$githubRepo,
            status := <str>$status,
            order := <int32>$order
          }
        `
        await client.execute(query, template)
        console.log(`  ✅ Created template: ${template.name}`)
      }

      console.log('✨ Database seeded successfully!')
    },
    catch: (error) => new Error(`Failed to seed database: ${error}`),
  })

  // Close connection
  yield* Ef.tryPromise({
    try: async () => {
      await client.close()
      console.log('👋 Connection closed')
    },
    catch: (error) => new Error(`Failed to close connection: ${error}`),
  })
})

// Framework boundary: CLI script requires async
await Ef.runPromise(seedDatabase).catch((error) => {
  console.error('❌ Seed failed:', error)
  process.exit(1)
})
