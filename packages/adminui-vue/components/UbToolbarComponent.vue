<template>
  <div class="ub-toolbar">
    <div style="display: flex">
      <el-tooltip v-for="button in buttons" :key="button.id" :content="button.tooltip" placement="bottom" :open-delay="300">
        <el-button :disabled="button.disabled"
                   size="large"
                   type="text"
                   class="ub-toolbar__button"
                   :style="{color : button.disabled ? '#c0c4cc' : button.color}"
                   @click="button.action">
          <i :class="button.icon"></i>
        </el-button>
      </el-tooltip>
    </div>
    <div style="display: flex">
      <el-popover
        placement="bottom-end"
        v-model="showPopover"
        trigger="click">
        <el-table :data="actions" @row-click="onActionClick" :show-header="false">
          <el-table-column property="caption" width="200">
            <template slot-scope="scope">
              <div :style="scope.row.enabled === undefined || scope.row.enabled ? 'cursor: pointer' : 'opacity: 0.5'">
                <i :class="scope.row.icon"></i>
                <span style="margin-left: 10px" class="ub-noselect">{{ scope.row.caption }}</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="text" slot="reference" size="large" class="ub-toolbar__button">
          <i class="fa fa-cog" aria-hidden="true"></i>
        </el-button>
      </el-popover>
      <div class="ub-toolbar__button__divider" v-if="isSimpleAudit && simpleAudit"></div>
      <div class="ub-toolbar__date__container" v-if="isSimpleAudit && simpleAudit">
        <div class="ub-toolbar__date">
          <b>{{createdEntityCaption}}:</b> {{ simpleAudit.mi_createDate ? simpleAudit.mi_createDate.toLocaleString() : '' }}
        </div>
        <div class="ub-toolbar__date">
          <b>{{updatedEntityCaption}}:</b> {{ simpleAudit.mi_modifyDate ? simpleAudit.mi_modifyDate.toLocaleString() : '' }}
        </div>
      </div>
    </div>
    <input type="hidden" id="linkToEntity"
           :value="linkToEntity">
  </div>
</template>

<script>
module.exports = {
  name: 'UbToolbarComponent',
  props: {
    value: {
      type: [String, Number],
      required: true
    },
    entityName: {
      type: String,
      required: true
    },
    simpleAudit: Object,
    isNew: Boolean,
    isChanged: Boolean,
    useOnlyOwnActions: Boolean,
    inputActions: {
      type: Array,
      default () {
        return []
      }
    },
    inputButtons: {
      type: Array,
      default () {
        return []
      }
    },
    formCode: String
  },
  data () {
    return {
      createdEntityCaption: this.$ut('createdEntityCaption'),
      updatedEntityCaption: this.$ut('updatedEntityCaption'),
      showPopover: false
    }
  },
  computed: {
    entitySchema () {
      return this.$UB.connection.domain.get(this.entityName)
    },
    entityFields () {
      let pageColumns = this.entitySchema.filterAttribute({defaultView: true}).map((at) => {
        return at.name
      })
      let fieldList = this.$UB.ux.data.UBStore.normalizeFieldList(this.entityName, pageColumns || [])
      if (this.entitySchema.mixins.mStorage && this.entitySchema.mixins.mStorage.simpleAudit) fieldList.push('mi_createDate')
      return fieldList
    },
    canSave () {
      return this.entitySchema.haveAccessToAnyMethods(['insert', 'update'])
    },
    saveEnabled () {
      return this.canSave && this.isChanged
    },
    canDelete () {
      return this.entitySchema.haveAccessToMethod('delete') && !this.isNew
    },
    linkToEntity () {
      let prm = []
      prm.push('cmdType=showForm')
      prm.push(`entity=${this.entitySchema.name}`)
      prm.push(`instanceID=${this.value}`)
      return `${window.location.protocol}//${window.location.host}${window.location.pathname}#${prm.join('&')}`
    },
    isSimpleAudit () {
      return this.entitySchema.mixins.mStorage && this.entitySchema.mixins.mStorage.simpleAudit
    },
    saveAndCloseCaption () {
      return this.$ut('saveAndClose') + ' (Alt + Enter)'
    },
    saveAndReloadCaption () {
      return this.$ut('save') + ' (Alt + S)'
    },
    removeCaption () {
      return this.$ut('Delete') + ' (Alt + R)'
    },
    defaultActions () {
      let actions = []
      actions.push({
        icon: 'fa fa-save',
        caption: this.saveAndReloadCaption,
        handler: {
          fn: _ => { this.$emit('saveAndReload') }
        },
        enabled: this.saveEnabled
      })
      actions.push({
        icon: 'fa fa-share-square-o',
        caption: this.saveAndCloseCaption,
        handler: {
          fn: _ => { this.$emit('saveAndClose') }
        },
        enabled: this.saveEnabled
      })
      if (this.$UB.connection.domain.isEntityMethodsAccessible('ubm_form', 'update')) {
        actions.push({
          icon: 'fa fa-wrench',
          caption: this.$ut('formConstructor'),
          handler: {
            fn () {
              let formEntity = this.$UB.connection.domain.get('ubm_form')

              if (!formEntity.haveAccessToMethod('update')) {
                return
              }
              if (!this.formCode) {
                this.$notify({
                  title: this.$ut('isAutoGeneratedForm'),
                  duration: 3000
                })
                return
              }

              this.$UB.Repository('ubm_form').attrs(['ID', 'code'])
                .where('code', '=', this.formCode).select()
                .then(result => {
                  if (!result || result.length < 1) {
                    this.$notify({
                      title: this.$ut('formNotFound'),
                      duration: 3000
                    })
                    return
                  }
                  let config = {
                    cmdType: 'showForm',
                    description: '',
                    entity: 'ubm_form',
                    instanceID: result[0].ID,
                    sender: this,
                    target: this.$UB.core.UBApp.getViewport().getCenterPanel(),
                    tabId: 'ubm_form' + result[0].ID
                  }

                  $App.doCommand(config)
                })
            }
          }
        })
      }
      actions.push({
        icon: 'fa fa-trash-o',
        caption: this.removeCaption,
        handler: {
          fn: _ => { this.$emit('remove') }
        },
        enabled: this.canDelete
      })
      actions.push({
        icon: 'fa fa-link',
        caption: this.$ut('ssylka'),
        handler: {
          fn () {
            let linkToEntityToCopy = document.querySelector('#linkToEntity')
            linkToEntityToCopy.setAttribute('type', 'text')
            linkToEntityToCopy.select()
            if (document.execCommand('copy')) {
              this.$notify({
                title: this.$ut('ssylka'),
                message: this.$ut('linkCopiedText'),
                duration: 5000
              })
            }
            linkToEntityToCopy.setAttribute('type', 'hidden')
            window.getSelection().removeAllRanges()
          }
        }
      })
      if (this.entitySchema.hasMixin('dataHistory')) {
        actions.push({
          icon: 'fa fa-history',
          caption: this.$ut('ChangesHistory'),
          handler: {
            fn () {
              if (this.isNew) return
              let fieldList = this.entityFields
              let extendedFieldList = this.$UB.core.UBUtil.convertFieldListToExtended(this.entityFields)

              function configureMixinAttribute (attributeCode) {
                if (!extendedFieldList.find((field) => { return field.name === attributeCode })) {
                  fieldList = [attributeCode].concat(fieldList)
                  extendedFieldList = [{
                    name: attributeCode,
                    visibility: true,
                    description: this.$ut(attributeCode)
                  }].concat(extendedFieldList)
                }
              }

              configureMixinAttribute.call(this, 'mi_dateTo')
              configureMixinAttribute.call(this, 'mi_dateFrom')
              $App.doCommand({
                cmdType: 'showList',
                isModal: true,
                cmdData: {
                  params: [{
                    entity: this.entityName, method: this.$UB.core.UBCommand.methodName.SELECT, fieldList: fieldList
                  }]
                },
                cmpInitConfig: {
                  extendedFieldList: extendedFieldList
                },
                instanceID: this.value,
                __mip_recordhistory: true
              })
            }
          }
        })
      }
      if (this.entitySchema.hasMixin('audit')) {
        actions.push({
          icon: 'iconAudit',
          caption: this.$ut('showAudit'),
          handler: {
            fn () {
              $App.doCommand({
                cmdType: 'showList',
                isModalDialog: true,
                hideActions: ['addNew', 'addNewByCurrent', 'edit', 'del', 'newVersion'],
                cmdData: {
                  params: [
                    this.$UB.Repository('uba_auditTrail')
                      .attrs(['actionTime', 'actionType', 'actionUser', 'remoteIP'])
                      .where('[entity]', '=', this.entityName)
                      .where('[entityinfo_id]', '=', this.value)
                      .orderByDesc('actionTime')
                      .ubRequest()
                  ]
                },
                cmpInitConfig: {
                  onItemDblClick: function (grid, record, item, index, e, eOpts) {
                    this.doOnEdit(eOpts)
                  }
                }
              })
            }
          },
          enabled: this.$UB.connection.domain.isEntityMethodsAccessible('uba_auditTrail', 'select')
        })
      }
      if (this.entitySchema.hasMixin('aclRls')) {
        let aclEntityName = this.entitySchema.mixins && this.entitySchema.mixins.aclRls && this.entitySchema.mixins.aclRls.useUnityName
          ? this.entitySchema.mixins.unity.entity + '_acl' : this.entitySchema.name + '_acl'
        actions.push({
          caption: this.$ut('accessRight'),
          handler: {
            fn () {
              debugger
            }
          },
          enabled: this.$UB.connection.domain.isEntityMethodsAccessible(aclEntityName, 'select')
        })
      }
      if (this.entitySchema.hasMixin('softLock')) {
        if (!this.isNew) {
          actions.push({
            caption: this.$ut('lockBtn'),
            handler: {
              fn () {
                debugger
              }
            }
          })
        }
        if (!this.isNew) {
          actions.push({
            caption: this.$ut('unLockBtn'),
            handler: {
              fn () {
                debugger
              }
            }
          })
        }
      }
      return actions
    },
    actions () {
      return this.useOnlyOwnActions ? this.inputActions : [...this.defaultActions, ...this.inputActions]
    },
    defaultButtons () {
      return [{
        id: 1,
        disabled: !this.saveEnabled,
        color: '#5daf34',
        icon: 'fa fa-share-square-o',
        action: _ => { this.$emit('saveAndClose') },
        tooltip: this.saveAndCloseCaption
      }, {
        id: 2,
        disabled: !this.saveEnabled,
        color: '#5daf34',
        icon: 'fa fa-save',
        action: _ => { this.$emit('saveAndReload') },
        tooltip: this.saveAndReloadCaption
      }, {
        id: 3,
        disabled: !this.canDelete,
        icon: 'fa fa-trash-o',
        action: _ => { this.$emit('remove') },
        tooltip: this.removeCaption
      }]
    },
    buttons () {
      return this.inputButtons && this.inputButtons.length > 0 ? this.inputButtons : this.defaultButtons
    }
  },
  methods: {
    onActionClick (data) {
      this.showPopover = false
      if (data.enabled === undefined || data.enabled) {
        data.handler.fn.call(data.handler.scope ? data.handler.scope : this)
      }
    }
  }
}
</script>
