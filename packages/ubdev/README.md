# Developer tools for UnityBase

** THIS MODEL IS NOT REQUIRED YET ** entity editor is moved into UMB model

## Usage
```bash
  npm i @unitybase/ubdev
```

 add `@unitybase/ubdev` to the application models list (after @unitybase/adminui-vue)

```json
"application": {
  "domain": {
	"models":
	    ....
	    {
		"path": "./node_modules/@unitybase/adminui-vue"
	    },{
	        "path": "./node_modules/@unitybase/ubdev"
	    },
```


## Features
 - **MOVED INTO UMB model** Entity editor (available on double-click on entity inside ER diagram)
 - Work In Progress