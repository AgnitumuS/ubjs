<template>
    <div id="auto-form-app" v-if="fieldsToShow">
        <el-container>
            <el-header style="background-color: #c0c0c0;line-height: 60px">
                <el-button size="small"><i class="fa fa-refresh"></i></el-button>
                <el-button size="small"><i class="fa fa-save"></i></el-button>
                <el-button size="small"><i class="fa fa-trash-o"></i></el-button>
                <el-button size="small"><i class="fa fa-cogs"></i></el-button>
            </el-header>
            <el-main style="background-color:#f9f9f9">
                <el-form label-position="left" label-width="150px">
                    <el-form-item v-for="fieldName in fieldsToShow"
                                  :required="!entitySchema.attributes[fieldName.attributeName].allowNull"
                                  :key="fieldName.attributeName"
                                  :label="entitySchema.attributes[fieldName.attributeName].caption"
                                  style="margin-bottom: 5px;">
                        <el-checkbox v-if="entitySchema.attributes[fieldName.attributeName].dataType === 'Boolean'"
                                     v-model="inputData[fieldName.attributeName]"></el-checkbox>
                        <el-date-picker
                                v-else-if="entitySchema.attributes[fieldName.attributeName].dataType === 'DateTime' || entitySchema.attributes[fieldName.attributeName].dataType === 'Date'"
                                v-model="inputData[fieldName.attributeName]"
                                :type="entitySchema.attributes[fieldName.attributeName].dataType.toLowerCase()"
                                placeholder="Select date and time">
                        </el-date-picker>
                        <ub-select-enum-component
                                v-else-if="entitySchema.attributes[fieldName.attributeName].dataType === 'Enum'"
                                v-model="inputData[fieldName.attributeName]"
                                :eGroup="entitySchema.attributes[fieldName.attributeName].enumGroup"
                        ></ub-select-enum-component>
                        <ub-select-entity-component
                                v-else-if="entitySchema.attributes[fieldName.attributeName].dataType === 'Entity'"
                                v-model="inputData[fieldName.attributeName]"
                        ></ub-select-entity-component>
                        <el-input v-else v-model="inputData[fieldName.attributeName]"></el-input>
                    </el-form-item>
                </el-form>
            </el-main>
        </el-container>
    </div>
</template>

<script>
  const ubSelectEnumComponent = require('./UbSelectEnumComponent.vue')
  const ubSelectEntityComponent = require('./UbSelectEntityComponent.vue')

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
      return {}
    },
    components: {
      'ub-select-enum-component': ubSelectEnumComponent,
      'ub-select-entity-component': ubSelectEntityComponent
    }
  }
</script>