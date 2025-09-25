import { Da, Op } from '#deps/effect.js'

export class NotFound extends Da.TaggedError('EnvNotFound')<{
  names: string[]
}> {
  override get message() {
    return `Environment variable not found. Tried: ${this.names.join(', ')}`
  }
}

export const get = (name: string): Op.Option<string> => {
  return Op.fromNullable(process.env[name])
}

export const getOrThrow = (name: string): string => {
  return Op.getOrThrowWith(get(name), () => new NotFound({ names: [name] }))
}

export const getFirst = (...names: string[]): Op.Option<string> => {
  for (const name of names) {
    const value = get(name)
    if (Op.isSome(value)) return value
  }
  return Op.none()
}

export const getFirstOrThrow = (...names: string[]): string => {
  return Op.getOrThrowWith(getFirst(...names), () => new NotFound({ names }))
}