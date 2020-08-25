var UB = require('@unitybase/ub-pub')
var _ = require('lodash')

UB.connect({
  host: window.location.origin,
  allowSessionPersistent: true,
  // path: window.location.pathname,
  onCredentialRequired: function (conn, isRepeat) {
    return isRepeat
      ? Promise.reject(new UB.UBAbortError('invalid password for user admin'))
      : Promise.resolve({ authSchema: 'UB', login: 'admin', password: 'admin' })
  },
  onAuthorizationFail: function (reason) {
    window.alert(reason)
  }
}).then(function (conn) {
  window.$conn = conn
  conn.get('stat').then(function (statResp) {
    document.getElementById('ubstat').innerText = JSON.stringify(statResp.data, null, '\t')
  }).catch(function (reason) {
    document.getElementById('ubstat').innerText = reason
  })

  if (conn.domain.has('ubm_enum')) {
    let entity = conn.domain.get('ubm_enum')
    conn.Repository('ubm_enum')
      .attrs(
        entity.filterAttribute({ defaultView: true }).map(function (attr) {
          return attr.code
        })
      )
      .selectAsArray()
      .then(function (data) {
        var tmpl = _.template(document.getElementById('repo-template').innerHTML)
        data.resultData.entity_caption = entity.caption
        document.getElementById('ubnav').innerHTML = tmpl(data.resultData)
      })
  }

  let b = document.getElementById('getODSFile')
  b.addEventListener('click', function () {
    let entity = conn.domain.get('ubm_enum')
    let query = conn.Repository('ubm_enum')
      .attrs(
        // entity.filterAttribute({defaultView: true}).map(function(attr){
        //     return attr.code;
        // })
        Object.keys(entity.attributes)
      ).ubql()
    conn.xhr({ method: 'POST', url: 'ubql', data: [query], responseType: 'blob', headers: { 'Content-Type': 'application/vnd.oasis.opendocument.spreadsheet' } })
      .then(function (res) {
        saveBlob(res.data, 'result.ods')
      })
  })
})

var saveBlob = (function () {
  let a = document.createElement('a')
  document.body.appendChild(a)
  a.style = 'display: none'
  return function (blob, fileName) {
    let url = window.URL.createObjectURL(blob)
    a.href = url
    a.download = fileName
    a.click()
    window.URL.revokeObjectURL(url)
  }
}())
