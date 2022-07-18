<template>
  <div
    class="u-form-layout"
    v-loading="loading"
  >
    <u-toolbar>
      <template v-slot:left>
        <u-button
          appearance="plain"
          icon="u-icon-key"
          color="primary"
          :title="$ut('changePassword')"
          :disabled="!instanceID"
          @click="showPasswordChangeDialog"
        >
          {{ $ut('changePassword') }}
        </u-button>
      </template>
    </u-toolbar>

    <u-form-container
      label-position="top"
      :max-width="800"
    >
      <el-tabs v-model="userTabs">
        <el-tab-pane
          name="main"
          :label="$ut('mainSettings')"
        >
          <u-auto-field attribute-name="name" required/>
          <u-auto-field attribute-name="firstName"/>
          <u-auto-field attribute-name="lastName"/>
          <u-auto-field attribute-name="fullName" v-model="fullName"/>
          <u-form-row attribute-name="gender" :v-model="fixGender">
            <u-select-enum
              e-group="UBA_USER_GENDER"
              v-model="fixGender"
              value-attribute="code"
            />
          </u-form-row>
          <u-auto-field attribute-name="email"/>
          <u-auto-field attribute-name="phone"/>
        </el-tab-pane>

        <el-tab-pane
          name="groupsAndRoles"
          :label="$ut('groupsAndRoles')"
        >
          <u-form-row
            :label="$ut('roles')"
          >
            <u-select-collection
              associated-attr="roleID"
              entity-name="uba_userrole"
              collection-name="userRoles"
              clearable
            />
          </u-form-row>

          <u-form-row
            :label="$ut('groups')"
          >
            <u-select-collection
              associated-attr="groupID"
              entity-name="uba_usergroup"
              collection-name="userGroups"
              clearable
            />
          </u-form-row>
        </el-tab-pane>

        <el-tab-pane
          name="settings"
          :label="$ut('otherSettings')"
        >

          <u-grid
            :max-width="400"
            column-gap="20"
            style="max-width: 800px"
            class="sliders"
          >
            <u-auto-field
              attribute-name="avatar"
              force-cmp="u-file"
              :preview-mode="{ height: 200, width: 400}"
            />
            <div class="sliders-container">
              <u-auto-field
                attribute-name="disabled"
                label-position="right"
                force-cmp="el-switch"
                :max-width="400"
              />
              <u-auto-field
                attribute-name="isPending"
                label-position="right"
                force-cmp="el-switch"
                :max-width="400"
              />
            </div>
          </u-grid>
          <u-auto-field attribute-name="trustedIP"/>
          <u-auto-field
            attribute-name="uData" type="textarea"
            :autosize="{minRows: 2, maxRows: 6}"
          />
        </el-tab-pane>

        <el-tab-pane
          name="certificates"
          :label="$ut('certificates')"
        >
          <u-form-row
            :label="$ut('certificates')"
            :style="{maxWidth: 'none'}"
          >
            <u-table-entity
              :bordered="true"
              :repository="getUserCertificates"
              :build-edit-config="getCertConfig"
              :build-copy-config="getCertConfig"
              :build-add-new-config="getCertConfig"
            />
          </u-form-row>
        </el-tab-pane>

        <el-tab-pane
          name="orgStructure"
          :label="$ut('orgStructure')"
          v-if="isOrgEnabled"
        >
          <div>
            <u-form-row
              :label="$ut('isEmployee')"
              label-position="right"
            >
              <el-switch
                v-model="employee"
                @change="setEmployeeStatus"
              >
              </el-switch>
            </u-form-row>
            <u-form-row
              v-if="employee"
              :label="$ut('userEmployee')"
              :style="{maxWidth: 'none'}"
            >
              <u-table-entity
                :repository="getEmployeeRepo"
                :build-edit-config="getEmployeeConfig"
                :build-copy-config="getEmployeeConfig"
                :build-add-new-config="getEmployeeConfig"
                :columns="['employeeID', 'staffUnitID.caption', 'employeeOnStaffType', 'mi_dateFrom']"
              >
              </u-table-entity>
            </u-form-row>
          </div>
        </el-tab-pane>
      </el-tabs>

    </u-form-container>
  </div>

</template>
<script>
/* global $App */
const { Form, dialogYesNo } = require('@unitybase/adminui-vue')
const { Repository, connection, i18n } = require('@unitybase/ub-pub')
const { mapInstanceFields } = require('@unitybase/adminui-vue')
const { mapState, mapGetters, mapActions } = require('vuex')
const { email, required } = require('vuelidate/lib/validators/index')

module.exports.mount = (cfg) => {
  Form(cfg)
    .store()
    .processing({
      masterFieldList: [
        'firstName',
        'name',
        'lastName',
        'fullName',
        'gender',
        'email',
        'phone',
        'description',
        'disabled',
        'isPending',
        'trustedIP',
        'uData',
        'avatar',
        'ID',
        'mi_modifyDate'
      ],

      collections: {
        userRoles: ({ state }) => Repository('uba_userrole')
          .attrs('ID', 'userID', 'roleID')
          .where('userID', '=', state.data.ID),
        userGroups: ({ state }) => Repository('uba_usergroup')
          .attrs('ID', 'userID', 'groupID')
          .where('userID', '=', state.data.ID)
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

module.exports.default = {
  name: 'UbaUser',

  data () {
    return {
      firstName: '',
      lastName: '',
      userTabs: 'main',
      employee: false
    }
  },

  watch: {
    fullName (value) {
      this.$store.commit('SET_DATA', { key: 'fullName', value })
    }
  },

  computed: {
    ...mapInstanceFields([
      'gender'
    ]),

    ...mapState([
      'isNew'
    ]),

    ...mapGetters(['loading']),

    fullName: {
      get () {
        return (this.$store.state.data.lastName || '') + ' ' + (this.$store.state.data.firstName || '')
      },
      set (value) {
        this.$store.commit('SET_DATA', { key: 'fullName', value })
      }
    },

    /**
     * Fix for old users with 'F' and 'M' gender values instead of 'male'/'female' in UBA_USER_GENDER enum
     */
    fixGender: {
      get () {
        switch (this.gender) {
          case 'F':
            return 'female'
          case 'M':
            return 'male'
          default:
            return this.gender
        }
      },

      set (value) {
        this.$store.commit('SET_DATA', { key: 'gender', value })
      }
    },

    instanceID () {
      return this.$store.state.data.ID
    },

    userLogin () {
      return this.$store.state.data.name
    },

    isOrgEnabled () {
      return !!connection.domain.models.ORG
    }
  },

  async mounted () {
    const employee = await Repository('org_employee')
      .attrs('ID')
      .where('userID', '=', this.instanceID)
      .selectSingle()
    this.employee = !!employee
    this.employeeID = employee?.ID
  },

  methods: {
    ...mapActions([
      'save'
    ]),

    getGenderRepository () {
      return Repository('ubm_enum')
        .attrs('code', 'name', 'sortOrder')
        .where('eGroup', '=', 'UBA_USER_GENDER')
        .orderBy('sortOrder')
    },

    getEmployeeRepo () {
      return Repository('org_employeeonstaff')
        .attrs('ID', 'employeeID', 'employeeID.userID', 'staffUnitID.caption', 'employeeOnStaffType', 'mi_dateFrom')
        .where('employeeID.userID', '=', this.instanceID)
    },

    getUserCertificates () {
      return Repository('uba_usercertificate')
        .attrs('ID', 'serial', 'isForSigning', 'disabled', 'revoked', 'description', 'issuer_serial', 'mi_modifyDate')
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

    async getEmployeeConfig (cfg) {
      /*        const employeeID = await Repository('org_employee')
                .attrs('ID')
                .where('userID', '=', this.instanceID)
                .selectScalar()*/

      /*        console.log(this.employeeID)

              if (!this.employeeID) {
                const confirm = await $App.dialogYesNo(
                  'Додати співробітника?',
                  `Користувач ${this.$store.state.data.fullName || this.userLogin} відсутній в організаційній структурі. Додати його?`
                )

                if (!confirm) {
                  return cfg
                }
              }*/
      return {
        ...cfg,
        isModal: true,
        modalWidth: '800px',
        props: {
          parentContext: {
            employeeID: this.employeeID
          }
        }
      }
    },

    showPasswordChangeDialog () {
      if (this.isNew) {
        this.save()
      }
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

    async addUserToOrgStructure () {
      const userParams = this.$store.state.data
      const orgUserProps = {
        userID: userParams.ID,
        lastName: userParams.lastName,
        firstName: userParams.firstName,
        description: userParams.description,
        sexType: userParams.gender ? userParams.gender.substring(0, 1).toUpperCase() : '?',
        fullFIO: userParams.fullName
      }
      const app = await $App.showModal({
        cmdType: 'showForm',
        formCode: 'org_employee',
        entity: 'org_employee',
        title: 'orgEmployee',
        isModal: true,
        parentContext: orgUserProps
      })
    },

    async removeUserFromOrgStructure () {
      const confirm = await dialogYesNo(
        'org_dialogs.removeFromOrgStructure.title',
        i18n('org_dialogs.removeFromOrgStructure.message', this.fullName || this.userLogin)
      )

      if (!confirm) {
        this.employee = true
        return
      }

      connection.query({
        entity: 'org_employee',
        method: 'delete',
        execParams: {
          ID: this.employeeID
        }
      })

      const staff = await this.getEmployeeRepo().select()
      if (staff?.length) {
        for (const s of staff) {
          connection.query({
            entity: 'org_employeeonstaff',
            method: 'delete',
            execParams: {
              ID: s.ID
            }
          })
        }
      }
    },

    async setEmployeeStatus (isEmployee) {
      if (isEmployee) {
        await this.addUserToOrgStructure()
      }

      if (!isEmployee) {
        await this.removeUserFromOrgStructure()
      }
    }
  }

}
</script>

<style>
.sliders .u-form-row__label {
  width: auto !important;
  min-width: auto !important;
}

.sliders-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: self-start;
  padding: 10%;
}
</style>
