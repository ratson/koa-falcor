'use strict'

const should = require('should')

const Koa = require('koa')

const { Model } = require('falcor')
const HttpDataSource = require('falcor-http-datasource')

const falcor = require('../lib')

const routes = require('./routes')

describe('middleware', () => {
  const app = new Koa()
  app.use(falcor({ routes }))

  let httpModel
  before(done => {
    const server = app.listen(done)
    const { port, address } = server.address()
    httpModel = new Model({
      source: new HttpDataSource(`http://${address}:${port}/`),
    })
  })

  it('should work for call()', async () => {
    const res = await httpModel.call('counter')
    should(res.json.counter).be.above(0)
  })
})

describe('middleware opts = routes', () => {
  const app = new Koa()
  app.use(falcor(routes))

  let httpModel
  before(done => {
    const server = app.listen(done)
    const { port, address } = server.address()
    httpModel = new Model({
      source: new HttpDataSource(`http://${address}:${port}/`),
    })
  })

  it('should work for call()', async () => {
    const res = await httpModel.call('counter')
    should(res.json.counter).be.above(0)
  })
})

describe('middleware opts.bodyParser = false', () => {
  const app = new Koa()
  app.use(falcor({ bodyParser: false, routes }))

  let httpModel
  before(done => {
    const server = app.listen(done)
    const { port, address } = server.address()
    httpModel = new Model({
      source: new HttpDataSource(`http://${address}:${port}/`),
    })
  })

  it('should work for get()', async () => {
    const res = await httpModel.get(['greeting'])

    should(res.json.greeting).be.exactly('Hello World!')

    should(httpModel.getCache().greeting).be.exactly('Hello World!')
  })

  it('should not work for call()', async () => {
    try {
      await httpModel.call(['counter'])
      should.fail()
    } catch (err) {
      should(err.message).be.exactly('Internal Server Error')
    }
  })
})
