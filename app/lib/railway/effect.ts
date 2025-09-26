import { Ctx } from '#deps/effect'
import * as Railway from './create'

/**
 * Context tag for Railway GraphQL client
 */
export class Context extends Ctx.Tag('RailwayClient')<
  Context,
  Railway.Client
>() {}
