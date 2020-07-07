const UB = require('@unitybase/ub')
console.log('tstm loaded')
module.exports = {
  /**
   * test require
   * @param {string} a
   */
  myFunc: function (a) {},
  throwStackTestInner: function () {
    return UB.Repository('tst_blob').attrs('ID').where('ID', '=', undefined).select()
  }
}
