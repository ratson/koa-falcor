# koa-falcor

[Koa](https://github.com/koajs/koa) Middleware for Hosting [Falcor](https://github.com/Netflix/falcor) Data Sources.

`dataSourceRoute` is port from [falcor-express](https://github.com/Netflix/falcor-express).

## Installation

```sh
npm install koa-falcor koa koa-route --save
```

## Usage

<!-- eslint-disable strict -->

```js
const falcor = require('koa-falcor')
const Koa = require('koa')
const route = require('koa-route')

const app = new Koa()

app.use(route.get('/model.json', falcor([{
  route: 'greeting',
  get() {
    return {
      path: ['greeting'],
      value: 'Hello World!',
    }
  },
}])))

app.listen(3000)
```

Then access the JSON Graph via `http://localhost:3000/model.json?paths=[["greeting"]]&method=get`

## Create Router Manually

```sh
npm install koa-falcor koa koa-bodyparser koa-route falcor-router --save
```

<!-- eslint-disable strict -->

```js
const { dataSourceRoute } = require('koa-falcor')
const bodyParser = require('koa-bodyparser')
const Koa = require('koa')
const route = require('koa-route')
const Router = require('falcor-router')

const app = new Koa()

app.use(bodyParser())
app.use(route.get('/model.json', dataSourceRoute(() => new Router([{
  route: 'greeting',
  get() {
    return {
      path: ['greeting'],
      value: 'Hello World!',
    }
  },
}]))))

app.listen(3000)
```
