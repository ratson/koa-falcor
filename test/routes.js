import {pathValue, pathInvalidation} from 'falcor-json-graph'

let counter = 0

export default [{
  route: 'greeting',
  get() {
    return pathValue(['greeting'], 'Hello World!')
  },
}, {
  route: 'counter',
  get() {
    return pathValue(['counter'], counter)
  },
  call(pathSet, {count = 1} = {}) {
    counter += count
    return [
      pathValue(['counter'], counter),
      pathInvalidation(['greeting']),
    ]
  },
}]
