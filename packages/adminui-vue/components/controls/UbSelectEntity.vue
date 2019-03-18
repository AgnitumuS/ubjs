<template>
  <!-- Without `position: relative` menu items floats to the right side of screen (check on storybook) -->
  <div
    style="position: relative"
    :title="rowIsDeleted ? $ut('elementIsNotActual') : ''"
  >
    <el-select
      :id="`ub-selector${this._uid}`"
      v-bind="$attrs"
      v-on="$listeners"
      ref="selector"
      :value="value"
      :loading="loading"
      filterable
      remote
      :remote-method="remoteMethod"
      :disabled="loading || disabled"
      :automatic-dropdown="false"
      :class="`ub-select-entity${this._uid}`"
      style="width: 100%"
      @change="onChange"
      @keyup.native.alt.e="handleEditItem"
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
            @click="loadNextPage"
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

<script>
require('../../css/ub-select.css')
const PAGE_SIZE = 20

module.exports = {
  name: 'UbSelectEntity',
  props: {
    value: {
      type: [String, Number]
    },
    entityName: {
      type: String,
      required: true
    },
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
      entitySchema: this.$UB.connection.domain.get(this.entityName, true),
      morePagesAvailable: false,
      /** items witch are selected (single item in case multiple=false) */
      selectedItems: [],
      /** page n data loaded from remote */
      dataPage: [],
      dataPageNum: 0,
      prevQuery: null,
      initialItem: null,
      items: [],
      handleEntityChanged: id => {
        if (this.value === id) {
          this.fetchSelectedItems(id)
        } else {
          this.items = []
        }
      },
      handleEntityInserted: id => {
        // TODO - verify. seams nothing to do here
        // if (this.waitingNewEntity) {
        //   this.resultData = id
        //   this.waitingNewEntity = false
        //   this.setInitialItem(id)
        // }
      },
      loading: false,
      popoverVisible: false
      // resultData: this.value
    }
  },
  methods: {
    remoteMethod (query) {
      this.prevQuery = query
      this.dataPageNum = 0
      // TODO check what value have query in case we toggle dropdown
      return this.$UB.Repository(this.entityName)
        .attrs(this.primaryColumn, this.displayValue)
        .whereIf(query, this.displayValue, 'like', query)
        .start(this.dataPageNum * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .selectAsObject().then(data => {
          this.morePagesAvailable = (data.length === PAGE_SIZE)
          this.dataPage = data
        }).finally(() => { this.loading = false })
      // if (query) this.loadNextByInput(query)
      // if (query === '') this.items = []
    },
    fetchSelectedItems () {
      this.loading = true
      return this.$UB.Repository(this.entityName)
        .attrs(this.primaryColumn, this.displayValue)
        .where(this.primaryColumn, '=', this.value)
        .selectAsObject().then(data => {
          this.selectedItems = data
        }).finally(() => { this.loading = false })
    },
    toggleDropDown () {
      if (!this.dataPage.length) {
        this.loading = true
        this.remoteMethod()
          .finally(() => { this.loading = false })
      }
      this.$refs.selector.toggleMenu()
      // this.items = []
      // this.loadNextButtonClick(() => {
      //   this.$refs.selector.focus()
      // })
      // this.$refs.selector.focus()
    },
    loadNextPage () {
      this.dataPageNum++
      return this.$UB.Repository(this.entityName)
        .attrs(this.primaryColumn, this.displayValue)
        .whereIf(this.prevQuery, this.displayValue, 'like', this.prevQuery)
        .start(this.dataPageNum * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .selectAsObject().then(data => {
          this.morePagesAvailable = (data.length === PAGE_SIZE)
          this.dataPage = data
        }).finally(() => { this.loading = false })
    },
    onChange (e) {
      this.value = e.target.value
    },
    handleShowDictionary () {
      this.$UB.core.UBApp.doCommand({
        entity: this.entityName,
        cmdType: this.$UB.core.UBCommand.commandType.showList,
        description: this.entitySchema.getEntityDescription(),
        isModal: true,
        sender: this,
        selectedInstanceID: this.value,
        onItemSelected: ({ data }) => {
          this.setInitialItem(data[this.primaryColumn])
          this.value = data[this.primaryColumn]
          this.$refs.selector.emitChange(data[this.primaryColumn])
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
      // if (this.resultData) {
      //   this.resultData = null
      //   this.$refs.selector.emitChange(null)
      //   this.items = []
      // }
    },
    onActionClick (row, event, column) {
      if (row.enabled === undefined || row.enabled) {
        row.handler.fn.call(row.handler.scope ? row.handler.scope : this, event)
        this.popoverVisible = false
      }
    },
    onChange (data) {
      // this.initialItem = this.items.find((el) => {
      //   return el[this.primaryColumn] === data
      // })
      // this.$emit('input', data)
    }
    // ,
    // initLoaderStyles () {
    //   let control = document.querySelector(`.ub-select-entity${this._uid} .el-loading-spinner`)
    //   if (control) {
    //     control.classList.add('ub-select__loading-spinner')
    //     let svg = control.querySelector('.circular')
    //     if (svg) {
    //       svg.style.height = '100%'
    //     }
    //   }
    // },
    // getRepository: function (startFrom) {
    //   return this.$UB.Repository(this.entityName)
    //     .attrs(this.primaryColumn, this.displayValue)
    //     .start(startFrom || 0)
    //     .limit(PAGE_SIZE)
    //     .whereIf(this.$refs.selector.selectedLabel && (!this.initialItem || this.$refs.selector.selectedLabel !== this.initialItem[this.displayValue]), this.displayValue, 'like', this.$refs.selector.selectedLabel)
    // },
    // loadNextByInput: function (query) {
    //   this.getRepository().select().then((data) => {
    //     this.items = []
    //     this.morePagesAvailable = (data.length === PAGE_SIZE)
    //     data.forEach(item => {
    //       this.items.push(item)
    //     })
    //   })
    // },
    // loadNextButtonClick (callback) {
    //   let itemsLength = this.items.length || 0
    //   this.getRepository(itemsLength).select().then((data) => {
    //     this.morePagesAvailable = (data.length === PAGE_SIZE)
    //     data.forEach(item => {
    //       this.items.push(item)
    //     })
    //     if (typeof callback === 'function') callback.call()
    //   })
    // },
    // setInitialItem (id) {
    //   this.loading = true
    //   let isSafeDelete = this.entitySchema.attributes['mi_deleteDate']
    //   id = parseInt(id || this.value, 10)
    //   this.$UB.Repository(this.entityName)
    //     .attrs(this.primaryColumn, this.displayValue)
    //     .attrsIf(isSafeDelete, 'mi_deleteDate')
    //     .miscIf(isSafeDelete, { __allowSelectSafeDeleted: true })
    //     .selectById(id).then((item) => {
    //       if (item) {
    //         this.initialItem = {}
    //         this.initialItem[this.primaryColumn] = item[this.primaryColumn]
    //         this.initialItem[this.displayValue] = item[this.displayValue] ? item[this.displayValue] : item[this.primaryColumn]
    //         this.initialItem['removed'] = !!item['mi_deleteDate'] && item['mi_deleteDate'] < new Date()
    //         if (this.$refs.selector) this.$refs.selector.selectedLabel = item[this.displayValue]
    //       }
    //     }).finally(() => {
    //       this.loading = false
    //     })
    // }
  },
  computed: {
    /** available options - intersection of selectedItems and dataPage */
    availableOptions () {
      return this.dataPage.concat(
        this.selectedItems.filter(i => !this.dataPage.some(dpI => dpI[this.primaryColumn] === i[this.primaryColumn]))
      )
    },
    rowIsDeleted () {
      let i = this.selectedItems[0]
      return i && i['mi_deleteDate'] && (i['mi_deleteDate'] < new Date())
      // return this.initialItem && this.initialItem.removed
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
      return this.entitySchema.descriptionAttribute
    }
    // itemsToDisplay () {
    //   if (this.initialItem) {
    //     let filteredItems = this.items.filter((item) => {
    //       return item[this.primaryColumn] !== this.initialItem[this.primaryColumn]
    //     })
    //     filteredItems.unshift(this.initialItem)
    //     return filteredItems
    //   }
    //   return this.items
    // }
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
      // this.dispatch('ElFormItem', 'el.form.change', val)
      // if (this.resultData != this.value) {
      //   this.resultData = this.value
      //   this.setInitialItem()
      // }
    }
  },
  mounted () {
    // setTimeout(() => {
    //   this.initLoaderStyles()
    // }, 1)

    this.$UB.connection.on(`${this.entityName}:changed`, this.handleEntityChanged)
    this.$UB.connection.on(`${this.entityName}:insert`, this.handleEntityInserted)

    /* In case to disable focus on menu button by Tab - add tabindex attr to menu */
    if (this.$refs.menuButton) this.$refs.menuButton.setAttribute('tabindex', -1)
    // if (this.value) {
    //   this.setInitialItem()
    // }

    /* Remove browser shortcut Alt+E */
    this.$refs.selector.$el.addEventListener('keydown', function (e) {
      if (e.keyCode === 69 && e.altKey) {
        e.preventDefault()
      }
    }, false)
  }
}
</script>
