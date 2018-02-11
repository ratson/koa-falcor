'use strict'

const url = require('url')

const parseArgs = Object.freeze({
  jsonGraph: true,
  callPath: true,
  arguments: true,
  pathSuffixes: true,
  paths: true,
})

function requestToContext(req) {
  const queryMap =
    req.method === 'POST' ? req.body : url.parse(req.url, true).query
  const context = {}

  if (queryMap) {
    Object.keys(queryMap).forEach(key => {
      const arg = queryMap[key]

      if (parseArgs[key] && arg) {
        context[key] = JSON.parse(arg)
      } else {
        context[key] = arg
      }
    })
  }
  return context
}

function buildObserverable(dataSource, context) {
  if (context.method === 'set') {
    return dataSource[context.method](context.jsonGraph)
  } else if (context.method === 'call') {
    return dataSource[context.method](
      context.callPath,
      context.arguments,
      context.pathSuffixes,
      context.paths
    )
  }
  return dataSource[context.method]([].concat(context.paths))
}

module.exports = getDataSource => ctx => {
  const dataSource = getDataSource(ctx)
  if (!dataSource) {
    ctx.throw(500, 'Undefined data source')
  }

  const context = requestToContext(ctx.request)

  if (Object.keys(context).length === 0) {
    ctx.throw(500, 'Request not supported')
  }
  if (typeof context.method === 'undefined' || context.method.length === 0) {
    ctx.throw(500, 'No query method provided')
  }
  if (typeof dataSource[context.method] === 'undefined') {
    ctx.throw(500, `Data source does not implement method ${context.method}`)
  }

  const obs = buildObserverable(dataSource, context)

  return new Promise((resolve, reject) => {
    obs.subscribe(resolve, reject)
  }).then(jsonGraphEnvelope => {
    ctx.body = jsonGraphEnvelope
  })
}
