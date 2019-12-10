### Features
- Create robust express REST APIs in seconds
- Extensible and lightwieight with minimal additional dependencies
- Run-time type checking and schema validation
- Simplified controller <--> endpoint descriptions 

# Express+

Table of Contents
- [Simplified Endpoints](#simplified-endpoints)
- [Input Validation](#input-validation)
	- [Explicit Input Schema Validation](#explicit-input-schema-validation)
- [Routing](#routing)
  - [Implicit Route Handling](#implicit-route-handling)
  - [Explicit Route Handling](#explicit-route-handling)
    - [Server Level Route Prefixing](#server-level-route-prefixing)
    - [Controller Level Routing](#controller-level-routing)
    - [Endpoint Level Routing](#endpoint-level-routing)
    - [Specifying Route Parameters](#specifying-route-parameters)
    - [Accepting Multiple HTTP Methods](#accepting-multiple-http-methods)
- [Middleware](#middleware)
  - [Content-Types](#content-types)
  - [Authentication](#authentication)
    - [Endpoint specified auth methods](#endpoint-specified-auth-methods)
  - [Error Handling](#error-handling)
    - [Overriding default error handling](#overriding-default-error-handling)
  - [CORS](#cors)
- [Endpoint Arguments and HttpContext](#endpoint-arguments-and-httpcontext)
    - [Request Type Hinting](#request-type-hinting)
- [Return Methods](#return-methods)
    - [Returning bad requests](#returning-bad-requests)
- [Environments](#environments)


# Simplified Endpoints
In the following example, we bind a GET and POST Method to the following routes
- GET: {host}/helloworld/test
- POST: {host}/helloworld/testSchema

hello-world-controller.ts:
```typescript
@Controller()
export class HelloWorldController extends ApiController {

  constructor() {
    super();
  }

  @HttpGet()
  public async test({ req, res }: HttpContext) {
    return Ok(res, 'Hello World!');
  }

  @HttpPost({ fromBody: ExampleObject })
  public async testSchema({ req, res }: HttpContext) {
    return Ok(res, 'Post Received');
  }
}
```
main.ts
```typescript
const server = new Server(
  environment,
  {
    controllers: [
      HelloWorldController,
    ],
  });

server.start();
// Log: endpoint added at: /helloworld/test
// Log: endpoint added at: /helloworld/testSchema
```
# Input Validation
## Explicit Input Schema Validation
Express+ allows for run-time schema validaton on HTTP POST and PUT requests with the `fromBody` optional parameter in the `@HttpPost` and `@HttpPut` decorators

hello-world-controller.ts
```typescript
  @HttpPost({ fromBody: ExampleObject })
  public async testSchema({ req, res }: HttpContext) {
    return Ok(res, 'Post Received');
  }
```

example-object.ts
```typescript
export interface IExampleObject {
  id?: number;
  value?: string;
  phone?: string;
}

export class ExampleObject implements IExampleObject {

  @IsRequired()
  @IsInt()
  public id: number;

  @IsRequired()
  @Length(0, 5)
  public value: string;

  @IsOptional()
  @Matches(/^[(][0-9]{3}[)][0-9]{3}[-][0-9]{4}$/) // ex: (800)123-4567
  public phone: string;

}
```

|Input|Result|
| ------------ | ------------ |
|`{"id": 1} `| `'value' missing` |
| `{"id": 1, "value": "Hello World"}`  | `'value' length must be less than or equal to 5`  |
| `{"id": 1, "value": "Test", "phone": "8001234567"}` | `'phone' format does not match` |
| `{"id": 1, "value": "Test"}` | `Ok` |
| `{"id": 1, "value": "Test", "phone": "(800)123-4567"}` | `Ok` |


# Routing

## Implicit Route Handling
By default, routes are handled implcitly. Assume our default route is `{host}/`.

The first route parameter is handled by the name of the controller. With the following code in `hello-world-controller.ts` we infer all the endpoints within this controller to be prefixed with `helloworld` because of the naming convention of the controller combined with the decorator `@Controller`

```typescript
@Controller()
export class HelloWorldController extends ApiController {

  constructor() {
    super();
  }
}
```

At this point. We have only declared the default route for our HelloWorldController at `{host}/HelloWorld/`

To declare an endpoint, we simply add a method in our `Controller` with any of the `@Http{type}` decorators such as `@HttpGet` or `@HttpPost`

```typescript
  @HttpGet()
  public async test({ req, res }: HttpContext) {
    return Ok(res, 'Hello World!');
  }

  @HttpPost()
  public async testSchema({ req, res }: HttpContext) {
    return Ok(res, 'Ok');
  }
```

With these endpoints delcared inside our `HelloWorldController`, we have the following routes: 
- GET: `{host}/helloworld/test`
- POST: `{host}/helloworld/testSchema`

## Explicit Route Handling

Assuming we utilize the same controller and endpoint methods as described above. We are provided the following ways to modify our routing of our Endpoints. 

### Server Level Route Prefixing
In our `main.ts` file we can use the `routePrefix` option in the `Server` constructor to specify all routes be prefixed with our parameter: 

```typescript
const server = new Server(
  environment,
  {
    controllers: [
      HelloWorldController,
    ],
    routePrefix: 'api'
  });
```
Given all else equal, our routes will now look like:
- GET: `{host}/api/helloworld/test`
- POST: `{host}/api/helloworld/testSchema`

### Controller Level Routing
We can also optionally specify routes at a controller level by specifying a route in the `@Controller` decorator. The `preserveCase` parameter, allows for the route case to be preserved as-is. Otherwise, the controller route is converted to lowercase.

```typescript
@Controller({route: 'v1/MyController', preserveCase: true })
export class HelloWorldController extends ApiController {

  constructor() {
    super();
  }
}
```

Given all else equal, our routes will now look like
- GET: `{host}/v1/MyController/test`
- POST: `{host}/v1/MyController/testSchema`

### Endpoint Level Routing
We can specify routes at the endpoint level as well. Currently this is also the only way to pass route parameter expextations as well.

```typescript
  @HttpGet()
  public async test({ req, res }: HttpContext) {
    return Ok(res, 'Ok');
  }

  @HttpPost({ route: 'CustomPostRoute' })
  public async testSchema({ req, res }: HttpContext) {
    return Ok(res, 'Ok');
  }
```

Given all else equal using our `HelloWorldController`, our routes will now look like
- GET: `{host}/helloworld/test`
- POST: `{host}/helloworld/CustomPostRoute`

### Specifying Route Parameters
To add route parameters to an endpoint, simply supply them via the `params` option in your endpoint decorator.

```typescript
  @HttpGet({ params: ":id/:value?" })
  public async GetWithParams({ req, res }: HttpContext) {
    return Ok(res, req.params);
  }
```

This will register the route: `GetWithParams/:id/:value?` to our controller, requiring the `id` parameter and `value` being optional. A good practice is to pass the `ParamType` to the `HttpContext` and get full type-hinting of your `req.params`.

### Accepting Multiple HTTP Methods
Good REST API design practices call for dictating CRUD (create, read, update delete) operations to be dictated on each route.

In Express+ we can easily handle overloading the same route endpoint to accept multiple HTTP methods.

| Route | Method | Action |
| ------------ | ------------ | ------------ |
| `/products` | GET | Returns list of Products |
| `/products/:id` | GET | Returns specific Product |
|`/products`|POST|Creates a new Product|
|`/products`|PUT|Updates a Product|
|`/products/:id`|DELETE|Deletes a specific Product|

```typescript
@Controller()
export class ProductsController extends ApiController {

  constructor() {
    super();
  }

  @HttpGet({ params: ':id?' })
  @HttpDelete({ params: ':id' })
  @HttpPost({ fromBody: Product })
  @HttpPut({ fromBody: Product })
  public async default({ req, res }: HttpContext<Product>) {
    switch (req.method) {
      case 'GET': {
        return Ok(res, await this.getProducts(req.params.id));
      }
      case 'POST': {
        return Ok(res, await this.createProduct(req.body, this.products));
      }
      case 'PUT': {
        return Ok(res, await this.updateProduct(req.body, this.products));
      }
      case 'DELETE': {
        return Ok(res, await this.deleteProduct(req.params.id, this.products));
      }
    }
  }
}
```

In the above example, we overload the `default` route which is mapped to the route specified by the `Controller`. Each decorator is handled just as it would if it was dictated in a separate function. For example, only the `POST` and `PUT` methods will validate the body, and only the `GET` and `DELETE` methods will accept an id in the URL.


# Middleware
One of the goals of Express+ is to cut down on the verbosity of the middleware stack for endpoints. Here are some examples of built-in middleware functions.

## Content-Types
On HTTP POST and PUT requests, you might want to only accept a certain content type, and it may differ from the content types accepted by other endpoint methods. 

```typescript
  @HttpPut({ contentType: HttpContentType.UrlEncoded })
  public async TestPut({ req, res }: HttpContext) {
    console.dir(req);
    return Ok(res, 'Put Successful');
  }
```
Depending on the content type you declare `JSON (default), UrlEncoded, FormData, etc..`, middleware will be applied to this route to ensure the incoming request conforms to that content-type before it ever hits the endpoint method.

## Authentication
Express+ simplifies authentication with the `authenticate` parameter passed into any `@Http{Type}` decorator.

```typescript
  @HttpGet({ authenticate: true })
  public async TestAuth({ req, res }: HttpContext) {
    return Ok(res, res.locals);
  }
```

This method will use the default authenticator provided in your `Server`

A boilerplate authenticator may resemble the following: 

test-auth.ts:
```typescript
export function TestAuth(req: Request<Dictionary<string>>, res: Response, next: NextFunction): Promise<void> {
  return new Promise((resolve, reject) => {
    if (req.headers.sessiontoken === '123456') { // validate the user against your db
      res.locals.user = { userId: 1 }; // pass on the user info
      resolve();
      next();
    } else {
      throw new UnauthorizedError();
    }
  });
}
```

Which can be implemented into the server via the constructor.

main.ts:

```typescript
const server = new Server(
  environment,
  {
    authMethod: TestAuth,
    controllers: [
      HelloWorldController,
    ]
  });

server.start();
```

### Endpoint specified auth methods
If you want to use a separate authentication method for varying endpoints, the method can be specified in the endpoint options such as: 

```typescript
  @HttpGet({ authenticate: true, authMethod: TestAuth })
  public async TestAuth({ req, res }: HttpContext) {
    return Ok(res, res.locals);
  }
```

## Error Handling
Natively, express handles errors quite well. However, to give more control and precision over errors thrown in promises or asyncronous operations, you have the ability to create default error handlers. 

By default, Express+ handles errors in a simplified fashion, any `throw new Error()` or code with Express+ Error classes extended from `ApplicationError` will interrupt the endpoint method call-stack and returns a JSON formatted response such as:

```json
{
    "name": "UnauthorizedError",
    "message": "Insufficient Permission",
    "status": 401
}
```

Express+ provides `Error` classes for the most frequently used Error response codes, which will ensure the response is sent with the proper HTTP Code and a default (but optionally specified) message

| Error | Code | Message|
| ------------ | ------------ | ---------- |
| ApplicationError (Default) | 500 | Something went wrong, please try again |
| BadRequestError | 400 |Bad request from client|
| ConflictError | 403 | The request could not be completed due to a conflict with the current state of the resource|
|ForbiddenError| 403| Access forbidden|
|NotFoundError| 404| No matching resource found|
|UnauthorizedError|401|Insufficient permission|

The following usage in your code:
```typescript
 throw new BadRequestError('Expected array of parameters');
```
Will return to client: 
```json
{
    "name": "BadRequestError",
    "message": "Expected array of parameters",
    "status": 403
}
```
### Overriding default error handling

You can provide any error handler complying to [express.js docs](http://http://expressjs.com/en/guide/error-handling.html#error-handling "express.js docs") to the `Server` constructor such as: 

```typescript
const server = new Server(
  environment,
  {
    controllers: [
      HelloWorldController
    ],
    errorHandler: (err, req, res, next) => {
      if (res.headersSent) {
        return;
      }
      return res.status(500).send({name: 'CustomError', message: err.message});
    }
  });

server.start();
```

You can also provide** Endpoint Specific**  error handlers via: 

hello-world-controller.ts
```typescript
  @HttpGet({ errorHandler: MyHandler})
  public async test({ req, res }: HttpContext) {
    return Ok(res, req.params);
  }
```
my-handler.ts
```typescript
export function MyHandler(err, req, res, next){
  // your code
}
```
## CORS
(Needs testing)

Express+ uses the `cors` middleware package as documented in the [express docs](https://expressjs.com/en/resources/middleware/cors.html).

To implement server-wide CORS, specify the `CorsOptions` in the `Server` constructor. For example: 

main.ts
```typescript
const server = new Server(
  environment,
  {
    controllers: [
      HelloWorldController
    ],
    cors: {
      origin: ['https://www.mysite.com']
    }
  });

server.start();
```

You can also optionally specify CORS policies on individual routes by specifying the `cors` parameter in the `Http{Type}` endpoint decorator.

hello-world-controller.ts

```typescript
  @HttpGet({ cors: { origin: 'https://test.com' } })
  public async TestCors({ req, res }: HttpContext) {
    return Ok(res, 'CORS is good');
  }
```

You can optionally pass `false` to this endpoint parameter option if you want to disable all CORS policies for this endpoint.

# Endpoint Arguments and HttpContext
All Express+ `Endpoints` are expected to allow the same argument of `HttpContext`. This is a basic wrapper class that contains the `Request` and `Response` of the incoming http request.

```typescript
  @HttpGet({ route: 'Test', params: ':id' })
  public async Test({ req, res }: HttpContext<any, { id: string }>) {
    if(req.params.id === '1'){
      return Ok(res, 'Received One');
    } else if(req.params.id === '2'){
      return Ok(res, 'Received Two');
    } else {
      return Ok(res, 'Received other');
    }
  }
```

> Q: Why is there no `next` arugment in `HttpContext`

Your `Endpoint` method should be the last method in the stack at the provided route. This is one of the few opinionated assumptions made by Express+.

### Request Type Hinting
The `HttpContext` class contains optional Type parameters to supply to get compile-time type-hinting: `HttpContext<BodyType, ParamsType, QueryType>`

These types are applied to the `req.body` `req.params` and `req.query` respectively.

**Get body type**
```typescript
  @HttpPost({ fromBody: ExampleObject })
  public async PostWithSchemaValidation({ req, res }: HttpContext<ExampleObject>) {
    return Ok(res, 'formatting good');
  }
```

In this example we pass the `ExampleObject` used earlier to ensure type-hinting and intellisense when accessing the `req.body` from this point forward. In this case we can trust the data because `ExampleObject` is being validated via the `fromBody` option passed into the `@HttpPost` decorator.

**Get URL Params**:
```typescript
  @HttpGet({ params: ":id/:value?" })
  public async GetWithParams({ req, res }: HttpContext<any, { id: string; value?: string }>) {
    return Ok(res, req.params);
  }
```
When we pass `{ id: string; value?: string }` into the `ParamsType` of the `HttpContext` our `req.params` type hinting works as expected.

**Get URL query string**:
```typescript
  @HttpGet()
  public async GetWithQuery({ req, res }: HttpContext<any, any, Partial<{ id: string, value: string }>>) {
    return Ok(res, req.query);
  }
```

In this example, `Partial<{ id: string, value: string }>` is supplied to the `QueryType` of our `HttpContext`. This allows our `req.query` parameter to have full type hinting and intellisense. We use the `Partial<T>` [utility type](https://www.typescriptlang.org/docs/handbook/utility-types.html "utility type") because our query strings should be treated as untrusted.


# Return Methods
Express+ provdes return type wrapper methods to automatically handle the response of your `Endpoints`. It should be noted these are entirely optional. 

hello-world-controller.ts

```typescript
  @HttpGet()
  public async Test({ req, res }: HttpContext) {
    return Ok(res, 'Hello World');
  }
```

The `Ok` method will set the status of the response to 200 and return whatever is provided for the body. 

Express+ return methods include:

| Method | Code | Allow Body |
| ------------ | ------------ | ------------ |
| Ok | 200 | Yes |
| Created | 201 | Yes |
|NoContent|204|No|
|NotModified|304|Yes|

### Returning bad requests
Return bad requests by throwing one of the provided `Error` objects. These types throw a status code that corresponds to the HTTP status code name, and format the response accordingly via the default error handler.

```typescript
@HttpGet()
public async neverAccess({ req, res }: HttpContext) {
   throw new ForbiddenError('This route should never be accessed');
}
```

Will return the following HTTP response unless the default error handler is overwritten: 
```json
status: 403
body: 
{
	"name": "ForbiddenError",
	"message": "This should never be accessed",
	"status": 403
}
```

# Environments
Express+ offers simple solutions to handling environment variables.

A `ServerEnvironment` instance must be passed to the `Server` constructor. However, there are multiple ways to initiate these variables.

Explicit declaration: 
```typescript
const environment = new ServerEnvironment({
  port: '8000',
  debug: true
});
```

Node.JS environment variables:
```typescript
const environment = new ServerEnvironment();
```

Environment variables to be set:

| Variable | Value | Default|
| ------------ | ------------ | -------- |
| PORT | Any numeric value | `80` |
| NODE_ENV | `development` or `production` | `production` |


You then pass this object into the `Server` constructor
```typescript
const environment = new ServerEnvironment();

const server = new Server(
  environment,
  {
    controllers: [
      HelloWorldController
    ]
  });

server.start();
```