<template>
    <div id="auto-form-app" v-if="fieldsToShow">
        <el-container>
            <el-header style="background-color: #c0c0c0;line-height: 60px">
                <el-button size="small"><i class="fa fa-refresh"></i></el-button>
                <el-button size="small" @click="saveAndClose"><i class="fa fa-save"></i></el-button>
                <el-button size="small"><i class="fa fa-trash-o"></i></el-button>
                <el-button size="small"><i class="fa fa-cogs"></i></el-button>
            </el-header>
            <el-main>
                <el-form label-position="left" label-width="150px">
                    <el-form-item
                            v-for="fieldName in fieldsToShow"
                            :required="!entitySchema.attributes[fieldName].allowNull"
                            :key="fieldName"
                            :label="entitySchema.attributes[fieldName].caption"
                            style="margin-bottom: 5px;">
                        <el-checkbox
                                v-if="entitySchema.attributes[fieldName].dataType === 'Boolean'"
                                v-model="inputData[fieldName]"></el-checkbox>
                        <el-date-picker
                                v-else-if="entitySchema.attributes[fieldName].dataType === 'DateTime' || entitySchema.attributes[fieldName].dataType === 'Date'"
                                v-model="inputData[fieldName]"
                                :type="entitySchema.attributes[fieldName].dataType.toLowerCase()"
                                placeholder="Select date and time">
                        </el-date-picker>
                        <ub-select-enum
                                v-else-if="entitySchema.attributes[fieldName].dataType === 'Enum'"
                                v-model="inputData[fieldName]"
                                :eGroup="entitySchema.attributes[fieldName].enumGroup"
                        ></ub-select-enum>
                        <ub-select-entity
                                v-else-if="entitySchema.attributes[fieldName].dataType === 'Entity'"
                                v-model="inputData[fieldName]"
                                :entityName="entitySchema.attributes[fieldName].associatedEntity"
                        ></ub-select-entity>
                        <ub-select-many
                                v-else-if="entitySchema.attributes[fieldName].dataType === 'Many'"
                                v-model="inputData[fieldName]"
                                :entityName="entitySchema.attributes[fieldName].associatedEntity"
                        ></ub-select-many>
                        <el-input
                                v-else-if="['Int', 'BigInt'].includes(entitySchema.attributes[fieldName].dataType)"
                                type='number'
                                v-model="inputData[fieldName]"
                        ></el-input>
                        <el-input
                                v-else-if="'Float' === entitySchema.attributes[fieldName].dataType"
                                type='number'
                                :step="'0.01'"
                                :controls="false"
                                v-model="inputData[fieldName]"></el-input>
                        <el-input
                                v-else-if="'Currency' === entitySchema.attributes[fieldName].dataType"
                                type='number'
                                :step="`0.${'0'.repeat(UBDomain.FLOATING_SCALE_PRECISION-1)}1`"
                                :controls="false"
                                v-model="inputData[fieldName]"
                        ></el-input>
                        <el-input
                                v-else-if="entitySchema.attributes[fieldName].dataType === 'Text'"
                                type="textarea"
                                :autosize="{ minRows: 3, maxRows: 4}"
                                v-model="inputData[fieldName]"
                        ></el-input>
                        <ub-upload-document
                                v-else-if="entitySchema.attributes[fieldName].dataType === 'Document'"
                                v-model="inputData[fieldName]"
                                :docParams="{ entity: entitySchema.name, attribute: fieldName, ID: inputData.ID }"
                        ></ub-upload-document>
                        <ub-code-mirror
                                v-else-if="entitySchema.attributes[fieldName].dataType === 'Json'"
                                v-model="inputData[fieldName]"
                        ></ub-code-mirror>
                        <ub-input
                                v-else
                                v-model="inputData[fieldName]"
                                :isMultiLang="entitySchema.attributes[fieldName].isMultiLang"
                                :entityName="entitySchema.name"
                                :attributeName="fieldName"
                                :primaryValue="inputData.ID"
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
    props: {
      fieldsToShow: {
        type: [Array],
        required: true
      },
      entitySchema: {
        type: [Object],
        required: true
      },
      inputData: {
        type: [Object],
        required: true
      },
      isNew: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      saveAndClose () {
        this.save(() => {this.$emit('close')})
      },
      save (callback) {
        let changedColumns = {}
        this.fieldsToShow.forEach((field) => {
          if (this.inputData[field] !== this.oldData[field]) changedColumns[field] = this.inputData[field]
        })
        changedColumns = {...changedColumns, ...this.additionalData}
        if (Object.keys(changedColumns).length > 0) {
          Object.keys(this.additionalData).forEach((locColumn) => {
            let matches = locColumn.match(/(\w+)_\w\w\^/)
            if (matches && changedColumns.hasOwnProperty(matches[1])) {
              changedColumns[`${matches[1]}_${$App.connection.userLang()}^`] = changedColumns[matches[0]]
              delete changedColumns[matches[1]]
            }
          })
          changedColumns.ID = this.inputData.ID
          changedColumns.mi_modifyDate = this.inputData.mi_modifyDate
          let params = {
            fieldList: this.fieldsToShow.concat(['ID', 'mi_modifyDate']),
            entity: this.entitySchema.name,
            method: this.isNew ? 'insert' : 'update',
            execParams: changedColumns
          }
          $App.connection.update(params)
            .then((result) => {
              callback.call()
            })
        } else {
          callback.call()
        }
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
        oldData: {...this.inputData},
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