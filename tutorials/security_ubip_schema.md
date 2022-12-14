[[toc]]

For easy communication between external services and UnityBase server in UB>=1.9 we implement authorization based on client IP address.

## Enable IP based authorization

`UBIP` authentication method  must be added to `authMethods` parameter of application configuration

## Set who can use it

In `uba_user` entity fill `trustedIP` attribute with semicolon-separated list of trusted IP addresses for user you want to authorize using IP

## Make a request
To make an authorized request to UnityBase using IP based authorization simply add header:  
```
Authorization: UBIP yourUserName
``` 

to your HTTP requests.

## Examples

### ApacheBench
```shell script
ab.exe -v3 -H "Authorization: UBIP admin" http://127.0.0.1:888/autotest/auth
```

### Using wget to get entity content
```shell script
wget.exe --header="Authorization: UBIP admin" --post-data="[{\"entity\": \"ubm_enum\", \"method\": \"select\", \"fieldList\": [\"*\"]}]" http://localhost:888/autotest/runList
```

### Using wget to get user details
```shell script
wget.exe --header="Authorization: UBIP admin" http://localhost:888/autotest/auth
```

### Using browser side UBConnection with UBIP schema
```javascript
var conn = new UBConnection({ 
    host: '127.0.0.1:888', 
    appName: 'autotest', 
    requestAuthParams: function(conn, isRepeat){
        if (isRepeat){ 
            throw new UB.AbortError('invalid') 
        } else { 
            return Promise.resolve({authSchema: 'UBIP', login: 'admin'}); 
        } 
    }
});
conn.run({entity: 'uba_user', method: 'select', fieldList: ['ID', 'name']}).then(UB.logDebug)
```

### Using low-level UB http client (server side)
```javascript
var 
    http = require('http');
 
var req = http.request({
    host: '127.0.0.1', port: '888', path: '/autotest/runList', method: 'POST',
    headers: {Authorization: 'UBIP admin'}
});
var resp = req.end([{
    entity: 'uba_user', 
    method: 'select', 
    fieldList: ['ID', 'name'], 
    options: {start: 0, limit: 10}
}]);
```

### Using of hi-level server-side UBConnection
```javascript
var 
  SyncConnection = require('@unitybse/base').SyncConnection,
  conn1;
conn1 = new SyncConnection({
    host: 'localhost', 
    port: '888', 
    path: 'autotest', 
    keepAlive: true
});
conn1.onRequestAuthParams = function(){ 
    return {authSchema: 'UBIP', login: 'admin'} 
};
conn1.run({entity: 'ubm_navshortcut', method: 'select', fieldList: ['ID', 'code']})
```
