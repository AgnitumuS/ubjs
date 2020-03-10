[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

# UnityBase module for integration with OnlyOffice service  

The module provides the ability to view and edit MS Office documents in the integrated `OnlyOffice` editor

## Usage

### Should be installed OnlyOffice integration service
 Allowed to download from https://www.onlyoffice.com/en/connectors-request.aspx?from=downloadintegrationmenu
    
### Install package and add model to ubConfig.json   
 Install npm packages:
```
 npm i -D @unitybase/only-office --save 
```

 Add `@unitybase/only-office` as a UnityBase model into ubConfig.json:
 
```
{
  "application": {
    "domain": {
      "models": [
        {"path": "./node_modules/@unitybase/only-office"}
      ]
    }
  }
}
```
### Configure interaction with OnlyOffice server in ubConfig.json

```
{
  "uiSettings": {
    "adminUI": {
      "onlyOffice": {
	    "serverIP": "127.0.0.1"
      }
    }
  }
}
```