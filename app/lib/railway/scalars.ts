import type { Json } from '@wollybeard/kit'
import { Graffle } from 'graffle'
import type { GraphQLScalarType } from 'graphql'
import { GraphQLBigInt, GraphQLDateTime, GraphQLJSON } from 'graphql-scalars'
import type {
  SerializedTemplateConfig as SerializedTemplateConfigType,
  TemplateVolumeMount,
} from './scalars/SerializedTemplateConfig'

// [1] Graffle thinks scalars have to be strings, but this assumption is wrong.

/**
 * Adapter to convert GraphQL scalar types to Graffle codecs
 */
const fromGraphQLScalar = <TInternal = unknown, TExternal = TInternal>(
  name: string,
  scalarType: GraphQLScalarType<TInternal, TExternal>,
) =>
  Graffle.Scalars.create(name, {
    decode: (value: unknown) => scalarType.parseValue(value) as TInternal,
    encode: (value: TInternal) => scalarType.serialize(value) as any, // [1]
  })

/**
 * Generic passthrough helper for JSON scalars
 */
const jsonPassthrough = <$Encoded = Json.Object>(name: string) =>
  Graffle.Scalars.create(name, {
    decode: (value: $Encoded) => value,
    encode: (value: $Encoded) => value as any, // [1]
  })

export const BigInt = fromGraphQLScalar('BigInt', GraphQLBigInt)
export const DateTime = fromGraphQLScalar('DateTime', GraphQLDateTime)
export const JSON = fromGraphQLScalar('JSON', GraphQLJSON)
export const SerializedTemplateConfig = jsonPassthrough<SerializedTemplateConfigType>('SerializedTemplateConfig')
export const CanvasConfig = jsonPassthrough('CanvasConfig')
export const DeploymentMeta = jsonPassthrough('DeploymentMeta')
export const DisplayConfig = jsonPassthrough('DisplayConfig')
export const EnvironmentConfig = jsonPassthrough('EnvironmentConfig')
export const EnvironmentVariables = jsonPassthrough('EnvironmentVariables')
export const RailpackInfo = jsonPassthrough('RailpackInfo')
export const ServiceInstanceLimit = jsonPassthrough<number>('ServiceInstanceLimit')
export const SubscriptionPlanLimit = jsonPassthrough('SubscriptionPlanLimit')
export const TemplateConfig = jsonPassthrough('TemplateConfig')
export const TemplateMetadata = jsonPassthrough('TemplateMetadata')
export const TemplateServiceConfig = jsonPassthrough('TemplateServiceConfig')
export const TemplateVolume = jsonPassthrough<TemplateVolumeMount>('TemplateVolume')
export const Upload = jsonPassthrough<File | Blob>('Upload')
