import should from 'should'

import Koa from 'koa'
import request from 'supertest'
import Router from 'falcor-router'

import falcor from 'falcor'
import {pathValue, pathInvalidation} from 'falcor-json-graph'
import bodyParser from 'koa-bodyparser'
import HttpDataSource from 'falcor-http-datasource'

import {dataSourceRoute} from '../src'

describe('dataSourceRoute', function() {
  const app = new Koa()
  app.use(dataSourceRoute(() => new Router([{
    route: 'greeting',
    get() {
      return {
        path: ['greeting'],
        value: 'Hello World!',
      }
    },
  }])))

  it('should return the JSON Graph', (done) => {
    request(app.listen())
      .get('/?paths=[[%22greeting%22]]&method=get')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect({
        jsonGraph: {
          greeting: 'Hello World!',
        },
      })
      .end(done)
  })

  it('should throw error for unknown method', (done) => {
    request(app.listen())
      .get('/?paths=[[%22greeting%22]]&method=unknown')
      .expect(500)
      .end(done)
  })
})

describe('falcor.call()', function() {
  let counter = 0
  let changeCounter = 0
  const app = new Koa()
  app.use(bodyParser())
  app.use(dataSourceRoute(() => new Router([{
    route: 'greeting',
    get() {
      return {
        path: ['greeting'],
        value: 'Hello World!',
      }
    },
  }, {
    route: 'count',
    call(pathSet, args) {
      counter += 1
      return [
        pathValue(['counter'], counter),
        pathInvalidation(['greeting']),
      ]
    },
  }])))

  let httpModel
  before((done) => {
    app.listen(function() {
      const {port, address} = this.address()
      httpModel = new falcor.Model({
        source: new HttpDataSource(`http://${address}:${port}/`),
        onChange() {
          changeCounter += 1
        }
      })
      done()
    })
  })

  it('should return correct response', () => {
    should(httpModel.getVersion()).be.exactly(-1)

    return httpModel
    .get('greeting')
    .then((res) => {
      should(res.json.greeting).be.exactly('Hello World!')

      should(changeCounter).be.exactly(1)
      should(httpModel.getVersion()).be.exactly(1)
      should(httpModel.getCache().greeting.value).be.exactly('Hello World!')

      should(counter).be.exactly(0)
    })
    .then(() => httpModel.call('count'))
    .then((res) => {
      should(counter).be.exactly(1)
      should(res.json.counter).be.exactly(1)

      should(changeCounter).be.exactly(3)
      should(httpModel.getVersion()).be.exactly(3)
      should(httpModel.getCache().greeting).be.undefined()
    })
  })
})
