[[toc]]

# Write your own mixin

## TL-DR
  - create a js file what exports 2 function
```javascript
module.exports = {
  initDomain: null,
  initEntity: initEntityForMyMixin
}
/**
 * My mixin descriptin
 * @param {UBEntity} entity Entity for initialization
 * @param {UBEntityMixin} mixinCfg Mixin configuration from entity metafile
 */
function initEntityForTestMixin(entity, mixinCfg) {
  // verify mixinCfg
  // add methods / events etc for entity
}
```

 - in model entrypoint register a mixin
```javascript
const UB = require('@unitybase/ub')
const myMixinImpl = require('./myMixin.js')
UB.registerMixinModule('myMixin', myMixinImpl)
```

 - now new mixin can be used in entity *.meta file as such
```json
"mixins": {
  "myMixin": {
    "mixinCfgParam": "param value"
  }
}
```

## Implementation tips
### Logging with log level
Wrap methods in logEnter / logLeave block to get a better logging + time profile for free
```javascript
function wrapEnterLeave (enterText, methodImpl) {
  return function enterLeave(ctx) {
    App.logEnter(enterText)
    try {
      methodImpl(ctx)
    } finally {
      App.logLeave()
    }
  }
}
// use pattern below for method enter text - the same as native method do
entytModule.select = wrapEnterLeave(`method(${MIXIN_NAME}) ${entity.name}.select`, myMixinSelect)
entityModule.entity.addMethod('select')
function myMixinSelect(cxt) {
  console.debug('some debug (shifted by recursion level automatically)')
}
```

The logging will be (first and last lines are added by App.logEnter / App.logLeave, all console.* output from inside `select` method
are shifted by recursion level)
```shell
20210314 09224807  "  +    	method(myMixin) my_entity.select
20210314 09224807  " debug 		some debug (shifted by recursion level automatically)
20210314 09224807  "  -    	00.005.124
```

### Events order

 Mixin's initialization are executed AFTER all models entry point is evaluated, so if some model code adds an 
event handler 
```javascript
// my_entity.js
me.on('insert:before', function myEntityInsertBefore(ctx) {
  console.debug('my_entity insert:before')
})
```

handler `insert:before`, added by mixin entity initialization function will be executed after `myEntityInsertBefore`.

To add an event handler what executed BEFORE model handlers use a `prependListener` instead of `on` (or even both ot them if needed) 
```javascript
// myMixin.js
function initEntityForMyMixin(entity, mixinCfg) {
  /** @type {EntityNamespace} */
  const entityModule = global[entity.name]
  function myMixinInsert(ctx) {
    console.debug('insert called')
  }
  entityModule.insert = wrapEnterLeave(`method(${MIXIN_NAME}) ${entity.name}.insert`, myMixinInsert)
  entityModule.entity.addMethod('insert')
  entityModule.prependListener('insert:before', (ctx) => {
    console.debug('myMixin insert:before (called BEFORE myEntityInsertBefore)')
  })
  entityModule.on('insert:before', (ctx) => {
    console.debug('myMixin insert:before (called AFTER myEntityInsertBefore)')
  })
  
}
```

in the sample above execution of `insert` method produce such log output:
```shell
20210314 09224807  "  +    ubql?rq=my_entity.insert&uitag=frm-my_entity
20210314 09224807  " http  	127.0.0.1 -> POST ubql?rq=my_entity.insert&uitag=frm-my_entity
20210314 09224807  " debug 	myMixin insert:before (called BEFORE myEntityInsertBefore)
20210314 09224807  " debug 	my_entity insert:before
20210314 09224807  " debug 	myMixin insert:before (called AFTER myEntityInsertBefore)
20210314 09224807  "  +    	method(myMixin) my_entity.insert
20210314 09224807  " debug 		some debug (shifted by recursion level automatically)
20210314 09224807  "  -    	00.005.124
20210314 09224807  "  +    	method(TubAuditMixin) my_entity.afterinsert
.....
20210314 09224807  "  -    	00.000.656
20210314 09224807  " DB    	Commit connection "main" in 123us
20210314 09224807  " http  	127.0.0.1 <- 200
20210314 09224807  "  -    00.009.560
```

### Debugging log performance
In production mode `Debug` log level is usually disable, so for debug output prefer
```javascript
console.debug('some debug', i) // fast in case debug log level is off
```
instead of template string
```javascript
console.debug(`some debug ${i}`) // calculate a string from template before pass it as argument even if debug is off
```

### Debugging experience
For better debugging experience try to avoid anonymous functions and lodash.
Most Lodash functions creates a deep call stack.
Anonymous functions are shown with pure names in call stack.    
```javascript
// my_entity.js
me.on('insert:before', function myEntityInsertBefore(ctx) {
  console.debug('my_entity insert:before')
})
```