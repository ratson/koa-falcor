import compose from 'koa-compose'
import koaBodyParser from 'koa-bodyparser'
import FalcorRouter from 'falcor-router'

import dataSourceRoute from './dataSourceRoute'

export { dataSourceRoute }

function makeRouter(routes, ctxProp, Router) {
  class ContextRouter extends Router.createClass(routes) {
    constructor(koaContext) {
      super()
      this[ctxProp] = koaContext
    }
  }
  return ContextRouter
}

export default (opts = {}) => {
  const {
    bodyParser,
    ctxProp = 'ctx',
    Router = FalcorRouter,
    routes,
  } = Array.isArray(opts) ? { routes: opts } : opts

  const CtxRouter = ctxProp
    ? makeRouter(routes, ctxProp, Router)
    : new Router(routes)

  return compose(
    [
      bodyParser !== false && koaBodyParser(bodyParser),
      dataSourceRoute(ctx => (ctxProp ? new CtxRouter(ctx) : CtxRouter)),
    ].filter(Boolean),
  )
}
