<template>
  <div
    class="u-form-layout"
    v-loading="loading"
  >
    <u-toolbar>
      <template #left>
        <u-button
          v-if="!isNew"
          appearance="inverse"
          @click="openUserForm(userID)"
          :title="Number.isInteger(userID) ? $ut('org_employee_form.openUserCard') : $ut('org_employee_form.createUserCard')"
        >
          {{
            Number.isInteger(userID) ? $ut('org_employee_form.openUserCard') : $ut('org_employee_form.createUserCard')
          }}
        </u-button>
      </template>
    </u-toolbar>

    <u-form-container
      label-position="top"
      :max-width="800"
    >
      <el-tabs>
        <el-tab-pane :label="$ut('General')">
          <u-grid
            template-columns=" 200px 1fr"
            style="max-width: 800px;"
          >
            <u-auto-field
              attribute-name="avatar"
              force-cmp="u-file"
              preview-mode
              :remove-default-buttons="['webcam', 'scan', 'scanSettings', 'fullscreen', 'add', 'download']"
              :accept="'.jpg,.png'"
              :max-file-size-kb="1024"
            />

            <div>
              <u-auto-field attribute-name="firstName"/>
              <u-auto-field attribute-name="middleName"/>
              <u-auto-field attribute-name="lastName"/>
              <u-auto-field attribute-name="apply"/>
            </div>
          </u-grid>
          <u-grid
            template-columns="1fr 200px"
            style="max-width: 800px;"
          >
            <u-auto-field attribute-name="sexType"/>
            <u-auto-field attribute-name="birthDate" class="employee-birthdate-picker"/>
          </u-grid>
          <u-auto-field attribute-name="code"/>
          <u-auto-field attribute-name="description"/>
          <el-tabs>
            <el-tab-pane
              :label="$ut('cdn_contact')"
              class="u-form-max-width"
            >
              <u-table-entity
                bordered
                :repository="getContactsRepo"
                :columns="['contactTypeID', 'value']"
                :build-edit-config="getContactConfig"
                :build-copy-config="getContactConfig"
                :build-add-new-config="getContactConfig"
                style="max-width: 800px;"
              />
            </el-tab-pane>
            <el-tab-pane
              :label="$ut('org_employeeonstaff').split(' ')[0]"
              class="u-form-max-width"
            >
              <u-table-entity
                bordered
                :repository="getEmployeeOnStaffRepo"
                :columns="['mi_dateFrom', 'mi_dateTo', 'employeeOnStaffType', 'staffUnitID.name', 'staffUnitID.parentID.caption']"
                :build-edit-config="getEmployeeOnStaffConfig"
                :build-copy-config="getEmployeeOnStaffConfig"
                :build-add-new-config="getEmployeeOnStaffConfig"
                style="max-width: 800px;"
              />
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>
        <el-tab-pane :label="$ut('cases')">
          <u-grid class="u-form-max-width">
            <u-auto-field attribute-name="lastNameGen"/>
            <u-auto-field attribute-name="lastNameDat"/>
            <u-auto-field attribute-name="lastNameObj"/>
            <u-auto-field attribute-name="firstNameGen"/>
            <u-auto-field attribute-name="firstNameDat"/>
            <u-auto-field attribute-name="firstNameObj"/>
            <u-auto-field attribute-name="middleNameGen"/>
            <u-auto-field attribute-name="middleNameDat"/>
            <u-auto-field attribute-name="middleNameObj"/>
            <u-auto-field attribute-name="applyGen"/>
            <u-auto-field attribute-name="applyDat"/>
            <u-auto-field attribute-name="applyObj"/>
          </u-grid>
        </el-tab-pane>
      </el-tabs>
    </u-form-container>

    <el-dialog
      v-hold-focus
      :title="$ut('org_employee_form.createUserCard')"
      :close-on-click-modal="false"
      :visible.sync="addUserDialogVisible"
      width="500px"
      append-to-body
    >
      <u-form-row
        :label="$ut('org_employee_form.dialog.bindingType')"
        label-position="top"
      >
      </u-form-row>

      <u-radio
        v-model="userHandler"
        :items="bindOptions"
      ></u-radio>

      <u-form-row
        v-if="userHandler === 'bind'"
        :label="$ut('uba_user#captionSingular')"
        label-position="top"
      >
        <u-select-entity
          :repository="getUsersWithoutEmployeeRepo"
          v-model="userToBind"
        >
        </u-select-entity>
      </u-form-row>

      <span
        slot="footer"
        class="dom-dialog__footer"
      >
        <u-button
          color="primary"
          appearance="plain"
          @click="addUserDialogVisible = false"
        >
          {{ $ut('close') }}
        </u-button>

        <u-button
          color="primary"
          appearance="default"
          @click="userHandler === 'create' ? createNewUser() : bindUserToEmployee(userToBind)"
          :disabled="userHandler === 'bind' && !userToBind"
        >
          {{ $ut('org_employee_form.dialog.' + userHandler) }}
        </u-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* globals  $App, Vue */

const { mapState, mapGetters, mapActions } = require('vuex')
const { connection, Repository } = require('@unitybase/ub-pub')
const { Form, mapInstanceFields } = require('@unitybase/adminui-vue')

module.exports.mount = (cfg) => {
  Form({
    ...cfg,
    title: '{code} {fullFIO}'
  })
    .store()
    .processing({
      async inited ({ state, commit }) {
        Vue.set(state, 'userID', null)
        const userID = await Repository('org_employee')
          .attrs('userID')
          .where('ID', '=', state.data.ID)
          .misc({ __mip_disablecache: true })
          .selectScalar()
        commit('SET', { key: 'userID', value: userID })
      },

      saved () {
        connection.emitEntityChanged('uba_user', {})
      }

    })
    .validation()
    .mount()
}

export default {
  name: 'OrgEmployeeForm',

  data () {
    return {
      addUserDialogVisible: false,
      userToBind: null,
      userHandler: 'create',
      bindOptions: [
        { id: 'create', label: this.$ut('org_employee_form.dialog.createNewUser') },
        { id: 'bind', label: this.$ut('org_employee_form.dialog.bindToExistingUser') }
      ]
    }
  },

  computed: {
    ...mapInstanceFields([
      'ID',
      'lastName',
      'firstName',
      'middleName',
      'shortFIO',
      'fullFIO',
      'sexType',
      'apply'
    ]),

    ...mapState([
      'isNew',
      'userID'
    ]),

    ...mapGetters([
      'loading',
      'isDirty'
    ]),

    instanceID () {
      return this.$store.state.data.ID
    }
  },

  watch: {
    lastName (value, prevValue) {
      this.buildNameWatcher('lastName', value, prevValue)
      this.$store.commit('SET_DATA', { key: 'lastNameGen', value })
      this.$store.commit('SET_DATA', { key: 'lastNameDat', value })
      this.$store.commit('SET_DATA', { key: 'lastNameObj', value })
    },
    firstName (value, prevValue) {
      this.buildNameWatcher('firstName', value, prevValue)
      this.$store.commit('SET_DATA', { key: 'firstNameGen', value })
      this.$store.commit('SET_DATA', { key: 'firstNameDat', value })
      this.$store.commit('SET_DATA', { key: 'firstNameObj', value })
    },
    middleName (value, prevValue) {
      this.buildNameWatcher('middleName', value, prevValue)
      this.$store.commit('SET_DATA', { key: 'middleNameGen', value })
      this.$store.commit('SET_DATA', { key: 'middleNameDat', value })
      this.$store.commit('SET_DATA', { key: 'middleNameObj', value })
    },
    apply (value) {
      this.$store.commit('SET_DATA', { key: 'applyGen', value })
      this.$store.commit('SET_DATA', { key: 'applyDat', value })
      this.$store.commit('SET_DATA', { key: 'applyObj', value })
    },
    shortFIO (value) {
      this.$store.commit('SET_DATA', { key: 'shortFIOGen', value })
      this.$store.commit('SET_DATA', { key: 'shortFIODat', value })
      this.$store.commit('SET_DATA', { key: 'shortFIOObj', value })
    },
    fullFIO (value) {
      this.$store.commit('SET_DATA', { key: 'fullFIOGen', value })
      this.$store.commit('SET_DATA', { key: 'fullFIODat', value })
      this.$store.commit('SET_DATA', { key: 'fullFIOObj', value })
    }
  },

  mounted () {
    connection.addListener('uba_user:changed', this.refreshForm)
  },

  beforeDestroy () {
    connection.removeListener('uba_user:changed', this.refreshForm)
  },

  methods: {
    ...mapActions(['save']),

    getContactsRepo () {
      return Repository('cdn_contact')
        .attrs('contactTypeID', 'subjectID', 'value')
        .where('subjectID', '=', this.instanceID)
    },

    getContactConfig (cfg) {
      return {
        ...cfg,
        isModal: true,
        modalWidth: '800px',
        props: {
          parentContext: {
            subjectID: this.instanceID
          }
        }
      }
    },

    getEmployeeOnStaffRepo () {
      return Repository('org_employeeonstaff')
        .attrs('employeeOnStaffType', 'mi_dateFrom', 'mi_dateTo', 'staffUnitID.name', 'staffUnitID.parentID.caption')
        .where('employeeID', '=', this.instanceID)
    },

    getEmployeeOnStaffConfig (cfg) {
      return {
        ...cfg,
        isModal: true,
        modalWidth: '800px',
        props: {
          parentContext: {
            employeeID: this.instanceID,
            mi_dateFrom: new Date()
          }
        }
      }
    },

    getUsersWithoutEmployeeRepo () {
      return Repository('uba_user').attrs('ID', 'name')
        .notExists(
          Repository('org_employee')
            .correlation('userID', 'ID')
            .where('userID', 'notNull')
        )
        .orderBy('name', 'asc')
    },

    buildNameWatcher (prop, value, prevValue) {
      const fullFIOPrediction = this.buildFullFIO({ [prop]: prevValue })
      const fullFIO = this.fullFIO === null ? '' : this.fullFIO
      if (fullFIOPrediction === fullFIO) {
        this.$store.commit('SET_DATA', {
          key: 'fullFIO',
          value: this.buildFullFIO({ [prop]: value })
        })
      }

      const shortFIOPrediction = this.buildShortFIO({ [prop]: prevValue })
      const shortFIO = this.shortFIO === null ? '' : this.shortFIO
      if (shortFIOPrediction === shortFIO) {
        this.$store.commit('SET_DATA', {
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

    openUserForm (userID) {
      if (userID) {
        $App.doCommand({
          cmdType: 'showForm',
          formCode: 'uba_user',
          entity: 'uba_user',
          instanceID: userID
        })
      } else {
        this.addUserDialogVisible = true
      }
    },

    async createNewUser () {
      this.addUserDialogVisible = false

      await $App.doCommand({
        cmdType: 'showForm',
        formCode: 'uba_user',
        entity: 'uba_user',
        props: {
          parentContext: {
            lastName: this.$store.state.data.lastName,
            firstName: this.$store.state.data.firstName,
            middleName: this.$store.state.data.middleName,
            description: this.$store.state.data.description,
            fullName: this.$store.state.data.fullFIO,
            title: this.$store.state.data.apply
          },
          employeeID: this.instanceID
        }
      })
    },

    async bindUserToEmployee (userID) {
      this.addUserDialogVisible = false
      await connection.query({
        entity: 'org_employee',
        method: 'update',
        fieldList: ['ID', 'userID'],
        execParams: {
          mi_modifyDate: new Date(),
          ID: this.ID,
          userID
        },
        __skipOptimisticLock: true
      })
      this.$store.commit('SET', { key: 'userID', value: userID })
    },

    async refreshForm (event) {
      if (this.userID && event.execParams?.ID !== this.userID) {
        return
      }

      if (!this.userID) {
        await this.updateUserID()
      }

      await this.$store.dispatch('refresh', { skipNotify: true })
      if (this.isDirty) {
        this.save()
      }
    },

    async updateUserID () {
      const userID = await Repository('org_employee')
        .attrs('userID')
        .where('ID', '=', this.instanceID)
        .misc({ __mip_disablecache: true })
        .selectScalar()
      this.$store.commit('SET', { key: 'userID', value: userID })
    }
  }
}
</script>

<style>
.employee-birthdate-picker .u-date-picker__date {
  width: auto !important;
}
</style>
