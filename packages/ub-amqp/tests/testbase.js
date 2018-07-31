const testName = /test(.+)/

/**
 * The base class for test suite
 *
 * @class TestBase
 */
class TestBase {
  /**
   * Main function to run tests
   *
   * @param {function (string, boolean): void} cb
   * @memberof TestBase
   */
  run (cb) {
    this.tests.forEach(test => {
      let name = testName.exec(test)[1]
      try {
        this[test]()
        if (cb) {
          cb(name, true)
        }
      } catch (e) {
        console.error(e.message, e)
        if (cb) {
          cb(name, false)
        }
      }
    })
  }

  /**
   * Returns the number of tests in the suite
   *
   * @readonly
   * @memberof TestBase
   */
  get /** number */ count () {
    return (this.tests || []).length
  }

  /**
   * Returns test names in a suite as an array
   *
   * @readonly
   * @memberof TestBase
   */
  get /** Array<string> */ tests () {
    if (!this._tests) {
      /** @private */
      this._tests = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
        .filter(item => testName.test(item) && typeof this[item] === 'function')
    }
    return this._tests
  }
}

module.exports.TestBase = TestBase
