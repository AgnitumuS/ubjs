const App = require('../modules/App')

/**
 * An ACL storage implementation for entities with aclRls mixin. Mixin tasks are:
 *   - subscribe on insert:before event and:
 *     - validate input data contain only one of possible `onEntities` value and fill `valueID`
 *     - validate instanceID is passed
 *
 * @implements MixinModule
 */
module.exports = {
  initDomain: initDomainForMultitenancy,
  initEntity: initEntityForMultitenancy
}
