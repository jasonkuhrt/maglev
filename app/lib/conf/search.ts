import { Ef, Op, pipe } from '#deps/effect'
import { FileSystem } from '@effect/platform'
import { Fs, FsLoc } from '@wollybeard/kit'
import path from 'node:path'
import { ConfigError, ConfigNotFoundError, ConfigParseError } from './errors.js'
import { getParser, type Parser } from './parsers.js'
import { getAppConfigPath } from './xdg.js'

/**
 * Search result with config data and source information
 */
export interface SearchResult {
  config: unknown
  path: FsLoc.AbsFile | 'defaults' | 'global'
  source: 'file' | 'package.json' | 'xdg'
}

/**
 * Search for config in package.json
 */
export const searchInPackageJson = (
  key: string,
  cwd: FsLoc.AbsDir,
  parser: Parser,
): Ef.Effect<Op.Option<SearchResult>, ConfigError | ConfigParseError, FileSystem.FileSystem> => {
  const packageJsonPath = path.join(cwd.toString(), 'package.json') as '/package.json'

  return pipe(
    Fs.exists(packageJsonPath),
    Ef.mapError((error) =>
      new ConfigError({
        message: `Failed to check package.json existence`,
        path: packageJsonPath,
        cause: error,
      })
    ),
    Ef.flatMap((exists) => {
      if (!exists) return Ef.succeed(Op.none())

      return pipe(
        Fs.readString(packageJsonPath),
        Ef.mapError((error) =>
          new ConfigError({
            message: `Failed to read package.json`,
            path: packageJsonPath,
            cause: error,
          })
        ),
        Ef.flatMap((content) => parser(content as string, packageJsonPath)),
        Ef.map((parsed) => {
          if (typeof parsed === 'object' && parsed !== null && key in parsed) {
            const config = (parsed as Record<string, unknown>)[key]
            return Op.some({
              config,
              path: FsLoc.AbsFile.fromString(packageJsonPath),
              source: 'package.json' as const,
            })
          }
          return Op.none()
        }),
      )
    }),
  )
}

/**
 * Search for config files in a directory
 */
export const searchInFiles = (
  searchPlaces: string[],
  cwd: FsLoc.AbsDir,
  parsers: Record<string, Parser>,
): Ef.Effect<Op.Option<SearchResult>, ConfigError | ConfigParseError, FileSystem.FileSystem> => {
  const tryFile = (
    fileName: string,
  ): Ef.Effect<Op.Option<SearchResult>, ConfigError | ConfigParseError, FileSystem.FileSystem> => {
    const filePath = path.join(cwd.toString(), fileName) as '/file.txt'
    const parser = getParser(fileName, parsers)

    if (!parser) {
      return Ef.succeed(Op.none())
    }

    return pipe(
      Fs.exists(filePath),
      Ef.mapError((error) =>
        new ConfigError({
          message: `Failed to check file existence`,
          path: filePath,
          cause: error,
        })
      ),
      Ef.flatMap((exists) => {
        if (!exists) return Ef.succeed(Op.none())

        return pipe(
          Fs.readString(filePath),
          Ef.mapError((error) =>
            new ConfigError({
              message: `Failed to read config file`,
              path: filePath,
              cause: error,
            })
          ),
          Ef.flatMap((content) => parser(content as string, filePath)),
          Ef.map((config) =>
            Op.some({
              config,
              path: FsLoc.AbsFile.fromString(filePath),
              source: 'file' as const,
            })
          ),
        )
      }),
    )
  }

  // Try files in order until one is found
  return searchPlaces.reduce(
    (acc, fileName) =>
      pipe(
        acc,
        Ef.flatMap((result) =>
          Op.isSome(result) ? Ef.succeed(result as Op.Option<SearchResult>) : tryFile(fileName)
        ),
      ),
    Ef.succeed(Op.none()) as Ef.Effect<Op.Option<SearchResult>, ConfigError | ConfigParseError, FileSystem.FileSystem>,
  )
}

/**
 * Search for config in XDG config directory
 */
export const searchInXdg = (
  appName: string,
  fileName: string,
  parsers: Record<string, Parser>,
): Ef.Effect<Op.Option<SearchResult>, ConfigError | ConfigParseError, FileSystem.FileSystem> => {
  const configPath = getAppConfigPath(appName, fileName)
  const parser = getParser(fileName, parsers)

  if (!parser) {
    return Ef.succeed(Op.none())
  }

  return pipe(
    Fs.exists(configPath as '/.config'),
    Ef.mapError((error) =>
      new ConfigError({
        message: `Failed to check XDG config existence`,
        path: configPath,
        cause: error,
      })
    ),
    Ef.flatMap((exists) => {
      if (!exists) return Ef.succeed(Op.none())

      return pipe(
        Fs.readString(configPath as '/config.json'),
        Ef.mapError((error) =>
          new ConfigError({
            message: `Failed to read XDG config`,
            path: configPath,
            cause: error,
          })
        ),
        Ef.flatMap((content) => parser(content as string, configPath)),
        Ef.map((config) =>
          Op.some({
            config,
            path: FsLoc.AbsFile.fromString(configPath as '/config.json'),
            source: 'xdg' as const,
          })
        ),
      )
    }),
  )
}

/**
 * Search for config in all locations
 */
export const searchConfig = (
  name: string,
  searchPlaces: string[],
  cwd: FsLoc.AbsDir,
  parsers: Record<string, Parser>,
  options: {
    packageJsonKey?: string
    xdgFileName?: string
    stopAt?: string
  } = {},
): Ef.Effect<SearchResult, ConfigNotFoundError | ConfigError | ConfigParseError, FileSystem.FileSystem> => {
  const searches: Ef.Effect<Op.Option<SearchResult>, ConfigError | ConfigParseError, FileSystem.FileSystem>[] = []

  // Search in package.json if key is provided
  if (options.packageJsonKey && parsers['.json']) {
    searches.push(searchInPackageJson(options.packageJsonKey, cwd, parsers['.json']))
  }

  // Search in files
  searches.push(searchInFiles(searchPlaces, cwd, parsers))

  // Search in XDG if filename is provided
  if (options.xdgFileName) {
    searches.push(searchInXdg(name, options.xdgFileName, parsers))
  }

  // Try each search in order
  return searches.reduce(
    (acc, search) =>
      pipe(
        acc,
        Ef.catchAll(() =>
          pipe(
            search,
            Ef.flatMap((result) =>
              Op.isSome(result)
                ? Ef.succeed(result.value)
                : Ef.fail(
                  new ConfigNotFoundError({
                    message: `No config found`,
                    searchPlaces,
                  }),
                )
            ),
          )
        ),
      ),
    Ef.fail(
      new ConfigNotFoundError({
        message: `No config found in any location`,
        searchPlaces,
      }),
    ) as Ef.Effect<SearchResult, ConfigNotFoundError | ConfigError | ConfigParseError, FileSystem.FileSystem>,
  )
}
