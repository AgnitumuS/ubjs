/**
 * It returns store and close params for toolbar slots,
 * or row, column, value for column slots.
 *
 * @typedef {function} TableScopedSlot
 *
 * @param cfg
 * @param {object} [cfg.store] UTableEntity store. To access store data, selected record or etc.
 * @param {function} [cfg.close] Close action just if it provided from target which opened it. $App.doCommand(showlist) already provides close action.
 * @param {object} [row] Row data
 * @param {object} [column] Column data
 * @param {*} [value] Cell value
 * @returns {VNode}
 */

/**
 * List of scoped slots. Look available slots in UTableEntity component
 *
 * @typedef {object<string, TableScopedSlot>} TableScopedSlotsConfig
 */

/**
 * Uses for inject scoped slots programmatically
 * @typedef {function} TableScopedSlotsBuilder
 *
 * @param {function} createElement For creating virtual dom nodes in slots [docs](https://vuejs.org/v2/guide/render-function.html#createElement-Arguments)
 * @returns {TableScopedSlotsConfig}
 */
