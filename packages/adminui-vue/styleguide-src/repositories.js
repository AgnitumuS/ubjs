const repos = UB => {
  return [
    UB.Repository('ubm_navshortcut').attrs(['ID', 'code', 'caption']),
    UB.Repository('uba_user').attrs(['ID'])
  ]
}
module.exports = repos
