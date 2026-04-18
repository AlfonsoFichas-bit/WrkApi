# JWT Auth Middleware - Hono
JWT Auth Middleware [​](#jwt-auth-middleware)
---------------------------------------------

The JWT Auth Middleware provides authentication by verifying the token with JWT. The middleware will check for an `Authorization` header if the `cookie` option is not set. You can customize the header name using the `headerName` option.

INFO

The Authorization header sent from the client must have a specified scheme.

Example: `Bearer my.token.value` or `Basic my.token.value`

Import [​](#import)
-------------------

ts

```
import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import type { JwtVariables } from 'hono/jwt'
```


Usage [​](#usage)
-----------------

ts

```
// Specify the variable types to infer the `c.get('jwtPayload')`:
type Variables = JwtVariables

const app = new Hono<{ Variables: Variables }>()

app.use(
  '/auth/*',
  jwt({
    secret: 'it-is-very-secret',
    alg: 'HS256',
  })
)

app.get('/auth/page', (c) => {
  return c.text('You are authorized')
})
```


Get payload:

ts

```
const app = new Hono()

app.use(
  '/auth/*',
  jwt({
    secret: 'it-is-very-secret',
    alg: 'HS256',
    issuer: 'my-trusted-issuer',
  })
)

app.get('/auth/page', (c) => {
  const payload = c.get('jwtPayload')
  return c.json(payload) // eg: { "sub": "1234567890", "name": "John Doe", "iat": 1516239022, "iss": "my-trusted-issuer" }
})
```


TIP

`jwt()` is just a middleware function. If you want to use an environment variable (eg: `c.env.JWT_SECRET`), you can use it as follows:

js

```
app.use('/auth/*', (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
    alg: 'HS256',
  })
  return jwtMiddleware(c, next)
})
```


Options [​](#options)
---------------------

### required secret: `string` [​](#secret-string)

A value of your secret key.

### required alg: `string` [​](#alg-string)

An algorithm type that is used for verifying.

Available types are `HS256` | `HS384` | `HS512` | `RS256` | `RS384` | `RS512` | `PS256` | `PS384` | `PS512` | `ES256` | `ES384` | `ES512` | `EdDSA`.

### optional cookie: `string` [​](#cookie-string)

If this value is set, then the value is retrieved from the cookie header using that value as a key, which is then validated as a token.

### optional headerName: `string` [​](#headername-string)

The name of the header to look for the JWT token. The default is `Authorization`.

ts

```
app.use(
  '/auth/*',
  jwt({
    secret: 'it-is-very-secret',
    alg: 'HS256',
    headerName: 'x-custom-auth-header',
  })
)
```


### optional verifyOptions: `VerifyOptions` [​](#verifyoptions-verifyoptions)

Options controlling verification of the token.

#### optional verifyOptions.iss: `string | RexExp` [​](#verifyoptions-iss-string-rexexp)

The expected issuer used for token verification. The `iss` claim will **not** be checked if this isn't set.

#### optional verifyOptions.nbf: `boolean` [​](#verifyoptions-nbf-boolean)

The `nbf` (not before) claim will be verified if present and this is set to `true`. The default is `true`.

#### optional verifyOptions.iat: `boolean` [​](#verifyoptions-iat-boolean)

The `iat` (issued at) claim will be verified if present and this is set to `true`. The default is `true`.

#### optional verifyOptions.exp: `boolean` [​](#verifyoptions-exp-boolean)

The `exp` (expiration time) claim will be verified if present and this is set to `true`. The default is `true`.podria