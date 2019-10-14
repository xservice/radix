# @xservice/radix

fork from [find-my-way](https://github.com/delvedor/find-my-way).

A crazy fast HTTP router, internally uses an highly performant [Radix Tree](https://en.wikipedia.org/wiki/Radix_tree) (aka compact [Prefix Tree](https://en.wikipedia.org/wiki/Trie)), supports route params, wildcards, and it's framework independent.

If you want to see a benchmark comparison with the most commonly used routers, see [here](https://github.com/delvedor/router-benchmark).<br>
Do you need a real-world example that uses this router? Check out [Fastify](https://github.com/fastify/fastify) or [Restify](https://github.com/restify/node-restify).

<a name="install"></a>
## Install

```bash
npm i @xservice/radix
```

<a name="usage"></a>
## Usage

```javascript
import Monitor, { Request, Response } from '@xservice/server';
import Router from '@xservice/radix';
const router = new Router();

router.on('GET', '/', (req, res, params) => {
  console.log('{"message":"hello world"}')
})

const createServer = Monitor({ event: 'hashchange' });
createServer(async (req: Request, res: Response) => await app.lookup(req, res)).listen();
```

<a name="api"></a>
## API
<a name="constructor"></a>
#### FindMyway([options])

Instance a new router.<br>
You can pass a default route with the option `defaultRoute`.

```js
import Router from '@xservice/radix';
const router = new Router({
  defaultRoute: (req, res) => {
    res.statusCode = 404
    res.end()
  }
});
```

Trailing slashes can be ignored by supplying the `ignoreTrailingSlash` option:
```js
import Router from '@xservice/radix';
const router = new Router({
  ignoreTrailingSlash: true
})
function handler (req, res, params) {
  console.log('foo')
}
// maps "/foo/" and "/foo" to `handler`
router.on('GET', '/foo/', handler)
```

You can set a custom length for parameters in parametric *(standard, regex and multi)* routes by using `maxParamLength` option, the default value is 100 characters.<br/>
*If the maximum length limit is reached, the default route will be invoked.*
```js
import Router from '@xservice/radix';
const router = new Router({
  maxParamLength: 500
})
```

According to [RFC3986](https://tools.ietf.org/html/rfc3986#section-6.2.2.1), @xservice/radix is case sensitive by default.
You can disable this by setting the `caseSensitive` option to `false`:
in that case, all paths will be matched as lowercase, but the route parameters or wildcards will maintain their original letter casing. You can turn off case sensitivity with:

```js
import Router from '@xservice/radix';
const router = new Router({
  caseSensitive: false
})
```

The custom strategy object should contain next properties:
* `storage` - the factory function for the Storage of the handlers based on their version.
* `deriveVersion` - the function to determine the version based on the request

The signature of the functions and objects must match the one from the example above.


*Please, be aware, if you use custom versioning strategy - you use it on your own risk. This can lead both to the performance degradation and bugs which are not related to `@xservice/radix` itself*

<a name="on"></a>
#### on(method, path, [opts], handler)
Register a new route.

```js
router.on('GET', '/example', (req, res, params) => {
  // your code
})
```

##### on(methods[], path, [opts], handler, [store])
Register a new route for each method specified in the `methods` array.
It comes handy when you need to declare multiple routes with the same handler but different methods.
```js
router.on(['GET', 'POST'], '/example', (req, res, params) => {
  // your code
})
```

<a name="supported-path-formats"></a>
##### Supported path formats
To register a **parametric** path, use the *colon* before the parameter name. For **wildcard** use the *star*.
*Remember that static routes are always inserted before parametric and wildcard.*

```js
// parametric
router.on('GET', '/example/:userId', (req, res, params) => {}))
router.on('GET', '/example/:userId/:secretToken', (req, res, params) => {}))

// wildcard
router.on('GET', '/example/*', (req, res, params) => {}))
```

Regular expression routes are supported as well, but pay attention, RegExp are very expensive in term of performance!<br>
If you want to declare a regular expression route, you must put the regular expression inside round parenthesis after the parameter name.
```js
// parametric with regexp
router.on('GET', '/example/:file(^\\d+).png', () => {}))
```

It's possible to define more than one parameter within the same couple of slash ("/"). Such as:
```js
router.on('GET', '/example/near/:lat-:lng/radius/:r', (req, res, params) => {}))
```
*Remember in this case to use the dash ("-") as parameters separator.*

Finally it's possible to have multiple parameters with RegExp.
```js
router.on('GET', '/example/at/:hour(^\\d{2})h:minute(^\\d{2})m', (req, res, params) => {}))
```
In this case as parameter separator it's possible to use whatever character is not matched by the regular expression.

Having a route with multiple parameters may affect negatively the performance, so prefer single parameter approach whenever possible, especially on routes which are on the hot path of your application.

<a name="match-order"></a>
##### Match order

The routing algorithm matches one chunk at a time (where the chunk is a string between two slashes),
this means that it cannot know if a route is static or dynamic until it finishes to match the URL.

The chunks are matched in the following order:

1. static
1. parametric
1. wildcards
1. parametric(regex)
1. multi parametric(regex)

So if you declare the following routes

- `/:userId/foo/bar`
- `/33/:a(^.*$)/:b`

and the URL of the incoming request is /33/foo/bar,
the second route will be matched because the first chunk (33) matches the static chunk.
If the URL would have been /32/foo/bar, the first route would have been matched.

<a name="supported-methods"></a>
##### Supported methods
The router is able to route all HTTP methods defined by [`http` core module](https://nodejs.org/api/http.html#http_http_methods).

<a name="off"></a>
#### off(method, path)
Deregister a route.
```js
router.off('GET', '/example')
// => { handler: Function, params: Object, store: Object}
// => null
```

##### off(methods[], path, handler, [store])
Deregister a route for each method specified in the `methods` array.
It comes handy when you need to deregister multiple routes with the same path but different methods.
```js
router.off(['GET', 'POST'], '/example')
// => [{ handler: Function, params: Object, store: Object}]
// => null
```

<a name="reset"></a>
#### reset()
Empty router.
```js
router.reset()
```

##### Caveats
* It's not possible to register two routes which differs only for their parameters, because internally they would be seen as the same route. In a such case you'll get an early error during the route registration phase. An example is worth thousand words:
```js
const findMyWay = new Router({
  defaultRoute: (req, res) => {}
})

findMyWay.on('GET', '/user/:userId(^\\d+)', (req, res, params) => {})

findMyWay.on('GET', '/user/:username(^[a-z]+)', (req, res, params) => {})
// Method 'GET' already declared for route ':'
```

<a name="shorthand-methods"></a>
##### Shorthand methods
If you want an even nicer api, you can also use the shorthand methods to declare your routes.

For each HTTP supported method, there's the shorthand method. For example:
```js
router.get(path, handler)
router.delete(path, handler)
router.router(path, handler)
router.put(path, handler)
router.post(path, handler)
// ...
```

If you need a route that supports *all* methods you can use the `all` api.
```js
router.all(path, handler)
```

<a name="lookup"></a>
#### lookup(request, response, [context])
Start a new search, `request` and `response` are the server req/res objects.<br>
If a route is found it will automatically call the handler, otherwise the default route will be called.<br>
The url is sanitized internally, all the parameters and wildcards are decoded automatically.

```js
router.lookup(req, res)
```

`lookup` accepts an optional context which will be the value of `this` when executing a handler
```js
router.on('GET', '*', function(req, res) {
  console.log(this.greeting);
})
router.lookup(req, res, { greeting: 'Hello, World!' })
```

<a name="find"></a>
#### find(method, path [, version])
Return (if present) the route registered in *method:path*.<br>
The path must be sanitized, all the parameters and wildcards are decoded automatically.<br/>
You can also pass an optional version string. In case of the default versioning strategy it should be conform to the [semver](https://semver.org/) specification.
```js
router.find('GET', '/example')
// => { handler: Function, params: Object, store: Object}
// => null
```

<a name="acknowledgements"></a>
## Acknowledgements

It is inspired by the [echo](https://github.com/labstack/echo) router, some parts have been extracted from [trekjs](https://github.com/trekjs) router.

<a name="sponsor"></a>
#### Past sponsor

- [LetzDoIt](http://www.letzdoitapp.com/)

<a name="license"></a>
## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2018-present, yunjie (Evio) shen