import url from 'url'

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

export default getDataSource => ctx => {
  const dataSource = getDataSource(ctx)
  if (!dataSource) {
    ctx.throw('Undefined data source', 500)
  }

  const context = requestToContext(ctx.request)

  if (Object.keys(context).length === 0) {
    ctx.throw('Request not supported', 500)
  }
  if (typeof context.method === 'undefined' || context.method.length === 0) {
    ctx.throw('No query method provided', 500)
  }
  if (typeof dataSource[context.method] === 'undefined') {
    ctx.throw(`Data source does not implement method ${context.method}`, 500)
  }

  let obs
  if (context.method === 'set') {
    obs = dataSource[context.method](context.jsonGraph)
  } else if (context.method === 'call') {
    obs = dataSource[context.method](
      context.callPath,
      context.arguments,
      context.pathSuffixes,
      context.paths,
    )
  } else {
    obs = dataSource[context.method]([].concat(context.paths))
  }

  return new Promise((resolve, reject) => {
    obs.subscribe(resolve, reject)
  }).then(jsonGraphEnvelope => {
    ctx.body = jsonGraphEnvelope
  })
}
