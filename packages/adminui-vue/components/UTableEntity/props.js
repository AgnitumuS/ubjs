module.exports = {
  /**
   * If set table will be have static height.
   * Table container will be have own scroll and fixed header.
   */
  height: [Number, String],

  /**
   * If set table will be have maxHeight.
   * Table container will be have own scroll and fixed header.
   */
  maxHeight: [Number, String],

  /**
   * Id of column which will stack when we scroll table by horizontal.
   */
  fixedColumnId: String,
  /**
   * Overrides the record selection event. That is, double click or enter
   * @type {function({ID: Number, row: Object, close: function})}
   */
  onSelectRecord: Function
}
