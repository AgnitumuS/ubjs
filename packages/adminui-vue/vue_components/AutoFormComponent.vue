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
                        :key="fieldName.attributeName" :label="entitySchema.attributes[fieldName.attributeName].caption"
                        style="margin-bottom: 5px;">
            <el-checkbox v-if="entitySchema.attributes[fieldName.attributeName].dataType === 'Boolean'"
                         v-model="inputData[fieldName.attributeName]"></el-checkbox>
            <el-date-picker v-else-if="entitySchema.attributes[fieldName.attributeName].dataType === 'DateTime' || entitySchema.attributes[fieldName.attributeName].dataType === 'Date'"
                            v-model="inputData[fieldName.attributeName]" :type="entitySchema.attributes[fieldName.attributeName].dataType.toLowerCase()"
                            placeholder="Select date and time">
            </el-date-picker>
            <el-select v-else-if="entitySchema.attributes[fieldName.attributeName].dataType === 'Enum'"
                       v-model="inputData[fieldName.attributeName]"
                       filterable reserve-keyword clearable placeholder="Please enter a keyword">
              <el-option v-for="item in externalData[fieldName.attributeName]" :key="item.code"
                         :label="item.name" :value="item.code">
              </el-option>
            </el-select>
            <el-input v-else v-model="inputData[fieldName.attributeName]"></el-input>
          </el-form-item>
        </el-form>
      </el-main>
    </el-container>
  </div>
</template>

<script>
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
        externalData: {}
      }
    },
    mounted () {
      Object.keys(this.entitySchema.attributes).forEach((attributeName) => {
        var attr = this.entitySchema.attributes[attributeName]
        if (attr.dataType === 'Enum') {
          UB.Repository('ubm_enum').attrs(['code', 'name', 'eGroup']).where('eGroup', '=', attr.enumGroup).select()
            .then((result) => {
              this.externalData[attr.name] = result
            })
        }
      })
    }
  }
</script>