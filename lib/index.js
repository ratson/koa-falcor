'use strict'

const compose = require('koa-compose')
const koaBodyParser = require('koa-bodyparser')
const FalcorRouter = require('falcor-router')

const dataSourceRoute = require('./dataSourceRoute')

function makeRouter(routes, ctxProp, Router) {
  class ContextRouter extends Router.createClass(routes) {
    constructor(koaContext) {
      super()
      this[ctxProp] = koaContext
    }
  }
  return ContextRouter
}

module.exports = (opts = {}) => {
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

module.exports.dataSourceRoute = dataSourceRoute
