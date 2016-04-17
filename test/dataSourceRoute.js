import Koa from 'koa'
import request from 'supertest'
import Router from 'falcor-router'

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
