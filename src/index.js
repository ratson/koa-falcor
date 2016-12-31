import compose from 'koa-compose'
import koaBodyParser from 'koa-bodyparser'
import FalcorRouter from 'falcor-router'

import dataSourceRoute from './dataSourceRoute'

export {dataSourceRoute}

export default (opts = {}) => {
  const {
    bodyParser,
    ctxProp = 'ctx',
    Router = FalcorRouter,
    routes,
  } = Array.isArray(opts) ? {routes: opts} : opts

  const CtxRouter = ctxProp ? (
    class ContextRouter extends Router.createClass(routes) {
      constructor(koaContext) {
        super()
        this[ctxProp] = koaContext
      }
    }
  ) : new Router(routes)

  return compose([
    bodyParser !== false && koaBodyParser(bodyParser),
    dataSourceRoute(ctx => ctxProp ? new CtxRouter(ctx) : CtxRouter),
  ].filter(Boolean))
}
