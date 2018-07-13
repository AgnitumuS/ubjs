const _ = require('lodash')

const __i18n = {
  monkeyRequestsDetected: 'Your request has been processed, but we found that it is repeated several times. Maybe you key fuse?'
}
const FORMAT_RE = /{(\d+)}/g

function domainBasedLocalization (localeString) {
  // $App is accessible only inside adminUI
  if (typeof $App === 'undefined') return localeString

  if ($App.domainInfo == null) {
    // Domain is not loaded yet, cannot resolve string to entity or entity attribute's name
    return localeString
  }

  // Try to resolve string as entity name or entity attribute name
  let parts = localeString.split('.')

  if (parts.length > 2) {
    // String contain more than one dots, that is not what can be resolved to entity or entity attribute name
    return localeString
  }

  let entity = $App.domainInfo.entities[parts[0]]
  if (!entity) {
    // First part shall be a valid entity name
    return localeString
  }

  if (parts.length === 1) {
    // A valid entity name, resolve to the entity's caption
    // Remember in __i18n for performance
    __i18n[localeString] = entity.caption
    return entity.caption
  }

  let attr = entity.attributes[parts[1]]
  if (!attr) {
    // Expecting the second part to be a valid entity attribute name
    return localeString
  }

  // A valid entity attribute name, resolve to the entity attribute's caption
  // Remember in __i18n for performance
  __i18n[localeString] = attr.caption
  return attr.caption
}

/**
 * see docs in ub-pub main module
 * @private
 * @param {String} localeString
 * @param {...*} formatArgs Format args
 * @returns {*}
 */
module.exports.i18n = function i18n (localeString, ...formatArgs) {
  if (localeString == null) return localeString
  let res = __i18n[localeString]
  res = res || domainBasedLocalization(localeString)
  if (formatArgs && formatArgs.length && (typeof res === 'string')) {
    return res.replace(FORMAT_RE, function (m, i) {
      return formatArgs[i]
    })
  } else {
    return res
  }
}

/**
 * see docs in ub-pub main module
 * @private
 * @param {Object} localizationObject
 * @returns {Object} new i18n object
 */
module.exports.i18nExtend = function i18nExtend (localizationObject) {
  return _.merge(__i18n, localizationObject)
}
