import { homedir } from 'node:os'
import path from 'node:path'

/**
 * Get XDG config directory path following XDG Base Directory specification
 * Falls back to ~/.config if XDG_CONFIG_HOME is not set
 */
export const getXdgConfigHome = (): string => {
  return process.env['XDG_CONFIG_HOME'] || path.join(homedir(), '.config')
}

/**
 * Get XDG data directory path following XDG Base Directory specification
 * Falls back to ~/.local/share if XDG_DATA_HOME is not set
 */
export const getXdgDataHome = (): string => {
  return process.env['XDG_DATA_HOME'] || path.join(homedir(), '.local', 'share')
}

/**
 * Get XDG cache directory path following XDG Base Directory specification
 * Falls back to ~/.cache if XDG_CACHE_HOME is not set
 */
export const getXdgCacheHome = (): string => {
  return process.env['XDG_CACHE_HOME'] || path.join(homedir(), '.cache')
}

/**
 * Get config directory for a specific application
 */
export const getAppConfigDir = (appName: string): string => {
  return path.join(getXdgConfigHome(), appName)
}

/**
 * Get config file path for a specific application
 */
export const getAppConfigPath = (appName: string, fileName = 'config.json'): string => {
  return path.join(getAppConfigDir(appName), fileName)
}
