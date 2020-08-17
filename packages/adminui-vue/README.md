#Adminui Vue

This model extends UnityBase adminUI by Vue + ElementUI libraries

# What included
## JavaScript
 - Vue (exported as global Vue variable and registered in SystemJS as 'vue')
 - ElementUI (exported as global ElementUI variable and registered in SystemJS as 'element-ui')
 - UB.i18n integrated into Vue as `$ut`
 - UB injected into Vue.prototype as `$UB`
 - `i18n` filter available in vue templates. Lines below produce the same output
 ```vue
  <div> {{ 'uba_user' | i18n}} </div>
  <div> {{ $ut('uba_user') }} </div>
```

## CSS
 - `dist/adminui-vue.css` theme include normalize.css && modified element-theme-chalk
 - theme will add border radius to ExtJS form fields, so Ext based forms looks like Elements based forms

## Views
### Modern login page

Placed in `/views/ub-auth.html`

To use it in `adminUI` based apps in ubConfig
```
"uiSettings": {
  "adminUI": {
	"loginWindowTopLogoURL": "/models/ub-pub/img/login-logo.svg",
	"loginURL": "/models/adminui-vue/views/ub-auth.html",
  ...
```

# Usage
## adminUI based app
 For adminUI based application just add a `@unitybase/adminui-vue` in the domain.models section of config
 after `adminui-pub`

```
"application": {
  "domain": {
    "models": [
		...
		{
			"path": "./node_modules/@unitybase/ub-pub"
		},
		{
			"path": "./node_modules/@unitybase/adminui-pub"
		},
		{
			"path": "./node_modules/@unitybase/adminui-reg"
		},
		{
			"path": "./node_modules/@unitybase/adminui-vue"
		}
		..
```

## Stand-alone app
See `/views/ub-auth.html` for sample

### Compiled Vue app
In case you embed a compiled Vue app into adminUI:

- define output section in the webpack config to prevent loading modules twice:
```
  output: {
    path: path.join(__dirname, 'dist'),
    library: 'YUR_LIB_NAME',
    libraryTarget: 'var',
    filename: 'your-lib-entry-point.min.js',
    publicPath: '/clientRequire/YOUR_MODULE_NAME/dist/'
  },
```

- define externals section in the webpack config to prevent loading modules twice:

```
  externals: {
    lodash: '_',
    '@unitybase/ub-pub': 'UB',
    '@unitybase/adminui-pub': '$App',
    'vue': 'Vue',
    'element-ui': 'ElementUI',
  },
```

# Contribution
## Debugging
### ElementUI in debug mode 
 For better debugging experience we recommend rebuilding element-ui in development mode.
 Use `element-ui` brunch for a version specified in `adminui-vue` package.json (2.5.4 in a moment of writing this manual)
 
 ```bash
  git clone https://github.com/ElemeFE/element.git
  cd element
  git checkout v2.5.4
  npm i
  npm run clean && npm run build:file && npx webpack --config build/webpack.conf.js --mode development
```

 and copy /lib/index.js into your project. In my case project is located in `~/dev/ubjs/apps/autotest`  
 
 ```bash
 cp ./lib/index.js ~/dev/ubjs/apps/autotest/node_modules/element-ui/lib
 ```

### Prevent debugger to dig into vue sources
 While debugging a components source you can prevent debugger to dig into vue sources.
 
 To do this in Source tab of debugger press F1 to open `Preferences`,
 select `Blackboxing` on the left and add a pattern `vue.common.dev.js$`.
 
 After this `Step into` (F11) will skip vue sources
   
## Theme
Generate variables 
```
npm run gen-el-vars
```

Edit theme/ub-el.scss. Build it:

```
npm run build:theme
```
