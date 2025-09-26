import { MarketContent } from '#components/market-content'
import { Route } from '#core/route'
import { Ef, Ei } from '#deps/effect'
import { fetchTemplates } from './_market/operations'

export const ServerComponent = Route.Server(function* () {
  const result = yield* fetchTemplates.pipe(Ef.either)

  if (Ei.isLeft(result)) {
    const errorMessage = result.left instanceof Error ? result.left.message : String(result.left)
    return <MarketContent templates={[]} error={errorMessage} />
  }

  return <MarketContent templates={result.right} error={null} />
})
