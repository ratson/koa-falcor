import compose from 'koa-compose'
import koaBodyParser from 'koa-bodyparser'
import FalcorRouter from 'falcor-router'

import dataSourceRoute from './dataSourceRoute'

export {dataSourceRoute}

function createRouter(routes, ctx, ctxProp) {
  if (!ctxProp) {
    return new FalcorRouter(routes)
  }
  class ContextRouter extends FalcorRouter.createClass(routes) {
    constructor(koaContext) {
      super()
      this[ctxProp] = koaContext
    }
  }
  return new ContextRouter(ctx)
}

export default (opts = {}) => {
  const {routes, bodyParser, ctxProp = 'ctx'} = Array.isArray(opts) ? {
    routes: opts,
  } : opts

  return compose([
    bodyParser !== false && koaBodyParser(),
    dataSourceRoute(ctx => createRouter(routes, ctx, ctxProp)),
  ].filter(Boolean))
}
