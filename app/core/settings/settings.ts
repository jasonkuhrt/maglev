import { Gel } from '#core/gel'
import { Ctx, Da, Ef, Lr } from '#deps/effect'

export class SettingsError extends Da.TaggedError('SettingsError')<{
  readonly message: string
}> {}

export type Theme = typeof Gel.$.Theme.__tstype__

export const Theme = {
  [Gel.$.Theme.__values__[0]]: Gel.$.Theme.__values__[0],
  [Gel.$.Theme.__values__[1]]: Gel.$.Theme.__values__[1],
  [Gel.$.Theme.__values__[2]]: Gel.$.Theme.__values__[2],
}

export interface Settings {
  railwayApiToken: string | null
  gelDsn: string | null
  theme: Theme | null
}

export class Service extends Ctx.Tag('SettingsService')<
  Service,
  {
    readonly read: Ef.Effect<Settings, SettingsError>
    readonly write: (settings: Settings) => Ef.Effect<void, SettingsError>
  }
>() {}

const defaultSettings: Settings = {
  railwayApiToken: null,
  gelDsn: null,
  theme: Theme.system,
}

/**
 * Check if API key is configured in settings
 */
export const hasApiKey = Ef.gen(function*() {
  const settingsService = yield* Service
  const settings = yield* settingsService.read
  return settings.railwayApiToken !== null && settings.railwayApiToken !== ''
})

export const ServiceLive = Lr.effect(
  Service,
  Ef.gen(function*() {
    const gel = yield* Gel.Client
    const client = gel.client

    const read = Ef.tryPromise({
      try: async () => {
        const results = await Gel.$
          .select(Gel.$.Settings, () => ({
            railwayApiToken: true,
            gelDsn: true,
            theme: true,
          }))
          .run(client)

        const result = results[0]

        if (!result) {
          return defaultSettings
        }

        return result
      },
      catch: (error) => new SettingsError({ message: `Failed to read settings: ${error}` }),
    })

    const write = (settings: Settings) =>
      Ef.tryPromise({
        try: async () => {
          // Try to update first (most common case)
          const updateResult = await Gel.$
            .update(Gel.$.Settings, () => ({
              set: {
                railwayApiToken: settings.railwayApiToken,
                gelDsn: settings.gelDsn,
                theme: settings.theme,
                updatedAt: new Date(),
              },
            }))
            .run(client)

          // If no records were updated, create the first one
          if (updateResult.length === 0) {
            await Gel.$
              .insert(Gel.$.Settings, {
                railwayApiToken: settings.railwayApiToken,
                gelDsn: settings.gelDsn,
                theme: settings.theme,
              })
              .run(client)
          }
        },
        catch: (error) => new SettingsError({ message: `Failed to write settings: ${error}` }),
      })

    return { read, write }
  }),
).pipe(Lr.provideMerge(Gel.ClientLive))
