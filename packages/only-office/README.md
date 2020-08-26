## UnityBase module for integration with OnlyOffice service  

The module allows viewing and editing MS Office documents
 in the integrated `OnlyOffice` editor

## Usage

### Should be installed OnlyOffice integration service
 Can be downloaded from https://www.onlyoffice.com/en/connectors-request.aspx?from=downloadintegrationmenu
    
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

## Partial and environment variables

Model partial config adds `uiSettings.cspAllow` and  `uiSettings.adminUI.onlyOffice` sections.

Used environment variables:
 
| Variable name | Default | Description |
|---------------|---------|-------------|
| UB_ONLYOFFICE_URL  |         | Full URL. Example: https://our.only.office.local:4443   |
| UB_ONLYOFFICE_IP  |       | IP address of host specified in URL. Example: 192.168.2.15   |

Consider OnlyOffice server is installed on URL `https://our.only.office.local:4443`

Content Security Policy and onlyOffice parameters for adminUI should be configured to allow interaction with this URL:

```

```