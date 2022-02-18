/**
 * Read array data, adds internal fields into model, sets totalRecCount for proxy
 */

Ext.define('UB.ux.data.reader.UBArray', {
  extend: 'Ext.data.reader.Array',
  alias: 'reader.ubarray',

  /**
   * TODO - this actually need only for __totalRecCount support. Remove in future
   *
   * @override
   * @param data
   * @returns {*}
   */
  readRecords: function (data) {
    if (!Ext.isDefined(this.proxy.totalRecCount) && Ext.isDefined(data.__totalRecCount)) {
      this.proxy.totalRecCount = data.__totalRecCount
    }

    const _data_ = {
      data: data.data,
      total: this.proxy.totalRecCount
    }

    return this.callParent([_data_])
  }
})
