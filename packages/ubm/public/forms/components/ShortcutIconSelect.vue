<template>
  <u-form-row
    :label="entitySchema.attributes.iconCls.caption"
  >
    <el-row
      :gutter="10"
      type="flex"
      align="middle"
    >
      <el-col :span="8">
        <el-input v-model="iconCls">
          <el-button
            slot="append"
            icon="el-icon-info"
            @click="dialogVisible = true"
          >
            choose
          </el-button>
        </el-input>
      </el-col>
      <el-col
        :span="2"
        style="text-align: center"
      >
        <i
          :class="iconCls"
          style="font-size: 32px;"
        />
      </el-col>
      <el-col :span="14">
        тут должна быть надпись про то что нужно юзать el и fa
      </el-col>
    </el-row>
  </u-form-row>
</template>

<script>
const { mapGetters } = require('vuex')
const { mapInstanceFields } = require('@unitybase/adminui-vue')

export default {
  name: 'ShortcutIconSelect',

  data () {
    return {
      availableIconCls: []
    }
  },

  computed: {
    ...mapInstanceFields(['iconCls']),
    ...mapGetters(['entitySchema', 'loading'])
  },

  mounted () {
    this.initElIcons()
  },

  methods: {
    initElIcons () {
      for (const ss of document.styleSheets) {
        for (const r of ss.rules) {
          if (r.selectorText && r.selectorText.startsWith('.el-icon')) {
            this.availableIconCls.push(r.selectorText.split(':')[0].substr(1))
          }
        }
      }
    }
  }

}
</script>
