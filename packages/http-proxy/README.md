# HTTP(S) proxy for UnityBase

Reverse proxy with authentication
 
Code below will add a `cms` endpoint.

On every request to cms endpoint the UB authentication header will be checked.
If it's valid then this request will be redirected to `http://localhost:3030`.
If not - then the endpoint will return 401.

For the requests which start from `/ubcms` the authentication will not be checked.

I.e. `GET /cms/some/path&p1=true` will be proxies to `GET http://localhost:3030/some/path&p1=true`
 
```JavaScript
const HttpProxy = require('@unitybase/http-proxy')
new HttpProxy({
    endpoint: 'cms',
    targetURL: 'http://localhost:3030',
    nonAuthorizedURLs: [///ubcms/]
})
```
