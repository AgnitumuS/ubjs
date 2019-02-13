<template>
  <div class="auto-form__header">
    <div style="display: flex">
      <el-button v-for="button in buttons" :disabled="button.disabled" type="text" size="large"
                 class="auto-form__header__button"
                 @click="button.action">
        <i :class="button.icon"></i>
      </el-button>
    </div>
    <div style="display: flex">
      <el-popover
          placement="bottom-end"
          trigger="click">
        <el-table :data="actions" @row-click="onActionClick" :show-header="false">
          <el-table-column property="caption" width="200">
            <template slot-scope="scope">
              <div :style="scope.row.enabled === undefined || scope.row.enabled ? '' : 'opacity: 0.5'">
                <i :class="scope.row.icon"></i>
                <span style="margin-left: 10px">{{ scope.row.caption }}</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="text" slot="reference" size="large" class="auto-form__header__button">
          <i class="fa fa-cog" aria-hidden="true"></i>
        </el-button>
      </el-popover>
      <div class="auto-form__header__button__divider" v-if="isSimpleAudit"></div>
      <div class="auto-form__header__date__container" v-if="isSimpleAudit">
        <div class="auto-form__header__date">
          <b>{{createdEntityCaption}}:</b> {{ value.mi_createDate ? value.mi_createDate.toLocaleString() : '' }}
        </div>
        <div class="auto-form__header__date">
          <b>{{updatedEntityCaption}}:</b> {{ value.mi_modifyDate ? value.mi_modifyDate.toLocaleString() : '' }}
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
      value: Object,
      entityName: String,
      isNew: Boolean,
      isChanged: Boolean,
      useOnlyOwnActions: {
        type: Boolean,
        default () {
          return false
        }
      },
      inputActions: {
        type: Array,
        default () {
          return []
        }
      },
      inputButtons: {
        type: Array
      }
    },
    data () {
      return {
        createdEntityCaption: UB.i18n('createdEntityCaption'),
        updatedEntityCaption: UB.i18n('updatedEntityCaption')
      }
    },
    computed: {
      buttons () {
        return this.inputButtons && this.inputButtons > 0 ? this.inputButtons : this.defaultButtons
      },
      canSave () {
        return this.entitySchema.haveAccessToAnyMethods([UB.core.UBCommand.methodName.INSERT, UB.core.UBCommand.methodName.UPDATE])
      },
      canDelete () {
        return this.entitySchema.haveAccessToMethod(UB.core.UBCommand.methodName.DELETE) && !this.isNew
      },
      linkToEntity () {
        let prm = []
        prm.push('cmdType=showForm')
        prm.push(`entity=${this.entitySchema.name}`)
        prm.push(`instanceID=${this.value.ID}`)
        return UB.format('{0}//{1}{2}#{3}', window.location.protocol, window.location.host, window.location.pathname, prm.join('&'))
      },
      isSimpleAudit () {
        return this.entitySchema.mixins.mStorage && this.entitySchema.mixins.mStorage.simpleAudit
      },
      entitySchema () {
        return $App.domainInfo.get(this.entityName)
      },
      saveEnabled () {
        return this.canSave && this.isChanged
      },
      defaultButtons () {
        return [{
          disabled: !this.saveEnabled,
          icon: 'fa fa-share-square-o',
          action: function () { this.$emit('saveAndClose') }.bind(this)
        }, {
          disabled: !this.saveEnabled,
          icon: 'fa fa-save',
          action: function () { this.$emit('saveAndReload') }.bind(this)
        }, {
          disabled: !this.canDelete,
          icon: 'fa fa-trash-o',
          action: function () { this.$emit('remove') }.bind(this)
        }]
      },
      defaultActions () {
        let actions = []
        actions.push({
          icon: 'fa fa-save',
          caption: UB.i18n('sohranit'),
          handler: {
            fn: function () { this.$emit('saveAndReload') }.bind(this)
          },
          enabled: this.saveEnabled
        })
        actions.push({
          icon: 'fa fa-share-square-o',
          caption: UB.i18n('saveAndClose'),
          handler: {
            fn: function () { this.$emit('saveAndClose') }.bind(this)
          },
          enabled: this.saveEnabled
        })
        if ($App.domainInfo.isEntityMethodsAccessible('ubm_form', UB.core.UBCommand.methodName.UPDATE)) {
          actions.push({
            icon: 'fa fa-wrench',
            caption: UB.i18n('formConstructor'),
            handler: {
              fn () {
                debugger
              }
            }
          })
        }
        actions.push({
          icon: 'fa fa-trash-o',
          caption: UB.i18n('Delete'),
          handler: {
            fn: function () { this.$emit('remove') }.bind(this)
          },
          enabled: this.canDelete
        })
        actions.push({
          icon: 'fa fa-link',
          caption: UB.i18n('ssylka'),
          handler: {
            fn () {
              let linkToEntityToCopy = document.querySelector('#linkToEntity')
              linkToEntityToCopy.setAttribute('type', 'text')
              linkToEntityToCopy.select()
              if (document.execCommand('copy'))
                this.$notify({
                  title: UB.i18n('ssylka'),
                  message: UB.i18n('linkCopiedText'),
                  duration: 5000
                })
              linkToEntityToCopy.setAttribute('type', 'hidden')
              window.getSelection().removeAllRanges()
            }
          }
        })
        if (this.entitySchema.hasMixin('dataHistory')) {
          actions.push({
            icon: 'fa fa-history',
            caption: UB.i18n('ChangesHistory'),
            handler: {
              fn () {
                if (this.isNew) return
                let fieldList = this.fieldsToShow.concat(['ID', 'mi_modifyDate']),
                  extendedFieldList = UB.core.UBUtil.convertFieldListToExtended(this.fieldsToShow)

                function configureMixinAttribute (attributeCode) {
                  if (!extendedFieldList.find((field) => { return field.name === attributeCode })) {
                    fieldList = [attributeCode].concat(fieldList)
                    extendedFieldList = [{
                      name: attributeCode,
                      visibility: true,
                      description: UB.i18n(attributeCode)
                    }].concat(extendedFieldList)
                  }
                }

                configureMixinAttribute('mi_dateTo')
                configureMixinAttribute('mi_dateFrom')
                $App.doCommand({
                  cmdType: 'showList',
                  isModal: true,
                  cmdData: {
                    params: [{
                      entity: this.entitySchema.name, method: UB.core.UBCommand.methodName.SELECT, fieldList: fieldList
                    }]
                  },
                  cmpInitConfig: {
                    extendedFieldList: extendedFieldList
                  },
                  instanceID: this.value.ID,
                  __mip_recordhistory: true
                })
              }
            }
          })
        }
        if (this.entitySchema.hasMixin('audit')) {
          actions.push({
            icon: 'iconAudit',
            caption: UB.i18n('showAudit'),
            handler: {
              fn () {
                $App.doCommand({
                  cmdType: 'showList',
                  isModalDialog: true,
                  hideActions: ['addNew', 'addNewByCurrent', 'edit', 'del', 'newVersion'],
                  cmdData: {
                    params: [
                      UB.Repository('uba_auditTrail')
                        .attrs(['actionTime', 'actionType', 'actionUser', 'remoteIP'])
                        .where('[entity]', '=', this.entitySchema.name)
                        .where('[entityinfo_id]', '=', this.value.ID)
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
            enabled: $App.domainInfo.isEntityMethodsAccessible('uba_auditTrail', 'select')
          })
        }
        if (this.entitySchema.hasMixin('aclRls')) {
          let aclEntityName = this.entitySchema.mixins && this.entitySchema.mixins.aclRls && this.entitySchema.mixins.aclRls.useUnityName ?
            this.entitySchema.mixins.unity.entity + '_acl' : this.entitySchema.name + '_acl'
          actions.push({
            caption: UB.i18n('accessRight'),
            handler: {
              fn () {
                debugger
              }
            },
            enabled: $App.domainInfo.isEntityMethodsAccessible(aclEntityName, 'select')
          })
        }
        if (this.entitySchema.hasMixin('softLock')) {
          if (!this.isNew) {
            actions.push({
              caption: UB.i18n('lockBtn'),
              handler: {
                fn () {
                  debugger
                }
              }
            })
          }
          if (!this.isNew) {
            actions.push({
              caption: UB.i18n('unLockBtn'),
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
      }
    },
    methods: {
      onActionClick (data) {
        if (data.enabled === undefined || data.enabled) {
          data.handler.fn.call(data.handler.scope ? data.handler.scope : this)
        }
      }
    }
  }
</script>