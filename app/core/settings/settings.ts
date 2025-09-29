import { Gel } from '#core/gel'
import { Ctx, Da, Ef, Lr } from '#deps/effect'

export class SettingsError extends Da.TaggedError('SettingsError')<{
  readonly message: string
  readonly cause?: unknown
}> {}

export type Theme = typeof Gel.$.Theme.__tstype__

export const Theme = {
  [Gel.$.Theme.__values__[0]]: Gel.$.Theme.__values__[0],
  [Gel.$.Theme.__values__[1]]: Gel.$.Theme.__values__[1],
  [Gel.$.Theme.__values__[2]]: Gel.$.Theme.__values__[2],
}

export interface Settings {
  railwayApiToken: string | null
  theme: Theme | null
}

export class Service extends Ctx.Tag('SettingsService')<
  Service,
  {
    readonly read: (userId: string) => Ef.Effect<Settings, SettingsError>
    readonly write: (userId: string, settings: Settings) => Ef.Effect<void, SettingsError>
  }
>() {}

const defaultSettings: Settings = {
  railwayApiToken: null,
  theme: Theme.system,
}

/**
 * Check if API key is configured in settings for a user
 */
export const hasApiKey = (userId: string) =>
  Ef.gen(function*() {
    const settingsService = yield* Service
    const settings = yield* settingsService.read(userId)
    return settings.railwayApiToken !== null && settings.railwayApiToken !== ''
  })

export const ServiceLive = Lr.effect(
  Service,
  Ef.gen(function*() {
    const gel = yield* Gel.Client
    const client = gel.client

    const read = (userId: string) =>
      Ef.tryPromise({
        try: async () => {
          const user = await Gel.$
            .select(Gel.$.User, (u) => ({
              filter_single: Gel.$.op(u.githubId, '=', userId),
              settings: {
                railwayApiToken: true,
                theme: true,
              },
            }))
            .run(client)

          if (!user?.settings) {
            return defaultSettings
          }

          return user.settings
        },
        catch: (cause) => new SettingsError({ message: 'Failed to read settings', cause }),
      })

    const write = (userId: string, settings: Settings) =>
      Ef.tryPromise({
        try: async () => {
          // First, ensure the user exists
          const user = await Gel.$
            .select(Gel.$.User, (u) => ({
              filter_single: Gel.$.op(u.githubId, '=', userId),
              id: true,
            }))
            .run(client)

          if (!user) {
            throw new Error(`User with githubId ${userId} not found`)
          }

          // Try to update existing settings
          const updateResult = await Gel.$
            .update(Gel.$.Settings, (s) => ({
              filter_single: Gel.$.op(s.user.githubId, '=', userId),
              set: {
                railwayApiToken: settings.railwayApiToken,
                theme: settings.theme,
                updatedAt: new Date(),
              },
            }))
            .run(client)

          // If no settings exist for this user, create them
          if (!updateResult) {
            await Gel.$
              .insert(Gel.$.Settings, {
                user: Gel.$.select(Gel.$.User, (u) => ({
                  filter_single: Gel.$.op(u.githubId, '=', userId),
                })),
                railwayApiToken: settings.railwayApiToken,
                theme: settings.theme,
              })
              .run(client)
          }
        },
        catch: (cause) => {
          console.error('Settings write failed:', cause)
          return new SettingsError({ message: 'Failed to write settings', cause })
        },
      })

    return { read, write }
  }),
).pipe(Lr.provideMerge(Gel.ClientLive))
