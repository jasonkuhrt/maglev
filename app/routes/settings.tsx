import { SettingsContent } from '#components/settings-content'
import { Config } from '#core/config'
import { Route } from '#core/route'
import { Ef, Op } from '#deps/effect'

export const action = Route.action(function*() {
  const formData = yield* Route.FormData
  const gelDsn = String(formData.get('gelDsn') || '')

  const service = yield* Config.ConfigService
  yield* service.write(Config.Config.make(gelDsn ? { gelDsn } : {}))

  return { success: true }
})

export const ServerComponent = Route.Server(function*() {
  const service = yield* Config.ConfigService
  const config = yield* service.read.pipe(Ef.option)

  const gelDsn = Op.match(config, {
    onNone: () => '',
    onSome: (c) => c.gelDsn || '',
  })

  return <SettingsContent gelDsn={gelDsn} />
})
