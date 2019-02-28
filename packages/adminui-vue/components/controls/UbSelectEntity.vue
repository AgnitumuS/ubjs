<template>
  <div style="position: relative">
    <el-tooltip :content="deletedCaption" placement="left" :disabled="!rowIsDeleted" :open-delay="200">
      <el-select ref="selector" v-model="resultData"
                 v-loading="loading" reserve-keyword filterable remote
                 :disabled="loading || disabled"
                 :class="`ub-select-entity${this._uid}`"
                 style="width: 100%"
                 @change="onChange"
                 @click.native="onFocus"
                 @input.native="onInput">
        <i v-if="rowIsDeleted" slot="prefix" class="fa fa-ban el-input__icon"></i>
        <template>
          <el-option v-for="item in itemsToDisplay"
                     :key="item[primaryColumn]"
                     :label="item[displayValue]"
                     :value="item[primaryColumn]"
                     :disabled="item.removed"
          ></el-option>
          <el-row v-if="hasData" type="flex" justify="end" style="padding: 0 20px">
            <el-button type="text" @click="loadNextButtonClick">{{buttonMoreCaption}}</el-button>
          </el-row>
        </template>
      </el-select>
    </el-tooltip>
    <div class="ub-select-entity__menu-button">
      <el-popover v-if="rowActions && rowActions.length > 0"
                  v-model="popoverVisible"
                  placement="bottom-end"
                  :disabled="disabled"
                  trigger="click">
        <el-table :data="rowActions" :show-header="false" @row-click="onActionClick">
          <el-table-column property="caption" width="250">
            <template slot-scope="scope">
              <div :style="scope.row.enabled === undefined || scope.row.enabled ? '' : 'opacity: 0.5'"
                   style="cursor: pointer" class="ub-noselect">
                <i :class="scope.row.icon"></i>
                <span style="margin-left: 10px">{{ scope.row.caption }}</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <i ref="menuButton" slot="reference" style="min-width: 25px" class="el-icon-menu"></i>
      </el-popover>
    </div>
  </div>
</template>

<script>
require('../../css/ub-select.css')

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
      buttonMoreCaption: this.$ut('more'),
      deletedCaption: this.$ut('elementIsNotActual'),
      entitySchema: this.$UB.connection.domain.get(this.entityName, true),
      hasData: true,
      initialItem: null,
      items: [],
      itemCount: 20,
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
      resultData: this.value,
      searchValue: ''
    }
  },
  methods: {
    onInput () {
      if (!event.target.value) {
        this.resultData = null
        this.$refs.selector.emitChange(null)
      }
      this.loadNextByInput(event.target.value)
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
      this.searchValue = this.initialItem ? this.initialItem[this.displayValue] : ''
      this.items = []
      this.$emit('input', data)
    },
    onFocus () {
      if (this.items.length === 0) {
        this.loadNextButtonClick()
      }
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
    getPromise: function (startFrom) {
      let promise = this.$UB.Repository(this.entityName).attrs(this.primaryColumn, this.displayValue).start(startFrom || 0).limit(this.itemCount)
      if (this.searchValue) {
        promise = promise.where(this.displayValue, 'like', this.searchValue)
      }
      return promise
    },
    loadNextByInput: function (query) {
      this.searchValue = query
      let promise = this.getPromise()
      promise.select().then((data) => {
        this.items = []
        this.hasData = data.length === this.itemCount
        data.forEach(item => {
          this.items.push(item)
        })
      })
    },
    loadNextButtonClick () {
      let itemsLength = this.items.length || 0
      let promise = this.getPromise(itemsLength)
      promise.select().then((data) => {
        this.hasData = data.length === this.itemCount
        data.forEach(item => {
          this.items.push(item)
        })
      })
    },
    setInitialItem (id) {
      this.loading = true
      let promise = this.$UB.Repository(this.entityName).attrs(this.primaryColumn, this.displayValue)
      if (Object.keys(this.entitySchema.mixins.mStorage || {}).includes('safeDelete') && this.entitySchema.mixins.mStorage.safeDelete === true) {
        promise = promise.attrs('mi_deleteDate').misc({__allowSelectSafeDeleted: true})
      }
      promise.selectById(id || this.value).then((item) => {
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
        caption: this.$ut('selectFromDictionary'),
        icon: 'fa fa-table',
        handler: {
          fn () {
            this.$UB.core.UBApp.doCommand({
              entity: this.entityName,
              cmdType: this.$UB.core.UBCommand.commandType.showList,
              description: this.entitySchema.getEntityDescription(),
              isModal: true,
              sender: this,
              selectedInstanceID: this.resultData,
              onItemSelected: ({data}) => {
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
          }
        }
      },
      {
        name: 'Edit',
        caption: this.$ut('editSelItem'),
        icon: 'fa fa-pencil-square-o',
        enabled: !!this.resultData,
        handler: {
          fn () {
            this.$UB.core.UBApp.doCommand({
              cmdType: this.$UB.core.UBCommand.commandType.showForm,
              entity: this.entityName,
              isModal: true,
              instanceID: this.resultData
            })
          }
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
        caption: this.$ut('clearSelection'),
        icon: 'fa fa-eraser',
        enabled: !!this.resultData,
        handler: {
          fn () {
            this.resultData = null
            this.$refs.selector.emitChange(null)
          }
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
    setTimeout(_ => {
      this.initLoaderStyles()
    }, 1)

    this.$UB.connection.on(`${this.entityName}:changed`, this.handleEntityChanged)
    this.$UB.connection.on(`${this.entityName}:insert`, this.handleEntityInserted)

    /* In case to disable focus on menu button by Tab - add tabindex attr to menu */
    if (this.$refs.menuButton) this.$refs.menuButton.setAttribute('tabindex', -1)
    if (this.value) {
      this.setInitialItem()
    }
  }
}
</script>
