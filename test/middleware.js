import should from 'should'

import Koa from 'koa'

import { Model } from 'falcor'
import HttpDataSource from 'falcor-http-datasource'

import falcor from '../lib'

import routes from './routes'

describe('middleware', () => {
  const app = new Koa()
  app.use(falcor({ routes }))

  let httpModel
  before(done => {
    app.listen(function () {
      const { port, address } = this.address()
      httpModel = new Model({
        source: new HttpDataSource(`http://${address}:${port}/`),
      })
      done()
    })
  })

  it('should work for call()', () => {
    return httpModel.call('counter')
      .then(res => {
        should(res.json.counter).be.above(0)
      })
  })
})

describe('middleware opts = routes', () => {
  const app = new Koa()
  app.use(falcor(routes))

  let httpModel
  before(done => {
    app.listen(function () {
      const { port, address } = this.address()
      httpModel = new Model({
        source: new HttpDataSource(`http://${address}:${port}/`),
      })
      done()
    })
  })

  it('should work for call()', () => {
    return httpModel.call('counter')
      .then(res => {
        should(res.json.counter).be.above(0)
      })
  })
})

describe('middleware opts.bodyParser = false', () => {
  const app = new Koa()
  app.use(falcor({ bodyParser: false, routes }))

  let httpModel
  before(done => {
    app.listen(function () {
      const { port, address } = this.address()
      httpModel = new Model({
        source: new HttpDataSource(`http://${address}:${port}/`),
      })
      done()
    })
  })

  it('should work for get()', () => {
    return httpModel
      .get(['greeting'])
      .then(res => {
        should(res.json.greeting).be.exactly('Hello World!')

        should(httpModel.getCache().greeting.value).be.exactly('Hello World!')
      })
  })

  it('should not work for call()', () => {
    return httpModel
      .call(['counter'])
      .then(() => {
        should.fail()
      })
      .catch(err => {
        should(err.message).be.exactly('Internal Server Error')
      })
  })
})
