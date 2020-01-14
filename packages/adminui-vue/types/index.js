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

/**
 * @typedef {object} UTableColumnSettings
 *
 * @property {boolean} [sortable=false] Adds sortable icon which emits sort action on click
 * @property {boolean} [isLookup=false] If is set true will check attribute associatedEntity and loads description attribute for displayed value
 * @property {'left'|'right'|'center'} [align='left'] Align text in column
 * @property {'left'|'right'|'center'} [headerAlign='left'] Align text in column header
 * @property {number} [maxWidth] Maximum width
 * @property {number} [minWidth] Minimum width
 * @property {number} [width] Width
 * @property {boolean} [isHtml=false] If set true will render content as v-html directive
 * @property {function} [format] Format displayed value in cell. Will ignored if is set custom slot.
 * @property {number} [padding=16] column cells padding.
 */

/**
 * @typedef {UTableColumnSettings} UTableColumn
 *
 * @property {string} id Unique column property name
 * @property {string} label Column label which shows in header cells
 * @property {UBEntityAttribute} attribute Meta attribute info from UB entity schema
 */
