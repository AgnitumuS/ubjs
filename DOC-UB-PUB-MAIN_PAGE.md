# <a href="https://unitybase.info/"> <img src="/favicon.ico" height="50"/></a> UnityBase

# `@unitybase/ub-pub`

 Data layer for accessing UnityBase server from Browser or NodeJS

## Connection
The main entry point is {@link connect connect} method
```
  conts UB = require('@unitybase/ub-pub')
  const conn = UB.connect({
    host: 'https://myserver.com',
    onCredentialRequired: function(conn, isRepeat){
       if (isRepeat){
           throw new UB.UBAbortError('invalid credential')
       } else {
           return Promise.resolve({authSchema: 'UB', login: 'myuser', password: 'mypassword'})
       }
    },
    onAuthorizationFail:  function(reason){
       alert(reason)
    }
  })
```

After connecting {@link UBConnection UBConnection} class cares about reconnect, data cashing,
request buffering and proper data serialization.

## Session

Connection contains information about currently logged in user.
On the server side application logic can add any custom properties,
required for application during user logon.
Such properties accessible on the client in {@link UBConnection@userData connection.userData()}}

```
  console.log(`
    Hello, ${conn.userLogin()}!
    We know what you are ${JSON.stringify(conn.userData())}
  `)
```

## Domain
{@link UBConnection#domain connection.domain} contains information about
application domain - the list of models, entities, entities attributes and methods.
Domain is already localized to the language of logged in user.

This information should be used by client application during building a UI.
For example:

```
let usersEntity = conn.domain.get('uba_user')
// localized caption of entity uba_user
console.log(usersEntity.caption)
// localized
console.log(`Input control for user name
  should be of type ${usersEntity.attributes.name.dataType}
  and with label ${usersEntity.attributes.name.caption}
`)
console.log(`Control for selecting user from list
  should use ${usersEntity.getDescriptionAttribute()}
  as a list content attribute`)

console.log(`Currently logged in user
  ${u.haveAccessToMethod('update') ? 'can' : 'can not'} edit uba_user`)
```

## Querying data

In most case client retrieve data from server using UBQL (UnityBase Query Language).

{@link UBConnection#Repository connection.Repository} fabric function is a helper
for building UBQL

```
conn.Repository('my_entity').attrs(['ID', 'code'])
 .where('code', 'in', ['1', '2', '3'])  // code in ('1', '2', '3')
 .where('name', 'contains', 'Homer'). // name like '%homer%'
 //(birtday >= '2012-01-01') AND (birtday <= '2012-01-02')
 .where('birtday', 'geq', new Date()).where('birtday', 'leq', new Date() + 10)
 .where('[age] -10', '>=', {age: 15}, 'byAge') // (age + 10 >= 15)
 .where('', 'match', 'myvalue'). // FTS query
 .selectAsObject().then(function(response){
    // here response is in [{ID: 10, code: 'value1'}, .... {}] format
 })
```

See Repository method documentation in {@link ClientRepository ClientRepository}

## Buffering

Several UI controls can simultaneously send a queries using one connection.
In this case several queries what comes in the same 20ms period of time will
be buffered and sent to the server as a single HTTP request to reduce
network bandwidth and latency.

This happens **automatically** - just write code as always and let's connection
care about network performance. Run code below in console and  look into Network -
you should see a single HTTP request

```
Promise.all([
  conn.Repository('uba_user').attrs('ID').selectAsArray(),
  conn.Repository('uba_group').attrs('ID').selectAsObject()
]).then(UB.logDebug)
```

## Caching
Server-side developer can decide what some of entities are changed rarely and
 contains small amount of data. In this case such entities are marked as cached.
Repository know (using information from Domain) about such entities and can return data
without sending HTTP request over the wire. Internally repository use
{@link module:@unitybase/cs-shared:LocalDataStorage LocalDataStorage} to filter and sort data locally.

Test it from console:
```
// first call to cached entity will get data from server
UB.Repository('ubm_enum').attrs(['ID', 'code'])
 .where('code', 'startsWith', 'I').selectAsObject()
 .then(UB.logDebug)
// second - filter data locally, even if filter condition is changed
UB.Repository('ubm_enum').attrs(['ID', 'code'])
 .where('code', 'startsWith', 'UPD').selectAsObject()
 .then(UB.logDebug)
```

## Promisified XHR
As a side effect @unitybase/ub-pub module contains "Promisified" API for HTTP request:
 - {@link module:@unitybase/ub-pub#xhr xhr}: An asynchronous HTTP request. Returns a {Promise} object
 - {@link module:@unitybase/ub-pub#get get}: simplified `xhr` for GET
 - {@link module:@unitybase/ub-pub#post post}: simplified `xhr` for POST

```
  conts UB = require('@unitybase/ub-pub')
  UB.get('https://unitybase.info').then(resp => console.log(resp.data))
```