[[toc]]

##  Introduction

Starting from UB@5.22.9 administrator (user with `Admin` role) can change some application parameters using  shortcut 
`Administration > UI -> Settings`.

In 5.22.9 following `uiSetting.adminUI` parameters can be changed:
  - loginWindowTopLogo
  - sidebarLogo
  - sidebarLogoBig
  - applicationTitle
  - supportMailTo
  - customTheme

About `customTheme` - a feature for customising CSS see paragraph below

## Prepare app to be customization ready
Feature is enabled in case special customer model with name `STNGS` is found in domain.

> server automatically adds `STNGS` model into `application.domain.customerModels` in case it found folder `$UB_APPDATA/cmodels/STNGS`

For application what uses [UnityBase lifecycle scripts](https://unitybase.info/api/server-v5/tutorial-production_env.html#lifecycle)
`ub-deploy` etc. folder and files for `STNGS` model is created automatically.

For whom who uses Windows or Docker-based setup `STNGS` folder should be created manually:

```shell
# add STNGS model for user settings if not already added
if [ ! -d "$UB_APPDATA/cmodels/STNGS" ]; then
  mkdir -p "$UB_APPDATA"/cmodels/STNGS/public
  cat > "$UB_APPDATA"/cmodels/STNGS/package.json << EOF
{
   "name": "STNGS",
   "version": "1.0.0",
   "description": "Application settings, what can be customized by user",
   "repository": "",
   "config": {
     "ubmodel": {
       "name": "STNGS"
     }
   },
   "public": false,
   "main": "index.js",
   "author": "UnityBase team (https://unitybase.info)",
   "license": "(GPL-3.0 OR LGPL-3.0 OR MPL-2.0)"
 }
EOF
  touch "$UB_APPDATA"/cmodels/STNGS/index.js
  echo "{}" >> "$UB_APPDATA"/cmodels/STNGS/ubConfig-partial.json
  chown -R unitybase:unitybase "$UB_APPDATA"
fi
```

## Implementation details

Customization feature is implemented using partial config `ubConfig-partial.json` from STNGS model.
Server-side config merging mechanism apply this partial after all other partials are merged into main ubConfig,
so STNGS model have a priority.

In fact customization can be added for any settings, even for parameters outside of `uiSetting` section.
To do this should be implemented:
  - UI form for setting - see out implementation in `@unitybase/ubm/public/forms/ubm_desktop-uiSettings-fm.vue`
  - server side method what modify a STNGS partial - see `changeUISettings` method in `@unitybase/ubm/ubm_desktop.js`

## Custom theme

Before 5.22.9 interface CSS usually customized by injecting a custom CSS rules from inside `public/initModel.js` script of some model.

In 5.22.9 we add a *theme registration* feature, so now administrator can select any of available `themes`.

Each model can expose a list of themes it provides by adding file `ui-themes.json` with provided themes description
and one or both JS and CSS theme parts.

Example of `ui-themes.json` (see @unitybase/adminui-vue/ui-themes.json):
```json
[{
"name": "adminui-vue_blue",
"description": "Blue theme (experimental)",
"css": "/models/adminui-vue/uithemes/blue/blue-theme.css",
"js": ""
}]
```

Index page [generator](https://git-pub.intecracy.com/unitybase/ubjs/-/blob/master/packages/adminui-reg/index.html.js)
will read value of `uiSetting.adminUI.customTheme` parameter from config, and if it is defined, inject theme css/js at
the end of [index page](https://git-pub.intecracy.com/unitybase/ubjs/-/blob/master/packages/adminui-pub/index.mustache). 

UI Settings form `Administration > UI -> Settings` display a list of available themas and allows change it in runtime.