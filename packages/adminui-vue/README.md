#Adminui Vue

This model extend UnityBase adminUI by Vue + ElementUI libraries

# What included
## JavaScript
 - Vue (exported as global Vue variable and registered in SystemJS as 'vue')
 - ElementUI (exported as global ElementUI variable and registered in SystemJS as 'element-ui')
 - UB.i18n intergated into Vue as `$ut`
 - UB injected into Vue.prototype as `$UB`

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
	"loginWindowTopLogoURL": "/models/ub-pub/img/ub-login-logo.png",
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
In case you embedd a compiled Vue app into adminUI:

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


# Contribution

## Theme
Generate variables 
```
npm run gen-el-vars
```

Edit theme/ub-el.scss. Build it:

```
npm run build:theme
```

