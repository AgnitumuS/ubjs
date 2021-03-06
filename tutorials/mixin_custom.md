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

