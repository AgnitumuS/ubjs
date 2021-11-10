function getCSSVarValue (elem, varName) {
  return window.getComputedStyle(elem).getPropertyValue(varName)
}

module.exports = getCSSVarValue
