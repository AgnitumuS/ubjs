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
          icon="u-icon-key"
          :title="$ut('changePassword')"
          style="margin-left: 40px;"
          @click="showChangePasswordDialog"
        >
          {{ $ut('changePassword') }}
        </u-button>

        <u-button
          v-if="isOrgEnabled && !isNew"
          appearance="inverse"
          @click="openEmployeeForm(employeeID)"
          :title="Number.isInteger(employeeID) ? $ut('uba_user_form.openEmployeeCard') : $ut('uba_user_form.createEmployeeCard')"
        >
          {{
            Number.isInteger(employeeID) ? $ut('uba_user_form.openEmployeeCard') : $ut(
              'uba_user_form.createEmployeeCard')
          }}
        </u-button>
      </template>

      <template #right>
        <el-tag
          v-if="pending"
          class="dom-tag-in-toolbar"
          type="warning"
        >
          {{ $ut('uba_user.isPending') }}
        </el-tag>
        <el-tag
          v-if="disabled"
          class="dom-tag-in-toolbar"
          type="danger"
        >
          {{ $ut('uba_user.disabled') }}
        </el-tag>
      </template>

      <template #dropdown>
        <u-dropdown-item divider/>
        <u-dropdown-item
          icon="u-icon-person-settings"
          label="uba_user_form.editUData"
          @click="uDataDialogVisible = true"
        />
      </template>
    </u-toolbar>

    <u-form-container
      label-position="top"
      :max-width="800"
    >
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
          <u-auto-field
            attribute-name="firstName"
          />

          <u-auto-field
            attribute-name="middleName"
          />

          <u-auto-field
            attribute-name="lastName"
          />

          <u-auto-field
            attribute-name="title"
          />
        </div>
      </u-grid>

      <u-grid
        template-columns="1fr 200px"
        style="max-width: 800px;"
      >
        <u-auto-field
          attribute-name="name"
          required
        />
        <u-auto-field
          :readonly="!isSupervisor"
          attribute-name="disabled"
          force-cmp="el-switch"
        />
      </u-grid>

      <u-auto-field
        attribute-name="email"
      />
      <u-auto-field
        attribute-name="phone"
      />

      <u-form-row
        :label="$ut('roles')"
      >
        <u-select-collection
          associated-attr="roleID"
          entity-name="uba_userrole"
          :repository="getRolesRepo"
          collection-name="userRoles"
          clearable
        />
      </u-form-row>

      <u-form-row
        :label="$ut('uba_user_form.groups')"
      >
        <u-select-collection
          associated-attr="groupID"
          entity-name="uba_usergroup"
          collection-name="userGroups"
          clearable
        />
      </u-form-row>

      <u-field-set
        title="uba_user_form.extraAuthSettings"
        v-model="extraAuthSettingsExpanded"
        style="max-width: 800px;"
      >
        <u-auto-field
          v-if="isPendingOriginally && isSupervisor"
          attribute-name="isPending"
          force-cmp="el-switch"
          :max-width="400"
          label-position="right"
          :label-width="200"
        />

        <u-auto-field
          attribute-name="trustedIP"
          :readonly="!isSupervisor"
        >
          <div class="dom-description_text">
            {{ $ut('uba_user.trustedIP#documentation') }}
          </div>
        </u-auto-field>

        <u-table-entity
          bordered
          :repository="getUserCertificates"
          :build-edit-config="getCertConfig"
          :build-copy-config="getCertConfig"
          :build-add-new-config="getCertConfig"
        />
      </u-field-set>
    </u-form-container>

    <el-dialog
      v-hold-focus
      :title="$ut('uba_user_form.otherSettings')"
      :close-on-click-modal="false"
      :visible.sync="uDataDialogVisible"
      width="500px"
      append-to-body
    >
      <u-form-container
        :label-width="150"
        label-position="top"
        class="dom-dialog__form"
      >
        <u-auto-field
          attribute-name="uData"
          type="textarea"
          :autosize="{minRows: 2, maxRows: 6}"
        />
      </u-form-container>

      <span
        slot="footer"
        class="dom-dialog__footer"
      >
        <u-button
          color="primary"
          appearance="plain"
          @click="uDataDialogVisible = false"
        >
          {{ $ut('close') }}
        </u-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* globals  $App */

const { mapState, mapGetters, mapActions } = require('vuex')
const { email, required } = require('vuelidate/lib/validators/index')
const { connection, Repository } = require('@unitybase/ub-pub')
const { Form, mapInstanceFields } = require('@unitybase/adminui-vue')
const { buildFullName } = require('./uba_user/utils/person-name-utils')

module.exports.mount = (cfg) => {
  Form({
    ...cfg,
    title: '{name} {fullName}'
  })
    .store({
      state () {
        return {
          employeeID: null
        }
      }
    })
    .processing({
      masterFieldList: [
        'ID',
        'name',
        'title',
        'firstName',
        'middleName',
        'lastName',
        'fullName',
        'email',
        'phone',
        'description',
        'disabled',
        'isPending',
        'trustedIP',
        'uData',
        'avatar',
        'mi_modifyDate'
      ],

      collections: {
        userRoles: ({ state }) => Repository('uba_userrole')
          .attrs('ID', 'userID', 'roleID')
          .where('userID', '=', state.data.ID),
        userGroups: ({ state }) => Repository('uba_usergroup')
          .attrs('ID', 'userID', 'groupID')
          .where('userID', '=', state.data.ID)
      },

      async inited ({ state, commit }) {
        if (this.props?.employeeID) {
          commit('SET', { key: 'employeeID', value: this.props.employeeID })
          return
        }

        if (connection.domain.models.ORG) {
          const employeeID = await Repository('org_employee')
            .attrs('ID')
            .where('userID', '=', state.data.ID)
            .misc({ __mip_disablecache: true })
            .selectScalar()
          commit('SET', { key: 'employeeID', value: employeeID })
        }
      },

      async saved ({ state }) {
        if (this.props?.employeeID) {
          await connection.query({
            entity: 'org_employee',
            method: 'update',
            fieldList: ['ID', 'userID'],
            execParams: {
              mi_modifyDate: new Date(),
              ID: this.props.employeeID,
              userID: state.data.ID
            },
            __skipOptimisticLock: true
          })
        }
        connection.emitEntityChanged('org_employee', {})
      }
    })
    .validation({
      validations () {
        return {
          name: { required },
          email: { email }
        }
      }
    })
    .mount()
}

export default {
  name: 'UbaUserForm',

  data () {
    return {
      uDataDialogVisible: false
    }
  },

  mounted () {
    connection.addListener('org_employee:changed', this.refreshForm)
  },

  beforeDestroy () {
    connection.removeListener('org_employee:changed', this.refreshForm)
  },

  watch: {
    fullName (value) {
      this.$store.commit('SET_DATA', { key: 'fullName', value })
    }
  },

  computed: {
    /**
     * Use to only allow changing "Pending" status for clearing, but not for setting.
     * In all other cases, do not show the field.
     * @returns {boolean}
     */
    isPendingOriginally () {
      return this.$store.state.originalData.isPending ||
        (this.pending && this.$store.state.originalData.isPending === undefined)
    },

    extraAuthSettingsExpanded: {
      get () {
        return this.$uiSettings.get('uba_user_form', 'extraAuthSettingsExpanded')
      },

      set (value) {
        this.$uiSettings.put(value, 'uba_user_form', 'extraAuthSettingsExpanded')
      }
    },

    pending () {
      return this.$store.state.data.isPending
    },

    ...mapInstanceFields([
      'disabled'
    ]),

    ...mapState([
      'isNew',
      'employeeID'
    ]),

    ...mapGetters([
      'loading',
      'isDirty'
    ]),

    isSupervisor () {
      return this.$UB.connection.userData().roles.includes('Supervisor')
    },

    fullName () {
      return buildFullName({
        firstName: this.$store.state.data.firstName,
        middleName: this.$store.state.data.middleName,
        lastName: this.$store.state.data.lastName
      })
    },

    instanceID () {
      return this.$store.state.data.ID
    },

    userLogin () {
      return this.$store.state.data.name
    },

    isOrgEnabled () {
      return !!this.$UB.connection.domain.models.ORG
    }
  },

  methods: {
    ...mapActions(['save']),

    getUserCertificates () {
      return this.$UB.Repository('uba_usercertificate')
        .attrs(
          'ID',
          'serial',
          'isForSigning',
          'disabled',
          'revoked',
          'description',
          'issuer_serial',
          'mi_modifyDate'
        )
        .where('userID', '=', this.instanceID)
    },

    getCertConfig (cfg) {
      return {
        ...cfg,
        isModal: true,
        modalWidth: '800px',
        props: {
          parentContext: {
            userID: this.instanceID
          }
        }
      }
    },

    getRolesRepo () {
      return Repository('uba_role')
        .attrs('ID', 'name')
        .where('name', 'notIn', ['Anonymous', 'Everyone', 'User'])
    },

    showChangePasswordDialog () {
      $App.doCommand({
        cmdType: 'showForm',
        formCode: 'uba_user-changeUserPassword',
        entity: 'uba_user',
        title: 'changePassword',
        isModal: true,
        props: {
          parentContext: {
            userID: this.instanceID,
            userLogin: this.userLogin
          }
        }
      })
    },

    openEmployeeForm (employeeID) {
      if (employeeID) {
        $App.doCommand({
          cmdType: 'showForm',
          formCode: 'org_employee',
          entity: 'org_employee',
          instanceID: employeeID
        })
      } else {
        $App.doCommand({
          cmdType: 'showForm',
          formCode: 'org_employee',
          entity: 'org_employee',
          props: {
            parentContext: {
              mi_dateFrom: new Date(),
              userID: this.instanceID,
              lastName: this.$store.state.data.lastName,
              firstName: this.$store.state.data.firstName,
              middleName: this.$store.state.data.middleName,
              apply: this.$store.state.data.title,
              description: this.$store.state.data.description,
              fullFIO: this.$store.state.data.fullName
            }
          }
        })
      }
    },

    async refreshForm (event) {
      if (this.employeeID && event.execParams?.ID !== this.employeeID) {
        return
      }

      if (!this.employeeID) {
        await this.updateEmployeeID()
      }

      await this.$store.dispatch('refresh', { skipNotify: true })
      if (this.isDirty) {
        this.save()
      }
    },

    async updateEmployeeID () {
      const employeeID = await Repository('org_employee')
        .attrs('ID')
        .where('userID', '=', this.instanceID)
        .misc({ __mip_disablecache: true })
        .selectScalar()
      this.$store.commit('SET', { key: 'employeeID', value: employeeID })
    }
  }
}
</script>
