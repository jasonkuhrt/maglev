export type SerializedTemplateConfig = {
  services: Record<string, TemplateService>
}

export type TemplateService = {
  name: string
  icon?: string | null
  source: TemplateServiceSource
  variables?: Record<string, TemplateVariable>
  deploy?: TemplateServiceDeploy | null
  build?: TemplateServiceBuild | null
  networking?: TemplateServiceNetworking | null
  volumeMounts?: Record<string, TemplateVolumeMount>
}

export type TemplateServiceSource =
  | { repo: string; branch?: string | null; rootDirectory?: string | null }
  | { image: string }

export type TemplateVariable = {
  defaultValue: string
  description?: string
  isOptional?: boolean
}

export type TemplateServiceDeploy = {
  startCommand?: string | null
  healthcheckPath?: string | null
}

export type TemplateServiceBuild = Record<string, unknown>

export type TemplateServiceNetworking = {
  serviceDomains?: Record<string, Record<string, unknown>>
  tcpProxies?: Record<string, Record<string, unknown>>
}

export type TemplateVolumeMount = {
  mountPath: string
}

export const extractGitHubRepos = (config: SerializedTemplateConfig): string[] => {
  return Object.values(config.services)
    .map((service) => {
      if ('repo' in service.source) {
        return service.source.repo
      }
      return null
    })
    .filter((repo): repo is string => repo !== null)
}

export const isGitHubSource = (
  source: TemplateServiceSource,
): source is { repo: string; branch?: string | null; rootDirectory?: string | null } => {
  return 'repo' in source
}

export const isDockerSource = (source: TemplateServiceSource): source is { image: string } => {
  return 'image' in source
}
