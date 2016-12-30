import should from 'should'

import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import request from 'supertest'

import {Model} from 'falcor'
import HttpDataSource from 'falcor-http-datasource'
import Router from 'falcor-router'

import {dataSourceRoute} from '../src'

import routes from './routes'

describe('dataSourceRoute', () => {
  const app = new Koa()
  app.use(dataSourceRoute(() => new Router(routes)))

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

describe('falcor.call()', () => {
  let changeCounter = 0
  const app = new Koa()
  app.use(bodyParser())
  app.use(dataSourceRoute(() => new Router(routes)))

  let httpModel
  before((done) => {
    app.listen(function() {
      const {port, address} = this.address()
      httpModel = new Model({
        source: new HttpDataSource(`http://${address}:${port}/`),
        onChange() {
          changeCounter += 1
        },
      })
      done()
    })
  })

  it('should return correct response', () => {
    should(httpModel.getVersion()).be.exactly(-1)

    return httpModel
    .get(['greeting'], ['counter'])
    .then((res) => {
      should(res.json.greeting).be.exactly('Hello World!')

      should(changeCounter).be.exactly(1)
      should(httpModel.getVersion()).be.exactly(1)
      should(httpModel.getCache().greeting.value).be.exactly('Hello World!')

      return httpModel.call('counter')
      .then(resCall => httpModel.get('counter').then(resNew => ({
        res,
        resCall,
        resNew,
      })))
    })
    .then(({res, resCall, resNew}) => {
      should(resCall.json.counter).be.exactly(res.json.counter + 1)
      should(resNew.json.counter).be.exactly(res.json.counter + 1)

      should(changeCounter).be.exactly(3)
      should(httpModel.getVersion()).be.exactly(3)
      should(httpModel.getCache().greeting).be.undefined()
    })
  })
})
