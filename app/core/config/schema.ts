import { Sc } from '#deps/effect'

export class Config extends Sc.Class<Config>('Config')({
  gelDsn: Sc.optional(Sc.String),
}) {}
