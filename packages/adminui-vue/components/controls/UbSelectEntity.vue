ub-selector<template>
  <!-- Without `position: relative` menu items floats to the right side of screen (check on storybook) -->
  <div
    style="position: relative"
    :title="rowIsDeleted ? $ut('elementIsNotActual') : ''"
  >
    <el-select
      :id="`ub-selector${this._uid}`"
      ref="selector"
      v-model="resultData"
      :loading="loading"
      :placeholder="placeholder"
      filterable
      remote
      :remote-method="remoteMethod"
      :disabled="loading || disabled"
      :automatic-dropdown="false"
      :class="`ub-select-entity${this._uid}`"
      style="width: 100%"
      @change="onChange"
      @keyup.native.alt.e="editItem"
      @keyup.native.exact.f9="showDictionary"
      @keyup.native.alt.backspace="clear"
    >
      <i
        v-if="rowIsDeleted"
        slot="prefix"
        class="fa fa-ban el-input__icon"
      />
      <template>
        <el-option
          v-for="item in itemsToDisplay"
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
            @click="loadNextButtonClick"
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
    },
    placeholder: String
  },
  data () {
    return {
      primaryColumn: 'ID',
      waitingNewEntity: false,
      entitySchema: this.$UB.connection.domain.get(this.entityName, true),
      morePagesAvailable: false,
      initialItem: null,
      items: [],
      handleEntityChanged: id => {
        if (this.resultData === id) {
          this.setInitialItem(id)
        } else {
          this.items = []
        }
      },
      handleEntityInserted: id => {
        if (this.waitingNewEntity) {
          this.resultData = id
          this.waitingNewEntity = false
          this.setInitialItem(id)
        }
      },
      loading: false,
      popoverVisible: false,
      resultData: this.value
    }
  },
  methods: {
    remoteMethod (query) {
      if (query) this.loadNextByInput(query)
      if (query === '') this.items = []
    },
    toggleDropDown () {
      // TODO this.$refs.selector.toggleMenu()
      this.items = []
      this.loadNextButtonClick(() => {
        this.$refs.selector.focus()
      })
      this.$refs.selector.focus()
    },
    showDictionary () {
      this.$UB.core.UBApp.doCommand({
        entity: this.entityName,
        cmdType: this.$UB.core.UBCommand.commandType.showList,
        description: this.entitySchema.getEntityDescription(),
        isModal: true,
        sender: this,
        selectedInstanceID: this.resultData,
        onItemSelected: ({ data }) => {
          this.setInitialItem(data[this.primaryColumn])
          this.resultData = data[this.primaryColumn]
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
    editItem () {
      if (this.resultData) {
        this.$UB.core.UBApp.doCommand({
          cmdType: this.$UB.core.UBCommand.commandType.showForm,
          entity: this.entityName,
          isModal: true,
          instanceID: this.resultData
        })
      }
    },
    clear () {
      if (this.resultData) {
        this.resultData = null
        this.$refs.selector.emitChange(null)
        this.items = []
      }
    },
    onActionClick (data) {
      if (data.enabled === undefined || data.enabled) {
        data.handler.fn.call(data.handler.scope ? data.handler.scope : this)
        this.popoverVisible = false
      }
    },
    onChange (data) {
      this.initialItem = this.items.find((el) => {
        return el[this.primaryColumn] === data
      })
      this.$emit('input', data)
    },
    initLoaderStyles () {
      let control = document.querySelector(`.ub-select-entity${this._uid} .el-loading-spinner`)
      if (control) {
        control.classList.add('ub-select__loading-spinner')
        let svg = control.querySelector('.circular')
        if (svg) {
          svg.style.height = '100%'
        }
      }
    },
    getRepository: function (startFrom) {
      return this.$UB.Repository(this.entityName)
        .attrs(this.primaryColumn, this.displayValue)
        .start(startFrom || 0)
        .limit(PAGE_SIZE)
        .whereIf(this.$refs.selector.selectedLabel && (!this.initialItem || this.$refs.selector.selectedLabel !== this.initialItem[this.displayValue]), this.displayValue, 'like', this.$refs.selector.selectedLabel)
    },
    loadNextByInput: function (query) {
      this.getRepository().select().then((data) => {
        this.items = []
        this.morePagesAvailable = (data.length === PAGE_SIZE)
        data.forEach(item => {
          this.items.push(item)
        })
      })
    },
    loadNextButtonClick (callback) {
      let itemsLength = this.items.length || 0
      this.getRepository(itemsLength).select().then((data) => {
        this.morePagesAvailable = (data.length === PAGE_SIZE)
        data.forEach(item => {
          this.items.push(item)
        })
        if (typeof callback === 'function') callback.call()
      })
    },
    setInitialItem (id) {
      this.loading = true
      let isSafeDelete = this.entitySchema.attributes['mi_deleteDate']
      id = parseInt(id || this.value, 10)
      this.$UB.Repository(this.entityName)
        .attrs(this.primaryColumn, this.displayValue)
        .attrsIf(isSafeDelete, 'mi_deleteDate')
        .miscIf(isSafeDelete, { __allowSelectSafeDeleted: true })
        .selectById(id).then((item) => {
          if (item) {
            this.initialItem = {}
            this.initialItem[this.primaryColumn] = item[this.primaryColumn]
            this.initialItem[this.displayValue] = item[this.displayValue] ? item[this.displayValue] : item[this.primaryColumn]
            this.initialItem['removed'] = !!item['mi_deleteDate'] && item['mi_deleteDate'] < new Date()
            if (this.$refs.selector) this.$refs.selector.selectedLabel = item[this.displayValue]
          }
        }).finally(() => {
          this.loading = false
        })
    }
  },
  computed: {
    rowIsDeleted () {
      return this.initialItem && this.initialItem.removed
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
          fn: this.showDictionary
        }
      },
      {
        name: 'Edit',
        caption: this.$ut('editSelItem') + ' (Alt+E)',
        icon: 'fa fa-pencil-square-o',
        enabled: !!this.resultData,
        handler: {
          fn: this.editItem
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
        enabled: !!this.resultData,
        handler: {
          fn: this.clear
        }
      }]
    },
    displayValue () {
      return this.entitySchema.descriptionAttribute
    },
    itemsToDisplay () {
      if (this.initialItem) {
        let filteredItems = this.items.filter((item) => {
          return item[this.primaryColumn] !== this.initialItem[this.primaryColumn]
        })
        filteredItems.unshift(this.initialItem)
        return filteredItems
      }
      return this.items
    }
  },
  destroyed () {
    this.$UB.connection.removeListener(`${this.entityName}:changed`, this.handleEntityChanged)
    this.$UB.connection.removeListener(`${this.entityName}:insert`, this.handleEntityInserted)
  },
  watch: {
    value () {
      if (this.resultData != this.value) {
        this.resultData = this.value
        this.setInitialItem()
      }
    }
  },
  mounted () {
    setTimeout(() => {
      this.initLoaderStyles()
    }, 1)

    this.$UB.connection.on(`${this.entityName}:changed`, this.handleEntityChanged)
    this.$UB.connection.on(`${this.entityName}:insert`, this.handleEntityInserted)

    /* In case to disable focus on menu button by Tab - add tabindex attr to menu */
    if (this.$refs.menuButton) this.$refs.menuButton.setAttribute('tabindex', -1)
    if (this.value) {
      this.setInitialItem()
    }

    /* Remove browser shortcut Alt+E */
    this.$refs.selector.$el.addEventListener('keydown', function (e) {
      if (e.keyCode === 69 && e.altKey) {
        e.preventDefault()
      }
    }, false)
  }
}
</script>
