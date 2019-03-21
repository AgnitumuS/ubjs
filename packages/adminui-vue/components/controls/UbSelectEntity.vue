<template>
  <!-- Without `position: relative` menu items floats to the right side of screen (check on storybook) -->
  <div
    style="position: relative"
    :title="rowIsDeleted ? $ut('elementIsNotActual') : ''"
  >
    <el-select
      ref="selector"
      v-bind="$attrs"
      :value="value"
      :loading="loading"
      filterable
      remote
      :remote-method="remoteMethod"
      :disabled="loading || disabled"
      :automatic-dropdown="false"
      class="ub-select-entity"
      style="width: 100%"
      v-on="$listeners"
      @keydown.native.alt.e.prevent="handleEditItem"
      @keyup.native.exact.f9="handleShowDictionary"
      @keyup.native.alt.backspace="handleClearClick"
    >
      <i
        v-if="rowIsDeleted"
        slot="prefix"
        class="fa fa-ban el-input__icon"
      />
      <template>
        <el-option
          v-for="item in availableOptions"
          :key="item[primaryColumn]"
          :value="item[primaryColumn]"
          :label="item[displayValue]"
          :disabled="item.removed"
        />
        <el-row
          v-if="morePagesAvailable"
          type="flex"
          justify="end"
          style="padding: 0 20px"
        >
          <el-button
            type="text"
            :disabled="loading"
            @click="fetchNextPage"
          >
            {{ $ut('more') }}
          </el-button>
        </el-row>
      </template>
    </el-select>
    <div
      class="ub-select-entity__menu-button"
      style="pointer-events: none;"
    >
      <div
        class="ub-icon-menu"
        @click="toggleDropDown"
      >
        <i class="el-icon-arrow-down" />
      </div>
      <el-popover
        v-if="rowActions && rowActions.length"
        v-model="popoverVisible"
        placement="bottom-end"
        :disabled="disabled"
        trigger="click"
      >
        <el-table
          :data="rowActions"
          :show-header="false"
          @row-click="onActionClick"
        >
          <el-table-column
            property="caption"
            width="270"
          >
            <template slot-scope="scope">
              <div
                :style="scope.row.enabled === undefined || scope.row.enabled ? '' : 'opacity: 0.5'"
                style="cursor: pointer"
                class="ub-noselect"
              >
                <i :class="scope.row.icon" />
                <span style="margin-left: 10px">{{ scope.row.caption }}</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div
          ref="menuButton"
          slot="reference"
        >
          <div class="ub-icon-menu">
            <i class="el-icon-menu" />
          </div>
        </div>
      </el-popover>
    </div>
  </div>
</template>

<style>
  .ub-select-entity .el-input__inner {
    cursor: text;
  }
</style>

<script>
require('../../css/ub-select.css')
const PAGE_SIZE = 20

module.exports = {
  name: 'UbSelectEntity',
  props: {
    value: {
      type: [String, Number]
    },
    _nonObs: {
      type: Object,
      default: function () { return { a: 1 } }
    },
    entityName: {
      type: String,
      required: true
    },
    // repeat it here and pass down to ElEdit because we need to disable toggle & actions
    disabled: Boolean,
    useOwnActions: {
      type: Boolean,
      default () {
        return false
      }
    },
    actions: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      primaryColumn: 'ID',
      waitingNewEntity: false,
      morePagesAvailable: false,
      /** items witch are selected (single item in case multiple=false) */
      selectedItems: [],
      /** page n data loaded from remote */
      dataPage: [],
      dataPageNum: 0,
      prevQuery: null,
      initialItem: null,
      toggledManually: false,
      items: [],
      handleEntityChanged: id => {
        if (this.value === id) {
          this.fetchSelectedItems(id)
        } else {
          this.items = []
        }
      },
      handleEntityInserted: id => {
        if (this.waitingNewEntity) {
          this.$refs.selector.$emit('input', id)
          this.waitingNewEntity = false
        }
      },
      loading: false,
      popoverVisible: false
    }
  },
  methods: {
    fetchDataPage (query) {
      return this.$UB.Repository(this.entityName)
        .attrs(this.primaryColumn, this.displayValue)
        .whereIf(query, this.displayValue, 'like', query)
        .start(this.dataPageNum * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .selectAsObject().then(data => {
          this.morePagesAvailable = (data.length === PAGE_SIZE)
          this.dataPage = data
        }).finally(() => {
          this.loading = false
        })
    },
    remoteMethod (query) {
      // if focused on Tab ElSelect fires Change (input debounce should not fire on Tab there)
      // so in case query here is equal to selectedItems[0] displayValue do nothing
      if (this.selectedItems.length && this.selectedItems[0][this.displayValue] === query) return
      this.prevQuery = query
      this.dataPageNum = 0
      return this.fetchDataPage(query)
    },
    fetchSelectedItems () {
      this.loading = true
      return this.$UB.Repository(this.entityName)
        .attrs(this.primaryColumn, this.displayValue)
        .where(this.primaryColumn, '=', this.value)
        .selectAsObject().then(data => {
          this.selectedItems = data
        }).finally(() => {
          this.loading = false
        })
    },
    fetchNextPage () {
      this.dataPageNum++
      return this.fetchDataPage(this.prevQuery)
    },
    toggleDropDown () {
      let elSelect = this.$refs.selector
      if (elSelect.selectDisabled) return
      if (this.toggledManually) { // el-select lost focus ant dropdown disappear
        this.toggledManually = false
      } else {
        this.toggledManually = true
        if (!this.dataPage.length) {
          this.loading = true
          this.remoteMethod()
            .finally(() => {
              this.loading = false
              elSelect.visible = !elSelect.visible
            })
        } else {
          elSelect.visible = !elSelect.visible
        }
      }
    },
    handleShowDictionary () {
      this.$UB.core.UBApp.doCommand({
        entity: this.entityName,
        cmdType: 'showList',
        isModal: true,
        sender: this,
        selectedInstanceID: this.value,
        onItemSelected: ({ data }) => {
          this.$refs.selector.$emit('input', data[this.primaryColumn])
        },
        cmdData: {
          params: [{
            entity: this.entityName,
            method: 'select',
            fieldList: '*'
          }]
        }
      })
    },
    handleEditItem () {
      if (this.value) {
        this.$UB.core.UBApp.doCommand({
          cmdType: this.$UB.core.UBCommand.commandType.showForm,
          entity: this.entityName,
          isModal: true,
          instanceID: this.value
        })
      }
    },
    handleClearClick (event) {
      this.$refs.selector.handleClearClick(event)
    },
    onActionClick (row, event) {
      if (row.enabled === undefined || row.enabled) {
        row.handler.fn.call(row.handler.scope ? row.handler.scope : this, event)
        this.popoverVisible = false
      }
    }
  },
  computed: {
    entity () {
      return this.$UB.connection.domain.get(this.entityName, true)
    },
    /** available options - intersection of selectedItems and dataPage */
    availableOptions () {
      return this.dataPage.concat(
        this.selectedItems.filter(i => !this.dataPage.some(dpI => dpI[this.primaryColumn] === i[this.primaryColumn]))
      )
    },
    rowIsDeleted () {
      let i = this.selectedItems[0]
      return i && i['mi_deleteDate'] && (i['mi_deleteDate'] < new Date())
    },
    rowActions () {
      return this.useOwnActions ? this.actions : this.defaultActions.concat(this.actions)
    },
    defaultActions () {
      return [{
        name: 'ShowLookup',
        caption: this.$ut('selectFromDictionary') + ' (F9)',
        icon: 'fa fa-table',
        handler: {
          fn: this.handleShowDictionary
        }
      },
      {
        name: 'Edit',
        caption: this.$ut('editSelItem') + ' (Alt+E)',
        icon: 'fa fa-pencil-square-o',
        enabled: !!this.value,
        handler: {
          fn: this.handleEditItem
        }
      },
      {
        name: 'Add',
        caption: this.$ut('addNewItem'),
        icon: 'fa fa-plus-circle',
        handler: {
          fn () {
            this.waitingNewEntity = true
            this.$UB.core.UBApp.doCommand({
              cmdType: this.$UB.core.UBCommand.commandType.showForm,
              entity: this.entityName,
              isModal: true
            })
          }
        }
      },
      {
        name: 'Clear',
        caption: this.$ut('clearSelection') + ' (Alt+BackSpace)',
        icon: 'fa fa-eraser',
        enabled: !!this.value,
        handler: {
          fn: this.handleClearClick
        }
      }]
    },
    displayValue () {
      return this.entity.descriptionAttribute
    }
  },
  destroyed () {
    this.$UB.connection.removeListener(`${this.entityName}:changed`, this.handleEntityChanged)
    this.$UB.connection.removeListener(`${this.entityName}:insert`, this.handleEntityInserted)
  },
  watch: {
    value (val, oldVal) {
      // TODO multiple
      if (!val) {
        this.selectedItems = []
      } else if (!this.selectedItems.length || val !== this.selectedItems[this.primaryColumn]) {
        // check selected item already in dataPage
        let item
        if (this.dataPage.length) {
          item = this.dataPage.find(e => e[this.primaryColumn] === val)
          if (item) {
            this.selectedItems = [item]
          }
        }
        // not in dataPage yet - fetch from remote
        if (!item) this.fetchSelectedItems()
      }
    }
  },
  mounted () {
    this.$UB.connection.on(`${this.entityName}:changed`, this.handleEntityChanged)
    this.$UB.connection.on(`${this.entityName}:insert`, this.handleEntityInserted)

    // prevent menu button to got focus by Tab
    if (this.$refs.menuButton) this.$refs.menuButton.setAttribute('tabindex', -1)
  }
}
</script>
