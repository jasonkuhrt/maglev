import { Env } from '#lib/env'
import { Graffle } from './__generated__/_namespace'

export const apiTokenEnvVars = ['MAGLEV_RAILWAY_API_TOKEN', 'RAILWAY_API_TOKEN'] as const

export type Params = {
  apiToken?: string
}

export const create = (params?: Params) => {
  const apiToken = params?.apiToken ?? Env.getFirstOrThrow(...apiTokenEnvVars)
  return Graffle.create()
    .transport({
      url: 'https://backboard.railway.app/graphql/v2',
    })
    .transport({
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    })
}

export type Client = ReturnType<typeof create>
