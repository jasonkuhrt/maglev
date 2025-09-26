export type Template = {
  id: string
  name: string
  description: string
  shortDescription: string
  techStack: string[]
  category: 'frontend' | 'backend' | 'fullstack'
  githubRepo: string
  previewImage: string
  status: 'available' | 'coming-soon'
  order: number
}

export type Project = {
  id: string
  name: string
  template: Template
  status: 'running' | 'building' | 'crashed' | 'stopped'
  url: string
  createdAt: string
}

import { Settings as CoreSettings } from '#core/settings'

export type Settings = {
  railwayApiToken: string
  theme: CoreSettings.Theme
}

export const templates: Template[] = [
  {
    id: 'react-router-rsc',
    name: 'React Router with RSC',
    description:
      'Modern React application with Server Components, powered by React Router and Vite. Includes TypeScript, Tailwind CSS, and optimized for rapid prototyping.',
    shortDescription: 'Modern React with Server Components',
    techStack: ['react', 'typescript', 'vite', 'rsc'],
    category: 'frontend',
    githubRepo: 'https://github.com/remix-run/react-router-templates',
    previewImage: '/previews/react-router-rsc.png',
    status: 'available',
    order: 1,
  },
  {
    id: 'bun-elysia-htmx',
    name: 'Bun + Elysia + HTMX',
    description:
      'Blazing fast backend powered by Bun runtime with Elysia framework and HTMX for hypermedia-driven interactivity.',
    shortDescription: 'Modern backend with HTMX for hypermedia',
    techStack: ['bun', 'elysia', 'htmx', 'typescript'],
    category: 'fullstack',
    githubRepo: 'https://github.com/elysiajs/elysia',
    previewImage: '/previews/bun-elysia.png',
    status: 'coming-soon',
    order: 2,
  },
  {
    id: 'deno-fresh-preact',
    name: 'Deno + Fresh + Preact',
    description:
      'Island architecture with Deno runtime, Fresh framework, and Preact for zero-JS by default performance.',
    shortDescription: 'Island architecture with Deno runtime',
    techStack: ['deno', 'fresh', 'preact', 'typescript'],
    category: 'frontend',
    githubRepo: 'https://github.com/denoland/fresh',
    previewImage: '/previews/deno-fresh.png',
    status: 'coming-soon',
    order: 3,
  },
  {
    id: 'effect-fastify-graphql',
    name: 'Effect + Fastify + GraphQL',
    description: 'Type-safe functional programming with Effect-TS, high-performance Fastify server, and GraphQL API.',
    shortDescription: 'Type-safe functional API with Effect-TS',
    techStack: ['effect', 'fastify', 'graphql', 'typescript'],
    category: 'backend',
    githubRepo: 'https://github.com/Effect-TS/effect',
    previewImage: '/previews/effect-fastify.png',
    status: 'coming-soon',
    order: 4,
  },
]

export const projects: Project[] = [
  {
    id: '1',
    name: 'bold-river-42',
    template: templates[0]!,
    status: 'running',
    url: 'https://bold-river-42.up.railway.app',
    createdAt: '2025-09-20T10:30:00Z',
  },
  {
    id: '2',
    name: 'crimson-mountain-87',
    template: templates[0]!,
    status: 'running',
    url: 'https://crimson-mountain-87.up.railway.app',
    createdAt: '2025-09-18T14:15:00Z',
  },
]

export const settings: Settings = {
  railwayApiToken: '',
  theme: CoreSettings.Theme.system,
}
