# koa-falcor

[Koa](https://github.com/koajs/koa/tree/v2.x) Middleware for Hosting [Falcor](https://github.com/Netflix/falcor) Data Sources.

Port from [falcor-express](https://github.com/Netflix/falcor-express).

## Installation

```
npm install koa-falcor koa@next koa-bodyparser@next falcor-router --save
```

## Usage

```js
import { dataSourceRoute } from 'koa-falcor'
import bodyParser from 'koa-bodyparser'
import Koa from 'koa'
import Router from 'falcor-router'

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
}])))

app.listen(3000)
```

### Koa v1

```
npm install koa-falcor koa koa-bodyparser falcor-router koa-convert --save
```

```js
import { dataSourceRoute } from 'koa-falcor'
import bodyParser from 'koa-bodyparser'
import convert from 'koa-convert'
import koa from 'koa'
import Router from 'falcor-router'

const app = koa()

app.use(bodyParser())
app.use(convert.back(dataSourceRoute(() => new Router([{
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
