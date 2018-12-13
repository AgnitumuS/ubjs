<template>
    <div id="auto-form-app" v-if="fieldsToShow">
        <el-container>
            <el-header style="background-color: #c0c0c0;line-height: 60px">
                <el-button size="small"><i class="fa fa-refresh"></i></el-button>
                <el-button size="small"><i class="fa fa-save"></i></el-button>
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
                                v-model="inputData[fieldName]"></el-input>
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
                                v-model="inputData[fieldName]"></el-input>
                        <el-input
                                v-else-if="entitySchema.attributes[fieldName].dataType === 'Text'"
                                type="textarea"
                                :autosize="{ minRows: 3, maxRows: 4}"
                                v-model="inputData[fieldName]"></el-input>
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
                                @saveLocalization="saveLocalization"></ub-input>
                    </el-form-item>
                </el-form>
            </el-main>
        </el-container>
    </div>
</template>

<script>
  const ubSelectEnum = require('./vue_controls/UbSelectEnum.vue')
  const ubSelectEntity = require('./vue_controls/UbSelectEntity.vue')
  const ubSelectMany = require('./vue_controls/UbSelectMany.vue')
  const ubInput = require('./vue_controls/UbInput.vue')
  const ubUploadDocument = require('./vue_controls/UbUploadDocument.vue')
  const ubCodeMirror = require('./vue_controls/UbCodeMirror.vue')
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
      }
    },
    methods: {
      saveLocalization (data) {
        console.log(data)
      }
    },
    data: function () {
      return {
        UBDomain: ubDomain
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