/**
 * Normalize of the string to match X.YY.ZZ version pattern
 *
 * @param {string} version - version in semver format
 * @returns {string} - normalized version
 */
module.exports = function normalizeVersion (version) {
  const versionPattern = (x, i) => {
    let r = x
    if (i > 0) {
      const leadingDigits = x.replace(/\D.*/, '')
      r = `${leadingDigits.length < 2 ? ('00' + leadingDigits).slice(-2) : leadingDigits}${x.substring(leadingDigits.length)}`
    }
    return r
  }

  let r = version
  const vv = version.split('.')

  // version contain three part (major.minor.patch)
  if (vv.length >= 3) {
    r = vv.slice(0, 3).map(versionPattern).concat(vv.slice(3)).join('.')
  }
  return r
}
