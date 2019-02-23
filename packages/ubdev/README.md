# Developer tools for UnityBase

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
 - Entity editor (available on double-click on entity inside ER diagram)
 - Work In Progress