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
                    <el-form-item v-for="fieldName in fieldsToShow"
                                  :required="!entitySchema.attributes[fieldName].allowNull"
                                  :key="fieldName"
                                  :label="entitySchema.attributes[fieldName].caption"
                                  style="margin-bottom: 5px;">
                        <el-checkbox v-if="entitySchema.attributes[fieldName].dataType === 'Boolean'"
                                     v-model="inputData[fieldName]"></el-checkbox>
                        <el-date-picker
                                v-else-if="entitySchema.attributes[fieldName].dataType === 'DateTime' || entitySchema.attributes[fieldName].dataType === 'Date'"
                                v-model="inputData[fieldName]"
                                :type="entitySchema.attributes[fieldName].dataType.toLowerCase()"
                                placeholder="Select date and time">
                        </el-date-picker>
                        <ub-select-enum-component
                                v-else-if="entitySchema.attributes[fieldName].dataType === 'Enum'"
                                v-model="inputData[fieldName]"
                                :eGroup="entitySchema.attributes[fieldName].enumGroup"
                        ></ub-select-enum-component>
                        <ub-select-entity-component
                                v-else-if="entitySchema.attributes[fieldName].dataType === 'Entity'"
                                v-model="inputData[fieldName]"
                                :entityName="entitySchema.attributes[fieldName].associatedEntity"
                        ></ub-select-entity-component>
                        <el-input type='number'
                                  v-else-if="['Int', 'BigInt'].includes(entitySchema.attributes[fieldName].dataType)"
                                  v-model="inputData[fieldName]"/>
                        <el-input type='number' :step="'0.01'"
                                  v-else-if="'Float' === entitySchema.attributes[fieldName].dataType" :controls="false"
                                  v-model="inputData[fieldName]"/>
                        <el-input type='number' :step="`0.${'0'.repeat(UBDomain.FLOATING_SCALE_PRECISION-1)}1`"
                                  v-else-if="'Currency' === entitySchema.attributes[fieldName].dataType"
                                  :controls="false"
                                  v-model="inputData[fieldName]"/>
                        <el-input v-else v-model="inputData[fieldName]"></el-input>
                    </el-form-item>
                </el-form>
            </el-main>
        </el-container>
    </div>
</template>

<script>
  const ubSelectEnumComponent = require('./UbSelectEnumComponent.vue')
  const ubSelectEntityComponent = require('./UbSelectEntityComponent.vue')
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
    data: function () {
      return {
        'UBDomain': ubDomain
      }
    },
    components: {
      'ub-select-enum-component': ubSelectEnumComponent,
      'ub-select-entity-component': ubSelectEntityComponent
    }
  }
</script>