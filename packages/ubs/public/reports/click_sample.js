
exports.reportCode = {
  /**
  * This function must be defined in report code block.
  *
  * Inside function you must:
  * 1) Prepare data
  * 2) Run method this.buildHTML(reportData); where reportData is data for mustache template
  * 3) If need create PDF run method this.transformToPdf(htmlReport); where htmlReport is HTML
  * 4) If is server side function must return report as string otherwise Promise or string
  *
  * @cfg {function} buildReport
  * @params {[]|{}} reportParams
  * @returns {Promise|Object} If code run on server method must return report data.
  * Promise object must be resolved report code
  */
  buildReport: function (reportParams) {
    let me = this
    return UB.Repository('cdn_country').attrs(['ID', 'name', 'mi_owner', 'mi_owner.name', 'mi_modifyDate']).selectAsObject({'mi_owner.name': 'ownerName'})
      .then(function (countries) {
        let data = {
          countries: countries,
          date: new Date(),
          num: 1234567.89
        }
        let HTML = me.buildHTML(data)
        return HTML
      })
  },
  onReportClick: function (e) {
    // prevent default action
    e.preventDefault()
    // get table/cell/roe based on event target
    let cellInfo = UBS.UBReport.cellInfo(e)
    // get entity from a table header dataset (in HTML templete ht contains data-entity="entityCode"
    let entity = cellInfo.table.rows[0].cells[cellInfo.colIndex].dataset.entity
    // get ID from clicked <a>. (in HTML template <a> element contains data-id="id value"
    let ID = parseInt(e.target.dataset.id, 10)
    // to get data from clicked row
    // let dataFromRow = cellInfo.row.dataset.yourAttrName
    // to get data from clicked cell
    // let cellInfo.cell.dataset.yourAttributeName
    $App.doCommand({
      cmdType: 'showForm',
      entity: entity,
      instanceID: ID
    })
  }
}
