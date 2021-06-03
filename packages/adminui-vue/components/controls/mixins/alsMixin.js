/**
 * Mixin provides the following functionality:
 * methods:
 *   $_isReadOnlyByALS - check that exist rule for disable field update
 *   $_isRequiredByALS - check that exist rule to make field mandatory/required
 * To make this mixin work use it on form as:
 * const alsMixin = require('@adminui-vue/components/controls/mixins/alsMixin')
 * mixins: [alsMixin]
 */
module.exports = {
  methods: {
    $_isReadOnlyByALS (attributeName) {
      const { alsInfo } = this.$store.state
      if (alsInfo) {
        if (alsInfo[attributeName]) {
          return alsInfo[attributeName].indexOf('U') === -1 // if exist als rule check for possible update
        }
        return Object.keys(alsInfo).length > 0 // if exist any als rule
      }
      return false // if not exist als mixin
    },

    $_isRequiredByALS (attributeName) {
      const { alsInfo } = this.$store.state
      if (alsInfo && alsInfo[attributeName]) {
        return alsInfo[attributeName].indexOf('M') > -1
      }
      return false
    }
  }
}
