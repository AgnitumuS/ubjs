<template>
  <div>
    <el-button
      :disabled="$parent.disabled"
      tabindex="-1"
      icon="u-icon-globe"
      @click="showModal = true"
    />
    <el-dialog
      :visible.sync="showModal"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
      class="u-locale-button__dialog"
      @open="initLangs"
    >
      <u-form-row
        v-for="(item, index) in langsData"
        :key="item.lang"
        :label="item.lang"
        :required="'required' in $v.langsData.$each[index].value.$params"
        :error="$v.langsData.$each[index].value.$error"
      >
        <el-input
          v-model="item.value"
          @keyup.native="$v.langsData.$each[index].value.$touch()"
        />
      </u-form-row>

      <el-button
        slot="footer"
        type="primary"
        @click="save"
      >
        {{ $ut('apply') }}
      </el-button>
    </el-dialog>
  </div>
</template>

<script>
const required = require('vuelidate/lib/validators/required').default

export default {
  name: 'UBaseLocaleButton',

  props: {
    /**
     * if `true`, modal dialog for editing translations would require values for all the languages
     */
    required: {
      type: Boolean,
      default: true
    },

    /**
     * a callback, which returns translations as array of objects `attr: string, value: *` or a promise;
     * control is designed to work with lazy loaded translations
     */
    loadLocalizedValues: {
      type: Function,
      required: true
    }
  },

  data () {
    return {
      showModal: false,
      langsData: []
    }
  },

  validations () {
    const value = this.required
      ? { required }
      : {}
    return {
      langsData: {
        $each: { value }
      }
    }
  },

  methods: {
    save () {
      this.$v.$touch()
      if (!this.$v.$error) {
        this.$v.$reset()
        this.showModal = false
        const editedData = {}
        for (const { attr, value } of this.langsData) {
          if (value !== null && value !== '') {
            editedData[attr] = value
          }
        }
        this.$emit('change', editedData)
      }
    },

    async initLangs () {
      this.langsData = await this.loadLocalizedValues()
    }
  }
}
</script>

<style>
.u-locale-button__dialog .el-dialog__body {
  padding: 10px 20px;
}
</style>
