<template>
    <div id="auto-form-app" v-if="fieldsToShow">
        <el-container>
            <el-header style="background-color: #c0c0c0;line-height: 60px">
                <!-- <el-button size="small"><i class="fa fa-refresh"></i></el-button> -->
                <el-button size="small" @click="saveAndClose"><i class="fa fa-share-square-o"></i></el-button>
                <el-button size="small" @click="saveAndReload"><i class="fa fa-save"></i></el-button>
                <!-- <el-button size="small"><i class="fa fa-trash-o"></i></el-button>
                <el-button size="small"><i class="fa fa-cogs"></i></el-button> -->
            </el-header>
            <el-main>
                <el-form :ref="$options.name" :model="value" label-position="left" label-width="150px">
                    <el-form-item
                            v-for="fieldName in fieldsToShow"
                            :prop="fieldName"
                            :key="fieldName"
                            :rules="[
                              { 
                                required: !entitySchema.attributes[fieldName].allowNull && entitySchema.attributes[fieldName].dataType !== 'Boolean',
                                message: `${entitySchema.attributes[fieldName].caption} is required`
                              }
                            ]"
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
            </el-main>
        </el-container>
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
      changedColumns () {
        let result = {}
        this.fieldsToShow.forEach((field) => {
          if (this.value[field] !== this.oldData[field]) result[field] = this.value[field]
        })
        return result
      }
    },
    methods: {
      saveAndReload () {
        this.save((data, changed) => {
          if (changed) {
            let object = {}
            data.resultData.data[0].forEach((item, index) => {
              object[data.resultData.fields[index]] = item
            })
            this.$emit('input', object)
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
              $App.connection.update(params)
                .then((result) => {
                  callback.call(this, result, true)
                  return result
                })
                .then((result) => {
                  $App.connection.emit(`${this.entitySchema.name}:changed`, result.execParams.ID)
                  // $App.connection.emit(`${this.entitySchema.name}:${this.isNew ? 'insert' : 'update'}`, result.execParams.ID)
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
      }
    },
    data () {
      return {
        UBDomain: ubDomain,
        oldData: {...this.value},
        additionalData: {}
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