[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

This model is a main entry point for a UnityBase server application.

## Application

In term of UnityBase application is defined by:
 - configuration (ubConfig.json by default): file what
 describe settings for http server, logging, authorization methods,
 Domain, etc. See [server config json schema](https://unitybase.info/docson/index.html#https://unitybase.info/models/UB/schemas/ubConfig.schema.json)
 for full description
 - `package.json` - npm/yarn configuration used to give information to
 package manager that allows it to identify the project as well as
 handle the project's dependencies

Inside `package.json` [main field](https://docs.npmjs.com/files/package.json#main)
is the primary entry point to UnityBase application. In most case entry point
file content is

```JavaScript
const UB = require('@unitybase/ub')
UB.start()
```

## Application initialization
{@link module:@unitybase/ub~start UB.start} method of `@unitybase/ub` package will:
 - parse application config passed as `-cfg` command line parameter to `ub`
 and put parsed content to {@link class:App#serverConfig App.serverConfig}
 - create HTTP server and configure it using parameters from `httpServer` config section

and perform steps below for every HTTP thread:
 - read and validate all `*.meta` files from folders, defined in `application.domain.models`
 - for each model from `application.domain.models` folders (except ones marked as `_public_only_`)
  load a model (see below)
 - register build-in UnityBase {@link module:@unitybase/ub.module:endpoints endpoints}
 - emit {@link class:App#domainIsLoaded App.domainIsLoaded} event

## Model
### Server-side
Model is a commonJS module with logically grouped set of entities + server side code + client-side code.
In the application config (ubConfig.json) application.domain.models section contains an array of models, required by application.

Model is loaded in server thread memory(in order they defined in `application.domain.models` config section) in three steps:
 - {@link EntityNamespace entity namespaces} (global objects) are created for all `*.meta` files from this model
 - `require` is called for all `*.js` files paired with `*.meta`
 - `require` is called for model entry point defined in `package.json` placed in the model folder

To simplify a ubConfig model `package.json` can contains `config.ubmodel` section what describe the
model name and (optionally) ``"isPublic": true` for "browser-only" model

```json
"config": {
    "ubmodel": {
      "name": "UBS"
    }
  },
```

for "browser-only" model:
```json
  "config": {
    "ubmodel": {
      "name": "adminui-pub",
      "isPublic": true
    }
  },
```

For such models only path to model should be added to the `application.domain.models` section of ubConfig.json:
```json
	"application": {
        ...
		"domain": {
			"models": [
			    ...
				{
					"path": "./node_modules/@unitybase/ubs"
				},
```

### Client-side (adminUI)
Model can contains a "browser-side" part. In this case model `package.json` should contains `browser` section
what point to the model initialization script for browser

 - In case model is a published module (placed in the node_modules folder) path should be relative to the `package.json`:

 ```json
 "browser": "./public/initModel.js"
 ```

 - or for dev/prod scripts

 ```json
  "browser": {
    "dev": "./public/devEntryPoint.js"
    "prod": "./public/dist/modelBundle.js"
  }
 ```

 - In case model is in `models` folder p[ath must be absolute
 ```json
   "browser": "/clientRequire/models/TST/initModel.js",
 ```


## Endpoints
UnityBase comes with simple one-level routing.
{@link class:App#registerEndpoint App.registerEndpoint} method will add a handlers
functions for a first level of routing:

```js
/**
 * Write a custom request body to file FIXTURES/req and echo file back to client
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function echoToFile(req, resp) {
   var fs = require('fs');
   fs.writeFileSync(FIXTURES + 'req', req.read('bin'));
   resp.statusCode = 200;
   resp.writeEnd(fs.readFileSync(FIXTURES + 'req', {encoding: 'bin'}));
}
App.registerEndpoint('echoToFile', echoToFile);
```

More deep routing can be implemented inside the endpoint handler, as we
did inside build-in UnityBase {@link module:@unitybase/ub.module:endpoints endpoints}

## JSON schemas
`@unitybase/ub/public/schemas` folder contains JSON schemas for server config, entity meta file and scheduler config.
It's a good idea to configure your IDE for JSON schema support.
See for example [WebStorm IDE configuratuion manual](https://git-pub.intecracy.com/unitybase/ubjs/wikis/configuring-webstorm)




