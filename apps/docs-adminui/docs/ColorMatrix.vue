<template>
  <div>
    <div
      v-for="table in colorMatrixParsed"
      :key="table.title"
    >
      <h1>{{ table.title }}</h1>
      <table class="color-matrix-table">
        <tr v-for="row in table.rows">
          <td v-for="cell in row">
            <color-matrix-cell :cell-data="cell" />
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>

/**
 * @typedef {object} ColorMatrixRule
 * @property {string[]} hs
 * @property {string[]} l
 */

/**
 * @typedef {object} ColorMatrix
 * @property {string} title Table title
 * @property {ColorMatrixRule[]} rules Set of colors that can be combined
 * @property {ColorMatrixRendererType} ruleType
 */

/**
 * @typedef {('label'|'text'|'control'|'border'|'background')} ColorMatrixRendererType
 *
 * Type of renderer for cells in color matrix
 */

/**
 * @typedef {object} ColorMatrixParsedCell
 *
 * @property {string} data
 * @property {ColorMatrixRendererType} type
 */

/**
 * @typedef {ColorMatrixParsedCell[]} ColorMatrixParsedRow
 */

/**
 * @typedef {object} ColorMatrixParsedTable
 *
 * @property {string} title
 * @property {ColorMatrixParsedRow[]} rows
 */

import ColorMatrixCell from './ColorMatrixCell.vue'

const hsStates = [
  'hs-primary',
  'hs-success',
  'hs-warning',
  'hs-danger'
]

const lStates = [
  'l-state-default',
  'l-state-hover',
  'l-state-active',
  'l-state-disabled'
]

const controlRules = [{
  hs: ['hs-control', ...hsStates],
  l: lStates
}]

const textRules = [{
  hs: hsStates,
  l: lStates
}, {
  hs: ['hs-text'],
  l: [
    'l-text-default',
    'l-text-label',
    'l-text-description',
    'l-text-disabled',
    'l-text-inverse'
  ]
}]

const borderRules = [{
  hs: ['hs-border', ...hsStates],
  l: [
    'l-input-border-default',
    'l-input-border-hover',
    'l-input-border-disabled',
    'l-layout-border-default',
    'l-layout-border-light'
  ]
}]

const backgroundRules = [{
  hs: ['hs-background', ...hsStates],
  l: [
    'l-background-default',
    'l-background-active',
    'l-background-inverse'
  ]
}]

export default {
  components: {
    ColorMatrixCell
  },

  data () {
    return {
      /**
       * @type {ColorMatrix[]}
       */
      matrixData: [{
        title: 'Controls, buttons, icons... etc.',
        rules: controlRules,
        ruleType: 'control'
      }, {
        title: 'Text',
        rules: textRules,
        ruleType: 'text'
      }, {
        title: 'Borders',
        rules: borderRules,
        ruleType: 'border'
      }, {
        title: 'Backgrounds',
        rules: backgroundRules,
        ruleType: 'background'
      }]
    }
  },

  computed: {
    /**
     * @returns {ColorMatrixParsedTable[]}
     */
    colorMatrixParsed () {
      return this.matrixData
        .map(table => {
          /**
           * @type {string[]}
           */
          const availableTableHs = table.rules.flatMap(rule => rule.hs)
          const firstRow = [{
            data: '',
            type: 'label'
          }]
          for (const hs of availableTableHs) {
            firstRow.push({
              data: hs,
              type: 'label'
            })
          }

          return {
            title: table.title,
            rows: table.rules.reduce(
              (rows, rule) => {
                for (const lightness of rule.l) {
                  const firstCell = {
                    data: lightness,
                    type: 'label'
                  }
                  const row = [firstCell]
                  for (const hs of availableTableHs) {
                    const cell = {
                      data: rule.hs.includes(hs)
                        ? `hsl(var(--${hs}), var(--${lightness}))`
                        : '',
                      type: table.ruleType
                    }
                    row.push(cell)
                  }
                  rows.push(row)
                }
                return rows
              },
              [firstRow]
            )
          }
        })
    }
  }
}
</script>

<style>
.color-matrix-table {
  border-collapse: collapse;
}

.color-matrix-table td{
  border: 1px solid hsl(var(--hs-border), var(--l-layout-border-default));
  color: hsl(var(--hs-text), var(--l-text-default));
  background: hsl(var(--hs-background), var(--l-background-inverse));
  padding: 10px;
}
</style>
