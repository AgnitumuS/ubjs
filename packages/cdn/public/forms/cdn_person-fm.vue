<template>
  <div class="u-form-layout">
    <u-toolbar />

    <u-form-container
      v-loading.body="loading"
      label-position="top"
    >
      <el-tabs>
        <el-tab-pane :label="$ut('General')">
          <u-grid template-columns="1fr 300px">
            <div>
              <u-grid>
                <u-auto-field attribute-name="lastName" />
                <u-auto-field attribute-name="firstName" />
                <u-auto-field attribute-name="middleName" />
                <u-auto-field attribute-name="suffix" />
                <u-auto-field attribute-name="shortFIO" />
                <u-auto-field attribute-name="fullFIO" />
              </u-grid>

              <u-form-row
                required
                :label="`${entity}.sexType`"
                :error="$v.sexType.$error"
              >
                <el-radio
                  v-for="({key, caption}) in sexTypeDictionary"
                  :key="key"
                  v-model="sexType"
                  :label="key"
                >
                  {{ caption }}
                </el-radio>
              </u-form-row>

              <u-grid>
                <u-auto-field attribute-name="categoryID" />
                <u-auto-field attribute-name="apply" />
                <u-auto-field attribute-name="identCard" />
                <u-auto-field attribute-name="workPlacePos" />
              </u-grid>

              <u-auto-field attribute-name="birthDate" />

              <u-grid>
                <u-auto-field attribute-name="socialstatusID" />
                <u-auto-field attribute-name="description" />
                <u-auto-field attribute-name="regionID" />
              </u-grid>

              <u-table-entity
                v-if="ID"
                :repository="contactsRepository"
                :columns="['contactTypeID', 'value']"
                :build-edit-config="getConfig"
                :build-add-new-config="getConfig"
                :before-add-new="saveParentBeforeAddNew"
              />
            </div>
            <u-file
              v-model="photo"
              attribute-name="photo"
              :preview-mode="{
                height: 300
              }"
              accept="image/*"
            />
          </u-grid>
        </el-tab-pane>

        <el-tab-pane :label="$ut('cases')">
          <u-grid class="u-form-max-width">
            <u-auto-field attribute-name="lastNameGen" />
            <u-auto-field attribute-name="shortFIOGen" />
            <u-auto-field attribute-name="lastNameDat" />
            <u-auto-field attribute-name="shortFIODat" />
            <u-auto-field attribute-name="firstNameGen" />
            <u-auto-field attribute-name="fullFIOGen" />
            <u-auto-field attribute-name="firstNameDat" />
            <u-auto-field attribute-name="fullFIODat" />
            <u-auto-field attribute-name="middleNameGen" />
            <u-auto-field attribute-name="applyGen" />
            <u-auto-field attribute-name="middleNameDat" />
            <u-auto-field attribute-name="applyDat" />
          </u-grid>
        </el-tab-pane>
      </el-tabs>
    </u-form-container>
  </div>
</template>

<script>
const { Form, mapInstanceFields } = require('@unitybase/adminui-vue')
const { mapState, mapGetters } = require('vuex')

module.exports.mount = cfg => {
  Form(cfg)
    .processing()
    .validation()
    .mount()
}

module.exports.default = {
  name: 'CdnPerson',
  inject: ['entity', '$v'],

  computed: {
    ...mapInstanceFields([
      'ID',
      'lastName',
      'firstName',
      'middleName',
      'fullFIO',
      'shortFIO',
      'sexType',
      'photo'
    ]),
    ...mapState(['isNew']),
    ...mapGetters(['loading', 'canSave']),

    sexTypeDictionary () {
      const dictionary = this.$UB.core.UBEnumManager.getGroupData('CDN_SEXTYPE')
      return dictionary.map(([key, caption]) => ({ key, caption }))
    }
  },

  watch: {
    lastName (value, prevValue) {
      this.buildNameWatcher('lastName', value, prevValue)
    },
    firstName (value, prevValue) {
      this.buildNameWatcher('firstName', value, prevValue)
    },
    middleName (value, prevValue) {
      this.buildNameWatcher('middleName', value, prevValue)
    }
  },

  methods: {
    contactsRepository () {
      return this.$UB.connection.Repository('cdn_contact')
        .attrs('ID', 'contactTypeID', 'value')
        .where('subjectID', '=', this.ID)
    },

    buildNameWatcher (prop, value, prevValue) {
      const fullFIOPrediction = this.buildFullFIO({ [prop]: prevValue })
      const fullFIO = this.fullFIO === null ? '' : this.fullFIO
      if (fullFIOPrediction === fullFIO) {
        this.$store.commit(`SET_DATA`, {
          key: 'fullFIO',
          value: this.buildFullFIO({ [prop]: value })
        })
      }

      const shortFIOPrediction = this.buildShortFIO({ [prop]: prevValue })
      const shortFIO = this.shortFIO === null ? '' : this.shortFIO
      if (shortFIOPrediction === shortFIO) {
        this.$store.commit(`SET_DATA`, {
          key: 'shortFIO',
          value: this.buildShortFIO({ [prop]: value })
        })
      }
    },

    notNull (value) {
      return value !== null &&
        value !== undefined &&
        value !== ''
    },

    buildFullFIO ({ lastName, firstName, middleName }) {
      return [
        lastName === undefined ? this.lastName : lastName,
        firstName === undefined ? this.firstName : firstName,
        middleName === undefined ? this.middleName : middleName
      ].filter(this.notNull).join(' ')
    },

    buildShortFIO ({ lastName, firstName, middleName }) {
      return [
        lastName === undefined ? this.lastName : lastName,
        this.initialLetter(firstName === undefined ? this.firstName : firstName),
        this.initialLetter(middleName === undefined ? this.middleName : middleName)
      ].filter(this.notNull).join(' ')
    },

    initialLetter (word) {
      return word ? `${word[0].toUpperCase()}.` : ''
    },

    getConfig (cfg) {
      return {
        ...cfg,
        isModal: true,
        parentContext: {
          subjectID: this.ID,
          store: this.$store
        }
      }
    },

    async saveParentBeforeAddNew () {
      if (this.isNew || this.canSave) {
        await this.$store.dispatch('save')
      }
    }
  }
}
</script>
