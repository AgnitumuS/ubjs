<template>
  <el-popover
    ref="popover"
    placement="bottom"
    trigger="click"
    class="ub-navbar__dropdown"
    :width="400"
    @after-enter="setFocusAndSelect"
  >
    <el-tooltip
      slot="reference"
      :content="$ut('search') + ' (Ctrl + F)'"
      :enterable="false"
    >
      <el-button
        icon="fa fa-search"
        circle
      />
    </el-tooltip>

    <el-input
      ref="input"
      v-model="query"
      :placeholder="$ut('search')"
      @keyup.native.enter="doSearch"
      @keyup.native.esc="doClose"
    >
      <el-select
        slot="prepend"
        v-model="currentMode"
        class="ub-fts__select"
      >
        <el-option
          v-for="mode in modeList"
          :key="mode"
          :label="$ut('ftsConnection' + mode)"
          :value="mode"
        />
      </el-select>
      <el-button
        slot="append"
        icon="el-icon-search"
        @click="doSearch"
      />
    </el-input>

    <div class="ub-fts__period-toggle">
      <el-switch
        v-model="isPeriod"
        :active-text="$ut('searchByDateRange')"
        :inactive-text="$ut('forAllTime')"
      />
    </div>

    <el-date-picker
      v-show="isPeriod"
      v-model="period"
      class="ub-fts__date-picker"
      type="daterange"
      :start-placeholder="$ut('el').datepicker.startDate"
      :end-placeholder="$ut('el').datepicker.endDate"
      format="dd.MM.yyyy"
      :picker-options="pickerOptions"
    />
  </el-popover>
</template>

<script>
/* global $App, Ext */
const SNIPED_RE = new RegExp('Z(.*?)Z:', 'gim')

export default {
  name: 'UNavbarSearchButton',

  data () {
    return {
      query: '',
      currentMode: 'ftsDefault',
      modeList: ['ftsDefault'],
      period: null,
      isPeriod: false,
      pickerOptions: {
        shortcuts: [{
          text: this.$ut('el').datepicker.today,
          onClick (picker) {
            picker.$emit('pick', [new Date(), new Date()])
          }
        }, {
          text: this.$ut('lastMonth'),
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            start.setMonth(start.getMonth() - 1)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: this.$ut('lastQuarter'),
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            start.setMonth(start.getMonth() - 3)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: this.$ut('last6Month'),
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            start.setMonth(start.getMonth() - 6)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: this.$ut('thisYear'),
          onClick (picker) {
            const end = new Date()
            const start = new Date(new Date().getFullYear(), 0)
            picker.$emit('pick', [start, end])
          }
        }]
      }
    }
  },

  created () {
    this.initSearchModes()
  },

  mounted () {
    document.body.addEventListener('keydown', (e) => {
      const { code, ctrlKey } = e
      if (code === 'KeyF' && ctrlKey) {
        e.preventDefault()
        this.$refs.popover.doShow()
      }
    })
  },

  methods: {
    doClose () {
      this.$refs.popover.doClose()
    },

    setFocusAndSelect () {
      let i = this.$refs.input
      i.focus()
      i.select()
    },

    doSearch () {
      if (!this.query) {
        return
      }

      const fieldList = [{
        name: 'ID',
        visibility: false
      }, {
        name: 'entity',
        visibility: false
      }, {
        name: 'entitydescr',
        visibility: true,
        description: this.$ut('ftsFieldCaption')
      }, {
        name: 'snippet',
        visibility: true,
        description: this.$ut('ftsFieldSnippet'),
        format: (value, metadata, record) => {
          const entitySn = record.get('entity')
          value = this.updateSnippet(value, this.$UB.connection.domain.get(entitySn))
          if (metadata && typeof value === 'string' && (value.length > 15)) {
            metadata.tdAttr = `data-qtip="${Ext.String.htmlEncode(value)}"`
          }
          return value
        }
      }]

      let repo = this.$UB.Repository('fts_' + this.currentMode)
        .using('fts')
        .where('', 'match', this.query)
      if (this.isPeriod && this.period) {
        repo = repo.where('ftsDate', '>=', this.period[0])
          .where('ftsDate', '<=', this.period[1])
      }
      let ubql = repo.ubql()
      ubql.fieldList = fieldList

      const tab = Ext.getCmp('FullTextSearchWidgetResult')
      if (tab) {
        tab.close()
      }

      $App.doCommand({
        cmdType: 'showList',
        tabId: 'FullTextSearchWidgetResult',
        target: $App.viewport.centralPanel,
        hideActions: ['addNewByCurrent', 'addNew', 'prefilter', 'edit', 'del', 'newVersion', 'history', 'accessRight', 'audit', 'itemSelect', 'showPreview', 'commandLink', 'itemLink', 'optimizeWidth'],
        description: this.$ut('fullTextSearchWidgetResultTitle', this.query),
        cmpInitConfig: {
          disableSearchBar: true,
          onDeterminateForm: (grid) => {
            const selection = grid.getSelectionModel().getSelection()

            if (selection.length) {
              const entityCode = selection[0].get('entity').toString()
              const form = this.$UB.core.UBFormLoader.getFormByEntity(entityCode)

              if (form) {
                return {
                  formCode: form.get('code'),
                  description: form.get('description') ? this.$ut(form.get('description').toString()) : '',
                  entityName: entityCode,
                  instanceID: selection[0].get('ID')
                }
              }
            }
          }
        },
        cmdData: {
          params: [ubql]
        }
      })
      this.doClose()
    },

    /**
     * Replace attribute codes wrapped in Z..Z (lower cased in snipped) by their captions
     * @param {string} value
     * @param {UBEntity} metaObject
     * @return {*}
     */
    updateSnippet (value, metaObject) {
      if (!value) return

      // UB-1255 - complex attributes in snippet. LowerCase, multiline
      return value.replace(SNIPED_RE, (matched, attrCode) => {
        attrCode = attrCode.split('.')[0]
        // FTS returns attributes in lower case. First try to get as is. If not fount - search with lower case
        const attr = metaObject.attributes[attrCode] || metaObject.filterAttribute(a => a.code.toLowerCase() === attrCode)[0]
        return '<br/><span style="color: blue">' + (attr ? (attr.caption || attr.description) : attrCode) + '</span>&nbsp'
      })
    },

    initSearchModes () {
      const modeSet = new Set()
      this.$UB.connection.domain.eachEntity((ubEntity) => {
        if (ubEntity.hasMixin('fts')) {
          const { connectionName } = ubEntity.mixins.fts

          if (connectionName) {
            modeSet.add(connectionName)
          }
        }
      })
      for (let mode of modeSet) {
        this.modeList.push(mode)
      }
    }
  }
}
</script>

<style>
.ub-fts__select{
  width: 10em;
}

.ub-fts__period-toggle{
  padding: 10px 10px 0;
  text-align: right;
}

.ub-fts__period-toggle .el-switch__label{
  font-weight: 400;
  color: rgb(var(--info));
}

.ub-fts__period-toggle .el-switch__label.is-active {
  color: rgb(var(--primary));
}

.ub-fts__date-picker {
  width: 250px !important;
  margin-top: 10px;
  float: right;
}
</style>
