# OpenID Connect authorization

This UnityBase model implements authorization over OpenID Connect.
For adminUI "OpenIDConnect" should be added to the "authenticationMethods".

Configuration:

```
"security": {
  "authenticationMethods": ["UB", "OpenIDConnect"]
},
...
"application": {
    ...,
    "customSettings": {
        ...,
        "externalServerUrl": External url address. You should set this address if server work over proxy server
    }
}

```

Usage:

```
      const openID = require('@unitybase/openid-connect')
      let oIdEndPoint = openID.registerEndpoint('openIDConnect')
      oIdEndPoint.registerProvider('Google', {
        authUrl: 'https://accounts.google.com/o/oauth2/auth',
        tokenUrl: 'https://accounts.google.com/o/oauth2/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v1/userinfo',
        userInfoHTTPMethod: 'GET',
        scope: 'openid',
        nonce: '123',
        response_type: 'code',
        client_id: '350085411136-lpj0qvr87ce0r0ae0a3imcm25joj2t2o.apps.googleusercontent.com',
        client_secret: 'dF4qmUxhHoBAj-E1R8YZUCqA',
        getOnFinishAction: function (response) {
          return 'opener.UB.view.LoginWindow.onFinishOpenIDAuth(' + JSON.stringify(response) + '); close();'
        },
        getUserID: function(userInfo) {
          let inst = UB.Repository('uba_user').attrs(['ID'])
             .where('[name]', '=', userInfo.id).select()
          return inst.eof ? null : inst.get('ID')
        }
      })

```