import { Ef, Op, pipe, Sc } from '#deps/effect'
import { FileSystem } from '@effect/platform'
import { Fs, FsLoc, Resource } from '@wollybeard/kit'
import path from 'node:path'
import { ConfigError, ConfigNotFoundError, ConfigParseError, ConfigValidationError } from './errors.js'
import { defaultParsers, type Parser } from './parsers.js'
import { searchConfig, searchInXdg, type SearchResult } from './search.js'

/**
 * Config loader options
 */
export interface ConfOptions<Input, Output> {
  /**
   * Config name (used for XDG directory)
   */
  name: string

  /**
   * Schema for validation
   */
  schema: Sc.Schema<Output, Input>

  /**
   * Files to search for config
   */
  searchPlaces?: string[]

  /**
   * Key in package.json to look for config
   */
  packageJsonKey?: string

  /**
   * XDG config file name
   */
  xdgFileName?: string

  /**
   * Default config values
   */
  defaults?: () => Output

  /**
   * Custom parsers for different file formats
   */
  parsers?: Record<string, Parser>

  /**
   * Normalize function to apply after parsing
   */
  normalize?: (input: Input) => Output

  /**
   * Whether to merge global and local configs
   */
  mergeGlobal?: boolean
}

/**
 * Config load options
 */
export interface LoadOptions {
  /**
   * Working directory
   */
  cwd?: string

  /**
   * Validate against schema
   */
  checkSchema?: boolean

  /**
   * Stop searching at this directory
   */
  stopAt?: string
}

/**
 * Config loader implementation
 */
export class Conf<Input = unknown, Output = Input> {
  private readonly options: Required<ConfOptions<Input, Output>>

  constructor(options: ConfOptions<Input, Output>) {
    this.options = {
      searchPlaces: [],
      packageJsonKey: undefined,
      xdgFileName: 'config.json',
      defaults: () => ({} as Output),
      parsers: defaultParsers,
      normalize: (input: Input) => input as unknown as Output,
      mergeGlobal: true,
      ...options,
    } as Required<ConfOptions<Input, Output>>
  }

  /**
   * Load config from all sources
   */
  load(
    options: LoadOptions = {},
  ): Ef.Effect<
    Output,
    ConfigError | ConfigNotFoundError | ConfigParseError | ConfigValidationError,
    FileSystem.FileSystem
  > {
    const {
      cwd = process.cwd(),
      checkSchema = true,
      stopAt,
    } = options

    return pipe(
      // Load global config if mergeGlobal is enabled
      this.options.mergeGlobal ? this.loadGlobal() : Ef.succeed(Op.none<Output>()),
      Ef.flatMap((globalConfig) =>
        pipe(
          // Search for local config
          searchConfig(
            this.options.name,
            this.options.searchPlaces,
            FsLoc.AbsDir.fromString(cwd as '/'),
            this.options.parsers,
            {
              ...(this.options.packageJsonKey !== undefined && { packageJsonKey: this.options.packageJsonKey }),
              ...(stopAt !== undefined && { stopAt }),
            },
          ),
          Ef.catchAll((error): Ef.Effect<SearchResult, ConfigError | ConfigParseError, FileSystem.FileSystem> => {
            // If no local config found, use global or defaults
            if (error instanceof ConfigNotFoundError) {
              if (Op.isSome(globalConfig)) {
                return Ef.succeed({
                  config: globalConfig.value,
                  path: 'global' as const,
                  source: 'xdg' as const,
                } as SearchResult)
              }
              // Use defaults if no config found
              return Ef.succeed({
                config: this.options.defaults(),
                path: 'defaults' as const,
                source: 'file' as const,
              } as SearchResult)
            }
            return Ef.fail(error)
          }),
          Ef.flatMap((result: SearchResult) =>
            this.processConfig(result.config, {
              checkSchema,
              globalConfig: Op.getOrNull(globalConfig),
            })
          ),
        )
      ),
    ) as Ef.Effect<
      Output,
      ConfigError | ConfigNotFoundError | ConfigParseError | ConfigValidationError,
      FileSystem.FileSystem
    >
  }

  /**
   * Load config from a specific path
   */
  loadFrom(
    path: string,
    options: LoadOptions = {},
  ): Ef.Effect<
    Output,
    ConfigError | ConfigParseError | ConfigValidationError,
    FileSystem.FileSystem
  > {
    const { checkSchema = true } = options

    const parser = this.options.parsers['.json'] ?? this.options.parsers['.jsonc']
    if (!parser) {
      return Ef.fail(
        new ConfigError({
          message: `No parser available for config file`,
          path,
        }),
      )
    }

    return pipe(
      Fs.readString(path as '/file.json'),
      Ef.mapError((error) =>
        new ConfigError({
          message: `Failed to read config file`,
          path,
          cause: error,
        })
      ),
      Ef.flatMap((content) => parser(content as string, path)),
      Ef.flatMap((config) =>
        this.processConfig(config, {
          checkSchema,
        })
      ),
    )
  }

  /**
   * Load global config from XDG directory
   */
  loadGlobal(): Ef.Effect<
    Op.Option<Output>,
    ConfigError | ConfigParseError | ConfigValidationError,
    FileSystem.FileSystem
  > {
    if (!this.options.xdgFileName) {
      return Ef.succeed(Op.none())
    }

    return pipe(
      searchInXdg(this.options.name, this.options.xdgFileName, this.options.parsers),
      Ef.flatMap((result) =>
        Op.isSome(result)
          ? pipe(
            this.processConfig(result.value.config, {
              checkSchema: true,
            }),
            Ef.map(Op.some),
          )
          : Ef.succeed(Op.none<Output>())
      ),
    )
  }

  /**
   * Write config to a file
   */
  write(config: Output, path: string): Ef.Effect<void, ConfigError | ConfigValidationError, FileSystem.FileSystem> {
    return pipe(
      // Encode the config
      Sc.encode(this.options.schema)(config),
      Ef.mapError((error) =>
        new ConfigValidationError({
          message: `Failed to encode config`,
          errors: error,
          path,
        })
      ),
      Ef.flatMap((encoded) =>
        pipe(
          Ef.try({
            try: () => JSON.stringify(encoded, null, 2),
            catch: (error) =>
              new ConfigError({
                message: `Failed to serialize config`,
                path,
                cause: error,
              }),
          }),
          Ef.flatMap((content) =>
            Ef.gen(function*() {
              const fs = yield* FileSystem.FileSystem
              const dir = path.substring(0, path.lastIndexOf('/'))

              // Create directory if it doesn't exist
              const dirExists = yield* fs.exists(dir).pipe(
                Ef.catchAll(() => Ef.succeed(false)),
              )

              if (!dirExists) {
                yield* fs.makeDirectory(dir, { recursive: true }).pipe(
                  Ef.mapError((error) =>
                    new ConfigError({
                      message: `Failed to create config directory`,
                      path: dir,
                      cause: error,
                    })
                  ),
                )
              }

              // Write the config file
              yield* Fs.writeString(path as '/file.json', content as string).pipe(
                Ef.mapError((error) =>
                  new ConfigError({
                    message: `Failed to write config file`,
                    path,
                    cause: error,
                  })
                ),
              )
            })
          ),
        )
      ),
    )
  }

  /**
   * Create a Resource for this config
   */
  asResource(fileName: string): Resource.Resource<Output, FileSystem.FileSystem> {
    return {
      read: (dirPath: FsLoc.AbsDir) =>
        pipe(
          this.load({ cwd: dirPath.toString() }),
          Ef.map(Op.some),
          Ef.catchAll(() => Ef.succeed(Op.none())),
        ) as Ef.Effect<Op.Option<Output>, Resource.WriteError, FileSystem.FileSystem>,
      write: (value: Output, dirPath: FsLoc.AbsDir) => {
        const filePath = path.join(dirPath.toString(), fileName)
        return pipe(
          this.write(value, filePath),
          Ef.mapError((_error) =>
            new Resource.WriteError({ message: 'Write failed', path: filePath, resource: 'config' })
          ),
        ) as Ef.Effect<void, Resource.WriteError, FileSystem.FileSystem>
      },
      readOrEmpty: (dirPath: FsLoc.AbsDir) =>
        pipe(
          this.load({ cwd: dirPath.toString() }),
          Ef.catchAll(() => Ef.succeed(this.options.defaults())),
        ) as Ef.Effect<Output, never, FileSystem.FileSystem>,
    }
  }

  /**
   * Process raw config through validation, migration, and normalization
   */
  private processConfig(
    rawConfig: unknown,
    options: {
      checkSchema?: boolean
      globalConfig?: Output | null
    },
  ): Ef.Effect<Output, ConfigError | ConfigValidationError, FileSystem.FileSystem> {
    return pipe(
      Ef.succeed(rawConfig),
      Ef.flatMap((config) => {
        // Validate against schema
        if (options.checkSchema) {
          return pipe(
            Sc.decodeUnknown(this.options.schema)(config),
            Ef.mapError((error) =>
              new ConfigValidationError({
                message: `Config validation failed`,
                errors: error,
              })
            ),
          ) as unknown as Ef.Effect<Input, ConfigValidationError, never>
        }
        return Ef.succeed(config as Input)
      }),
      Ef.map((validated) => {
        // Apply normalization
        const normalized = this.options.normalize(validated)

        // Merge with global config if provided
        if (options.globalConfig && this.options.mergeGlobal) {
          return { ...options.globalConfig, ...normalized }
        }

        return normalized
      }),
    )
  }
}

export const create = <Input = unknown, Output = Input>(
  options: ConfOptions<Input, Output>,
): Conf<Input, Output> => {
  return new Conf(options)
}
