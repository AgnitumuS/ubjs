<template>
  <div>
    <el-tooltip :content="deletedCaption" placement="top" :disabled="!rowIsDeleted">
      <el-select ref="selector" v-model="resultData"
                 reserve-keyword filterable remote
                 v-loading="loading" :disabled="loading"
                 @change="onChange"
                 v-on:click.native="onFocus"
                 v-on:input.native="onInput"
                 style="width: 100%"
                 :class="`ub-select-entity${this._uid}`">
        <div slot="suffix">
          <el-popover
              v-if="rowActions"
              placement="bottom-end"
              v-model="popoverVisible">
            <el-table :data="rowActions" @row-click="onActionClick" :show-header="false">
              <el-table-column property="caption" width="250">
                <template slot-scope="scope">
                  <div :style="scope.row.enabled === undefined || scope.row.enabled ? '' : 'opacity: 0.5'">
                    <i :class="scope.row.icon"></i>
                    <span style="margin-left: 10px">{{ scope.row.caption }}</span>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            <i @click="showPopover" slot="reference" class="el-select__caret el-input__icon el-icon-menu"></i>
          </el-popover>
        </div>
        <div slot="prefix" v-if="rowIsDeleted">
          <i style="margin-left: 5px" class="fa fa-ban"></i>
        </div>
        <template slot-scope="scope">
          <el-option v-for="item in itemsToDisplay" :key="item[primaryColumn]"
                     :label="item[displayValue]" :value="item[primaryColumn]"
                     :disabled="item.removed">
          </el-option>
          <el-row type="flex" justify="end" style="padding: 0px 20px" v-if="hasData">
            <el-button type="text" @click="loadNextButtonClick">{{buttonMoreCaption}}</el-button>
          </el-row>
        </template>
      </el-select>
    </el-tooltip>
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
      primaryColumn: {
        type: String,
        default () {
          return 'ID'
        }
      },
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
        buttonMoreCaption: UB.i18n('more'),
        deletedCaption: UB.i18n('elementIsNotActual'),
        entitySchema: $App.domainInfo.get(this.entityName, true),
        hasData: true,
        initialItem: null,
        items: [],
        itemCount: 20,
        listener: function (id) {
          if (id && this.resultData === null) this.resultData = id
          if (id && id === this.resultData) {
            this.setInitialItem(id)
          } else {
            this.items = []
          }
        }.bind(this),
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
      showPopover (event) {
        event.stopPropagation()
        this.popoverVisible = !this.popoverVisible
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
        let promise = UB.Repository(this.entityName).attrs(this.primaryColumn, this.displayValue).start(startFrom || 0).limit(this.itemCount)
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
          data.forEach(function (item) {
            this.items.push(item)
          }.bind(this))
        })
      },
      loadNextButtonClick () {
        let itemsLength = this.items.length || 0
        let promise = this.getPromise(itemsLength)
        promise.select().then((data) => {
          this.hasData = data.length === this.itemCount
          data.forEach(function (item) {
            this.items.push(item)
          }.bind(this))
        })
      },
      setInitialItem (id) {
        this.loading = true
        let promise = UB.Repository(this.entityName).attrs(this.primaryColumn, this.displayValue)
        if (Object.keys(this.entitySchema.mixins.mStorage || {}).includes('safeDelete') && this.entitySchema.mixins.mStorage.safeDelete === true) {
          promise = promise.attrs('mi_deleteDate').misc({__allowSelectSafeDeleted: true})
        }
        promise.selectById(id || this.value).then((item) => {
          if (item) {
            this.initialItem = {}
            this.initialItem[this.primaryColumn] = item[this.primaryColumn]
            this.initialItem[this.displayValue] = item[this.displayValue] ? item[this.displayValue] : item[this.primaryColumn]
            this.initialItem['removed'] = !!item['mi_deleteDate']
            this.$refs.selector.selectedLabel = item[this.displayValue]
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
          caption: UB.i18n('selectFromDictionary'),
          icon: 'fa fa-table',
          handler: {
            fn () {
              UB.core.UBApp.doCommand({
                entity: this.entityName,
                cmdType: UB.core.UBCommand.commandType.showList,
                description: this.entitySchema.getEntityDescription(),
                isModal: true,
                sender: this,
                selectedInstanceID: this.resultData,
                onItemSelected: function ({data}) {
                  this.setInitialItem(data[this.primaryColumn])
                  this.resultData = data[this.primaryColumn]
                  this.$refs.selector.emitChange(data[this.primaryColumn])
                }.bind(this),
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
          caption: UB.i18n('editSelItem'),
          icon: 'fa fa-pencil-square-o',
          enabled: !!this.resultData,
          handler: {
            fn () {
              UB.core.UBApp.doCommand({
                cmdType: UB.core.UBCommand.commandType.showForm,
                entity: this.entityName,
                isModal: true,
                instanceID: this.resultData
              })
            }
          }
        },
        {
          name: 'Add',
          caption: UB.i18n('addNewItem'),
          icon: 'fa fa-plus-circle',
          handler: {
            fn () {
              UB.core.UBApp.doCommand({
                cmdType: UB.core.UBCommand.commandType.showForm,
                entity: this.entityName,
                isModal: true
              })
            }
          }
        },
        {
          name: 'Clear',
          caption: UB.i18n('clearSelection'),
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
      $App.connection.removeListener(`${this.entityName}:changed`, this.listener)
    },
    mounted () {
      setTimeout(function () {
        this.initLoaderStyles()
      }.bind(this), 1)

      $App.connection.on(`${this.entityName}:changed`, this.listener)

      if (this.value) {
        this.setInitialItem()
      }
    }
  }
</script>