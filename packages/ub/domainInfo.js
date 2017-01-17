/**
 * Created by v.orel on 03.01.2017.
 */
const UBDomain = require('@unitybase/base/UBDomain')
const {getDomainInfo} = process.binding('ub_app')
let domain_
/**
 * Information about application domain
 * @property {UBDomain} domainInfo
 * @memberOf App
 */
Object.defineProperty(App, 'domainInfo', {
  enumerable: true,
  get: function () {
    if (!domain_) {
      domain_ = (new UBDomain(JSON.parse(getDomainInfo())))
    }
    return domain_
  }
})
