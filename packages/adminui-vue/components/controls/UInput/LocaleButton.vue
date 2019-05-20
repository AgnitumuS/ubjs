<template>
  <div>
    <el-button
      class="fa fa-globe"
      :disabled="$parent.disabled"
      tabindex="-1"
      @click="showModal = true"
    />
    <el-dialog
      :visible.sync="showModal"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
      @open="initLangs"
    >
      <u-form-row
        v-for="(item, index) in langsData"
        :key="item.lang"
        :label="item.lang"
        :required="$v.langsData.$each[index].value.$params.hasOwnProperty('required')"
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
        Save
      </el-button>
    </el-dialog>
  </div>
</template>

<script>
const { mapState, mapGetters } = require('vuex')
const required = require('vuelidate/lib/validators/required').default

export default {
  name: 'LocaleButton',

  props: {
    attributeName: String
  },

  data () {
    return {
      showModal: false,
      langsData: []
    }
  },

  computed: {
    ...mapState(['isNew']),
    ...mapGetters(['entityName', 'entitySchema']),

    supportedLanguages () {
      return this.$UB.connection.appConfig.supportedLanguages
    },

    userLang () {
      return this.$UB.connection.userLang()
    },

    localeAttrs () {
      return this.supportedLanguages
        .filter(l => l !== this.userLang)
        .map(lang => ({
          attr: `${this.attributeName}_${lang}^`,
          lang
        }))
    },

    mainAttr () {
      return {
        attr: this.attributeName,
        lang: this.userLang
      }
    },

    attrs () {
      return [
        this.mainAttr,
        ...this.localeAttrs
      ]
    },

    isLoaded () {
      return this.localeAttrs.every(item => item.attr in this.$store.state.data)
    },

    isMasterAttrRequired () {
      return this.entitySchema.attributes[this.attributeName].allowNull === false
    }
  },

  validations () {
    const isRequired = !this.isNew && this.isMasterAttrRequired
    const value = isRequired ? { required } : {}

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
        for (const { attr, value } of this.langsData) {
          if (value !== null && value !== '') {
            this.$store.commit('SET_DATA', {
              key: attr,
              value
            })
          }
        }
      }
    },

    async initLangs () {
      // fetch data if not loaded
      if (!this.isLoaded) {
        if (!this.isNew) {
          // fetch localized fields
          const fieldList = ['ID']
          fieldList.push(
            ...this.localeAttrs.map(item => item.attr)
          )
          const data = await this.$UB.connection.query({
            entity: this.entityName,
            ID: this.$store.state.data.ID,
            fieldList,
            method: 'select'
          }).then(r => this.$UB.LocalDataStore.selectResultToArrayOfObjects(r)[0])
          delete data.ID
          this.$store.commit('LOAD_DATA_PARTIAL', data)
        }
      }

      const updatedData = this.attrs.map(item => {
        const value = this.$store.state.data[item.attr]
        return {
          ...item,
          value
        }
      })
      this.langsData.splice(0, this.langsData.length, ...updatedData)
    }
  }
}
</script>
