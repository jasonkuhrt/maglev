import { Ef } from '#deps/effect'
import { FsLoc } from '@wollybeard/kit'
import { ConfigParseError } from './errors.js'

/**
 * Parser function type
 */
export type Parser = (
  content: string,
  path: FsLoc.Groups.File.File | string,
) => Ef.Effect<unknown, ConfigParseError, never>

/**
 * JSON parser
 */
export const jsonParser: Parser = (content: string, path: FsLoc.Groups.File.File | string) =>
  Ef.try({
    try: () => JSON.parse(content),
    catch: (error) =>
      new ConfigParseError({
        message: `Failed to parse JSON`,
        path,
        format: 'json',
        cause: error,
      }),
  })

/**
 * JSONC (JSON with Comments) parser
 */
export const jsoncParser: Parser = (content: string, path: FsLoc.Groups.File.File | string) =>
  Ef.try({
    try: () => JSON.parse(content.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')),
    catch: (error) =>
      new ConfigParseError({
        message: `Failed to parse JSONC`,
        path,
        format: 'jsonc',
        cause: error,
      }),
  })

/**
 * Default parsers by file extension
 */
export const defaultParsers: Record<string, Parser> = {
  '.json': jsonParser,
  '.jsonc': jsoncParser,
}

/**
 * Get parser for a file path
 */
export const getParser = (path: FsLoc.Groups.File.File | string, parsers = defaultParsers): Parser | undefined => {
  const pathStr = typeof path === 'string' ? path : path.toString()
  const ext = pathStr.substring(pathStr.lastIndexOf('.'))
  return parsers[ext]
}
