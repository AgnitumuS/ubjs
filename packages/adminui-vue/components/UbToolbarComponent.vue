<template>
  <div class="ub-toolbar">
    <div style="display: flex">
      <el-tooltip
        v-for="button in buttons"
        :key="button.id"
        :content="button.tooltip"
        placement="bottom"
      >
        <el-button
          :disabled="button.disabled"
          size="large"
          type="text"
          class="ub-toolbar__button"
          :style="{color : button.disabled ? '#c0c4cc' : button.color}"
          @click="button.action"
        >
          <i :class="button.icon" />
        </el-button>
      </el-tooltip>
    </div>
    <div style="display: flex">
      <el-popover
        v-model="showPopover"
        placement="bottom-end"
        trigger="click"
      >
        <el-table
          :data="actions"
          :show-header="false"
          @row-click="onActionClick"
        >
          <el-table-column
            property="caption"
            width="200"
          >
            <template slot-scope="scope">
              <div :style="scope.row.enabled === undefined || scope.row.enabled ? 'cursor: pointer' : 'opacity: 0.5'">
                <i :class="scope.row.icon" />
                <span
                  style="margin-left: 10px"
                  class="ub-noselect"
                >{{ scope.row.caption }}</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-button
          slot="reference"
          type="text"
          size="large"
          class="ub-toolbar__button"
        >
          <i
            class="fa fa-cog"
            aria-hidden="true"
          />
        </el-button>
      </el-popover>
      <div
        v-if="isSimpleAudit && simpleAudit"
        class="ub-toolbar__button__divider"
      />
      <div
        v-if="isSimpleAudit && simpleAudit"
        class="ub-toolbar__date__container"
      >
        <div class="ub-toolbar__date">
          <b>{{ createdEntityCaption }}:</b> {{ simpleAudit.mi_createDate ? $moment(simpleAudit.mi_createDate).format('lll') : '' }}
        </div>
        <div class="ub-toolbar__date">
          <b>{{ updatedEntityCaption }}:</b> {{ simpleAudit.mi_modifyDate ? $moment(simpleAudit.mi_modifyDate).format('lll') : '' }}
        </div>
      </div>
    </div>
    <input
      id="linkToEntity"
      type="hidden"
      :value="linkToEntity"
    >
  </div>
</template>

<script>
module.exports = {
  name: 'UbToolbarComponent',
  props: {
    instanceId: {
      type: [Number]
    },
    entityName: {
      type: String,
      required: true
    },
    simpleAudit: Object,
    isNew: Boolean,
    isDirty: Boolean,
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
      let pageColumns = this.entitySchema.filterAttribute({ defaultView: true }).map((at) => {
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
      return this.canSave && this.isDirty
    },
    canDelete () {
      return this.entitySchema.haveAccessToMethod('delete') && !this.isNew
    },
    linkToEntity () {
      let prm = []
      prm.push('cmdType=showForm')
      prm.push(`entity=${this.entitySchema.name}`)
      prm.push(`instanceID=${this.instanceId}`)
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
          fn: () => { this.$emit('saveAndReload') }
        },
        enabled: this.saveEnabled
      })
      actions.push({
        icon: 'fa fa-share-square-o',
        caption: this.saveAndCloseCaption,
        handler: {
          fn: () => { this.$emit('saveAndClose') }
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
          fn: () => { this.$emit('remove') }
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
                    entity: this.entityName, method: 'select', fieldList: fieldList
                  }]
                },
                cmpInitConfig: {
                  extendedFieldList: extendedFieldList
                },
                instanceID: this.instanceId,
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
                      .where('[entityinfo_id]', '=', this.instanceId)
                      .orderByDesc('actionTime')
                      .ubql()
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
        let mixins = this.entitySchema.mixins
        let aclEntityName = mixins && mixins.aclRls && mixins.aclRls.useUnityName
          ? mixins.unity.entity + '_acl' : this.entitySchema.name + '_acl'
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
        action: () => { this.$emit('saveAndClose') },
        tooltip: this.saveAndCloseCaption
      }, {
        id: 2,
        disabled: !this.saveEnabled,
        color: '#5daf34',
        icon: 'fa fa-save',
        action: () => { this.$emit('saveAndReload') },
        tooltip: this.saveAndReloadCaption
      }, {
        id: 3,
        disabled: !this.canDelete,
        icon: 'fa fa-trash-o',
        action: () => { this.$emit('remove') },
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
