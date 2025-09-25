import { Op } from '#deps/effect.js'
import { Env } from '#lib/env'
import { Graffle } from './__generated__/_namespace'

const apiTokenEnvVars = ['MAGLEV_RAILWAY_API_TOKEN', 'RAILWAY_API_TOKEN'] as const

export const getApiToken = (): Op.Option<string> => {
  return Env.getFirst(...apiTokenEnvVars)
}

export type CreateInput = {
  apiToken?: string
}

export const create = (input?: CreateInput) => {
  const apiToken = input?.apiToken ?? Env.getFirstOrThrow(...apiTokenEnvVars)
  return Graffle.create().transport({
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  })
}

export type Client = ReturnType<typeof create>
