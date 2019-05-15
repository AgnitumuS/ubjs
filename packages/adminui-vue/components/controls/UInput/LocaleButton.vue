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
      @open="initLangs"
    >
      <u-form-row
        v-for="item in langsData"
        :key="item.lang"
        :label="item.lang"
      >
        <el-input v-model="item.value" />
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
    ...mapGetters(['entityName']),

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
    }
  },

  methods: {
    save () {
      this.showModal = false
      for (const { attr, value } of this.langsData) {
        this.$store.commit('SET_DATA', {
          key: attr,
          value
        })
      }
    },

    async initLangs () {
      // fetch data if not loaded
      if (!this.isLoaded) {
        if (this.isNew) {
          // if new fill create empty fields in instance module
          const initialData = this.localeAttrs.reduce((obj, item) => {
            obj[item.attr] = ''
            return obj
          }, {})
          this.$store.commit('LOAD_DATA_PARTIAL', initialData)
        } else {
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
