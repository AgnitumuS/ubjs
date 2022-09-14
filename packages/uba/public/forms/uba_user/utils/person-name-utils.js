const UB = require('@unitybase/ub-pub')

const lastNameFirst = ['uk', 'ru', 'az', 'ka', 'uz'].indexOf(UB.connection.appConfig.defaultLang)

module.exports = {
  buildFullName ({ firstName, middleName, lastName }) {
    const parts = lastNameFirst
      ? [lastName, firstName, middleName]
      : [firstName, middleName, lastName]
    return parts.filter(part => !!part).join(' ')
  }
}
