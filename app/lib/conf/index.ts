/**
 * Effect-first, Schema-first configuration loader
 *
 * Similar to cosmiconfig but built on Effect and Schema for type safety and composability.
 */

// Main loader
export { Conf, type ConfOptions, create, type LoadOptions } from './loader.js'

// Errors
export { ConfigError, ConfigNotFoundError, ConfigParseError, ConfigValidationError } from './errors.js'

// Parsers
export { defaultParsers, getParser, jsoncParser, jsonParser, type Parser } from './parsers.js'

// Search strategies
export { searchConfig, searchInFiles, searchInPackageJson, searchInXdg, type SearchResult } from './search.js'

// XDG utilities
export { getAppConfigDir, getAppConfigPath, getXdgCacheHome, getXdgConfigHome, getXdgDataHome } from './xdg.js'
