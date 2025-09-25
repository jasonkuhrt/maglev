import { Ctx, Ef, Lr } from '#deps/effect'
import { Conf } from '#lib/conf'
import { FileSystem } from '@effect/platform'
import { Config } from './schema'

export class ConfigService extends Ctx.Tag('ConfigService')<
  ConfigService,
  {
    readonly read: Ef.Effect<
      Config,
      | Conf.ConfigError
      | Conf.ConfigNotFoundError
      | Conf.ConfigParseError
      | Conf.ConfigValidationError,
      FileSystem.FileSystem
    >
    readonly write: (
      config: Config,
    ) => Ef.Effect<void, Conf.ConfigError | Conf.ConfigValidationError, FileSystem.FileSystem>
  }
>() {}

const loader = Conf.create({
  name: 'maglev',
  schema: Config,
  xdgFileName: 'config.json',
})

export const ConfigServiceLive = Lr.succeed(
  ConfigService,
  {
    read: loader.load(),
    write: (config: Config) => {
      const path = Conf.getAppConfigPath('maglev', 'config.json')
      return loader.write(config, path)
    },
  },
)
