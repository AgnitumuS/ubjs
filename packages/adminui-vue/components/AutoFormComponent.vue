<template>
  <div id="auto-form-app" v-if="fieldsToShow" v-loading="loading" style="height: 100%">
    <div style="height:100%">
      <div style="display: flex;justify-content: space-between;border-bottom: 1px solid rgba(66,73,86,.12);margin-bottom: 10px;padding: 0 16px">
        <div style="display: flex">
          <el-button :disabled="!saveEnabled" type="text" size="large" class="form-header__button" @click="saveAndClose">
            <i class="fa fa-share-square-o"></i>
          </el-button>
          <el-button :disabled="!saveEnabled" type="text" size="large" class="form-header__button" @click="saveAndReload">
            <i class="fa fa-save"></i>
          </el-button>
          <el-button :disabled="!canDelete" type="text" size="large" class="form-header__button" @click="remove">
            <i class="fa fa-trash-o"></i>
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
            <el-button type="text" slot="reference" size="large" class="form-header__button">
              <i class="fa fa-cog" aria-hidden="true"></i>
            </el-button>
          </el-popover>
          <div class="form-header__button__divider" v-if="isSimpleAudit"></div>
          <div class="form-header__date__container" v-if="isSimpleAudit">
            <div class="form-header__date">
              <b>{{createdEntityCaption}}:</b> {{ value.mi_createDate.toLocaleString() }}
            </div>
            <div class="form-header__date">
              <b>{{updatedEntityCaption}}:</b> {{ value.mi_modifyDate.toLocaleString() }}
            </div>
          </div>
        </div>
      </div>
      <div style="display: flex;height: 90%;padding: 0 20px">
        <el-scrollbar style="width:100%">
          <el-form :ref="$options.name" :model="value" label-position="left" label-width="150px">
            <el-form-item
                v-for="fieldName in fieldsToShow"
                :prop="fieldName"
                :key="fieldName"
                :rules="getRules(fieldName)"
                :label="entitySchema.attributes[fieldName].caption">
              <el-checkbox
                  v-if="entitySchema.attributes[fieldName].dataType === 'Boolean'"
                  v-model="value[fieldName]"
              ></el-checkbox>
              <el-date-picker
                  v-else-if="entitySchema.attributes[fieldName].dataType === 'DateTime' || entitySchema.attributes[fieldName].dataType === 'Date'"
                  v-model="value[fieldName]"
                  :type="entitySchema.attributes[fieldName].dataType.toLowerCase()"
                  placeholder="Select date and time"
              ></el-date-picker>
              <ub-select-enum
                  v-else-if="entitySchema.attributes[fieldName].dataType === 'Enum'"
                  v-model="value[fieldName]"
                  :eGroup="entitySchema.attributes[fieldName].enumGroup"
              ></ub-select-enum>
              <ub-select-entity
                  v-else-if="entitySchema.attributes[fieldName].dataType === 'Entity'"
                  v-model="value[fieldName]"
                  :entityName="entitySchema.attributes[fieldName].associatedEntity"
              ></ub-select-entity>
              <ub-select-many
                  v-else-if="entitySchema.attributes[fieldName].dataType === 'Many'"
                  v-model="value[fieldName]"
                  :entityName="entitySchema.attributes[fieldName].associatedEntity"
              ></ub-select-many>
              <el-input
                  v-else-if="['Int', 'BigInt'].includes(entitySchema.attributes[fieldName].dataType)"
                  type='number'
                  v-model="value[fieldName]"
              ></el-input>
              <el-input
                  v-else-if="'Float' === entitySchema.attributes[fieldName].dataType"
                  type='number'
                  :step="'0.01'"
                  :controls="false"
                  v-model="value[fieldName]"
              ></el-input>
              <el-input
                  v-else-if="'Currency' === entitySchema.attributes[fieldName].dataType"
                  type='number'
                  :step="`0.${'0'.repeat(UBDomain.FLOATING_SCALE_PRECISION-1)}1`"
                  :controls="false"
                  v-model="value[fieldName]"
              ></el-input>
              <el-input
                  v-else-if="entitySchema.attributes[fieldName].dataType === 'Text'"
                  type="textarea"
                  :autosize="{ minRows: 3, maxRows: 4}"
                  v-model="value[fieldName]"
              ></el-input>
              <ub-upload-document
                  v-else-if="entitySchema.attributes[fieldName].dataType === 'Document'"
                  v-model="value[fieldName]"
                  :docParams="{ entity: entitySchema.name, attribute: fieldName, ID: value.ID }"
              ></ub-upload-document>
              <ub-code-mirror
                  v-else-if="entitySchema.attributes[fieldName].dataType === 'Json'"
                  v-model="value[fieldName]"
              ></ub-code-mirror>
              <ub-input
                  v-else
                  v-model="value[fieldName]"
                  :isMultiLang="entitySchema.attributes[fieldName].isMultiLang"
                  :entityName="entitySchema.name"
                  :attributeName="fieldName"
                  :primaryValue="value.ID"
                  @saveLocalization="saveLocalization"
              ></ub-input>
            </el-form-item>
          </el-form>
          <input type="hidden" id="linkToEntity"
                 :value="linkToEntity">
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script>
  const ubSelectEnum = require('./controls/UbSelectEnum.vue')
  const ubSelectEntity = require('./controls/UbSelectEntity.vue')
  const ubSelectMany = require('./controls/UbSelectMany.vue')
  const ubInput = require('./controls/UbInput.vue')
  const ubUploadDocument = require('./controls/UbUploadDocument.vue')
  const ubCodeMirror = require('./controls/UbCodeMirror.vue')
  const ubDomain = require('@unitybase/cs-shared').UBDomain

  module.exports = {
    name: 'AutoForm',
    props: {
      value: {
        type: [Object],
        required: true
      },
      fieldsToShow: {
        type: [Array],
        required: true
      },
      entitySchema: {
        type: [Object],
        required: true
      },
      isNew: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      isSimpleAudit () {
        return this.entitySchema.mixins.mStorage && this.entitySchema.mixins.mStorage.simpleAudit
      },
      saveEnabled () {
        return this.canSave && Object.keys(this.changedColumns).length > 0
      },
      actions () {
        let actions = []
        // actions.push({
        //   icon: 'fa fa-refresh',
        //   caption: UB.i18n('obnovit'),
        //   handler: {
        //     fn () {
        //       debugger
        //     }
        //   }
        // })
        actions.push({
          icon: 'fa fa-save',
          caption: UB.i18n('sohranit'),
          handler: {
            fn () {
              this.saveAndReload()
            }
          },
          enabled: this.saveEnabled
        })
        actions.push({
          icon: 'fa fa-share-square-o',
          caption: UB.i18n('saveAndClose'),
          handler: {
            fn () {
              this.saveAndClose()
            }
          },
          enabled: this.saveEnabled
        })
        // if ($App.domainInfo.isEntityMethodsAccessible('ubm_form', UB.core.UBCommand.methodName.UPDATE)) {
        //   actions.push({
        //     icon: 'fa fa-wrench',
        //     caption: UB.i18n('formConstructor'),
        //     handler: {
        //       fn () {
        //         debugger
        //       }
        //     }
        //   })
        // }
        actions.push({
          icon: 'fa fa-trash-o',
          caption: UB.i18n('Delete'),
          handler: {
            fn () {
              this.remove()
            }
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
              let successful = document.execCommand('copy')
              if (successful)
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
            icon: 'iconHistory',
            caption: UB.i18n('ChangesHistory'),
            handler: {
              fn () {
                debugger
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
          var aclEntityName = this.entitySchema.name + '_acl'
          var entityM = this.entitySchema
          if (entityM.mixins && entityM.mixins.aclRls && entityM.mixins.aclRls.useUnityName) {
            aclEntityName = entityM.mixins.unity.entity + '_acl'
          }
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
      changedColumns () {
        let result = {}
        this.fieldsToShow.forEach((field) => {
          if (this.value[field] !== this.oldData[field]) {
            if (['Int', 'BigInt'].includes(this.entitySchema.attributes[field].dataType)) this.value[field] = Math.round(this.value[field])
            if ('Float' === this.entitySchema.attributes[field].dataType) this.value[field] = Math.round(this.value[field] * 100) / 100
            if ('Currency' === this.entitySchema.attributes[field].dataType) this.value[field] = Math.round(this.value[field] * Math.pow(10, UBDomain.FLOATING_SCALE_PRECISION)) / Math.pow(10, UBDomain.FLOATING_SCALE_PRECISION)
            result[field] = this.value[field]
          }
        })
        return result
      }
    },
    methods: {
      onActionClick (data) {
        if (data.enabled === undefined || data.enabled) {
          data.handler.fn.call(data.handler.scope ? data.handler.scope : this)
          this.popoverVisible = false
        }
      },
      getRules (fieldName) {
        let rules = []
        if (!this.entitySchema.attributes[fieldName].allowNull && this.entitySchema.attributes[fieldName].dataType !== 'Boolean') {
          rules.push({
            required: true,
            message: UB.format(UB.i18n('isRequiredFieldFmt'), this.entitySchema.attributes[fieldName].caption),
            trigger: 'blur'
          })
        }
        return rules
      },
      saveAndReload () {
        this.save((data, changed) => {
          if (changed) {
            let object = {}
            data.resultData.data[0].forEach((item, index) => {
              object[data.resultData.fields[index]] = item
            })
            this.$emit('input', object)
            this.oldData = object
          }
        })
      },
      saveAndClose () {
        this.save(() => {this.$emit('close')})
      },
      save (callback) {
        this.$refs[this.$options.name].validate((valid) => {
          if (valid) {
            let changedColumns = {...this.changedColumns, ...this.additionalData}
            if (Object.keys(changedColumns).length > 0) {
              Object.keys(this.additionalData).forEach((locColumn) => {
                let matches = locColumn.match(/(\w+)_\w\w\^/)
                if (matches && changedColumns.hasOwnProperty(matches[1])) {
                  changedColumns[`${matches[1]}_${$App.connection.userLang()}^`] = changedColumns[matches[1]]
                  delete changedColumns[matches[1]]
                }
              })
              changedColumns.ID = this.value.ID
              changedColumns.mi_modifyDate = this.value.mi_modifyDate
              let params = {
                fieldList: this.fieldsToShow.concat(['ID', 'mi_modifyDate']),
                entity: this.entitySchema.name,
                method: this.isNew ? 'insert' : 'update',
                execParams: changedColumns
              }
              this.loading = true
              $App.connection.update(params)
                .finally(function () {
                  this.loading = false
                }.bind(this))
                .then((result) => {
                  callback.call(this, result, true)
                  return result
                })
                .then((result) => {
                  $App.connection.emit(`${this.entitySchema.name}:changed`, result.execParams.ID)
                  $App.connection.emit(`${this.entitySchema.name}:${this.isNew ? 'insert' : 'update'}`, result.execParams.ID)
                })
            } else {
              callback.call(this, null, false)
            }
          }
        })
      },
      saveLocalization (data) {
        Object.values(data).forEach((item) => {
          this.additionalData[item.fieldName] = item.value
        })
      },
      remove () {
        this.loading = true
        $App.dialogYesNo('deletionDialogConfirmCaption', UB.format(UB.i18n('deleteFormConfirmCaption'), this.value[this.entitySchema.descriptionAttribute]))
          .then(function (res) {
            if (!res) {
              this.loading = false
              return
            }
            let request = {
              entity: this.entitySchema.name,
              method: 'delete',
              execParams: {
                ID: this.value.ID
              }
            }
            return $App.connection.doDelete(request).then(function (result) {
              $App.connection.emit(`${this.entitySchema.name}:changed`, result.execParams.ID)
              $App.connection.emit(`${this.entitySchema.name}:delete`, result.execParams.ID)
              this.$emit('close')
            }.bind(this)).finally(function () {
              this.loading = false
            }.bind(this))
          }.bind(this))
      },
      getParamsToString () {
        let prm = []
        prm.push('cmdType=showForm')
        prm.push(`entity=${this.entitySchema.name}`)
        prm.push(`instanceID=${this.value.ID}`)
        return prm.join('&')
      }
    },
    data () {
      return {
        UBDomain: ubDomain,
        oldData: {...this.value},
        additionalData: {},
        loading: false,
        canSave: this.entitySchema.haveAccessToAnyMethods([UB.core.UBCommand.methodName.INSERT, UB.core.UBCommand.methodName.UPDATE]),
        canDelete: this.entitySchema.haveAccessToMethod(UB.core.UBCommand.methodName.DELETE) && !this.isNew,
        linkToEntity: UB.format('{0}//{1}{2}#{3}', window.location.protocol, window.location.host, window.location.pathname, this.getParamsToString()),
        createdEntityCaption: UB.i18n('createdEntityCaption'),
        updatedEntityCaption: UB.i18n('updatedEntityCaption'),
      }
    },
    components: {
      'ub-select-enum': ubSelectEnum,
      'ub-select-entity': ubSelectEntity,
      'ub-select-many': ubSelectMany,
      'ub-input': ubInput,
      'ub-upload-document': ubUploadDocument,
      'ub-code-mirror': ubCodeMirror
    }
  }
</script>

<style>
  .form-header__button {
    min-width: 24px;
    font-size: 1.2em;
    cursor: pointer;
    margin: 0 12px;
    color: #636d7c;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .form-header__button__divider{
    width: 1px;
    margin: 5px 0;
    background-color: #424956;
    opacity: 0.2;
  }
  .form-header__date__container{
    margin: 0 16px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .form-header__date{
    color: #323b45;
    opacity: 0.54;
    line-height: 1.8;
    font-size: 10px;
  }

</style>