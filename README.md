# koa-falcor

[Koa](https://github.com/koajs/koa/tree/v2.x) Middleware for Hosting [Falcor](https://github.com/Netflix/falcor) Data Sources.

Port from [falcor-express](https://github.com/Netflix/falcor-express).

## Installation

```
npm install koa-falcor koa@next koa-bodyparser@next koa-route@next falcor-router --save
```

## Usage

```js
import { dataSourceRoute } from 'koa-falcor'
import bodyParser from 'koa-bodyparser'
import Koa from 'koa'
import route from 'koa-route'
import Router from 'falcor-router'

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

Then access the JSON Graph via `http://localhost:3000/model.json?paths=[["greeting"]]&method=get`

### Koa v1

```
npm install koa-falcor koa koa-bodyparser koa-route falcor-router koa-convert --save
```

```js
import { dataSourceRoute } from 'koa-falcor'
import bodyParser from 'koa-bodyparser'
import convert from 'koa-convert'
import koa from 'koa'
import route from 'koa-route'
import Router from 'falcor-router'

const app = koa()

app.use(bodyParser())
app.use(route.get('/model.json', convert.back(dataSourceRoute(() => new Router([{
  route: 'greeting',
  get() {
    return {
      path: ['greeting'],
      value: 'Hello World!',
    }
  },
}])))))

app.listen(3000)
```
