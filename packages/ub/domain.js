/**
 * Created by v.orel on 03.01.2017.
 */
const UBDomain = require('@unitybase/base/UBDomain')
const {getDomainInfo} = process.binding('ub_app')
let domain_
Object.defineProperty(App, 'domain_', {
  enumerable: true,
  get: function () {
    if (!domain_) {
      domain_ = (new UBDomain(JSON.parse(getDomainInfo())))
    }
    return domain_
  }
})

