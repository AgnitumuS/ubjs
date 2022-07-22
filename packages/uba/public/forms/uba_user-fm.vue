<template>
  <div
    class="u-form-layout"
    v-loading="loading"
  >
    <u-toolbar>
      <template v-slot:left v-if="!isNew">
        <u-button
          appearance="inverse"
          icon="u-icon-key"
          color="primary"
          :title="$ut('changePassword')"
          :disabled="!instanceID"
          @click="showPasswordChangeDialog"
        >
          {{ $ut('changePassword') }}
        </u-button>
      </template>

      <template v-slot:right>
        <indicator-pane/>
        <el-tag
          v-if="pending"
          type="warning"
        >
          {{ $ut('isPending') }}
        </el-tag>
        <el-tag
          v-if="disabled"
          type="danger"
        >
          {{ $ut('disabled') }}
        </el-tag>
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
          <u-auto-field attribute-name="firstName" required/>
          <u-auto-field attribute-name="lastName"/>
          <u-auto-field attribute-name="fullName" v-model="fullName"/>
          <u-form-row attribute-name="gender">
            <u-select-enum
              e-group="UBA_USER_GENDER"
              v-model="fixGender"
              value-attribute="code"
            />
          </u-form-row>
          <u-auto-field attribute-name="email" required/>
          <u-auto-field attribute-name="phone"/>
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
              :remove-default-buttons="['webcam', 'scan', 'scanSettings']"
              :before-set-document="checkFile"
            />
            <div class="sliders-container">
              <u-auto-field
                attribute-name="disabled"
                label-position="right"
                force-cmp="el-switch"
                :max-width="400"
                :readonly="!isSupervisor"
              />
              <u-auto-field
                attribute-name="isPending"
                label-position="right"
                force-cmp="el-switch"
                :max-width="400"
                :readonly="!isSupervisor"
              />
            </div>
          </u-grid>
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

        <!--        <el-tab-pane
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
                </el-tab-pane>-->

        <el-tab-pane
          name="settings"
          :label="$ut('otherSettings')"
        >
          <!--          <u-grid
                      :max-width="400"
                      column-gap="20"
                      style="max-width: 800px"
                      class="sliders"
                    >
                      <u-auto-field
                        attribute-name="avatar"
                        force-cmp="u-file"
                        :preview-mode="{ height: 200, width: 400}"
                        :remove-default-buttons="['webcam', 'scan', 'scanSettings']"
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
                    </u-grid>-->
          <u-auto-field attribute-name="trustedIP" :readonly="!isSupervisor"/>
          <u-auto-field
            attribute-name="uData" type="textarea"
            :autosize="{minRows: 2, maxRows: 6}"
          />
          <u-form-row
            :label="$ut('certificates')"
            :style="{maxWidth: 'none'}"
          >
            <u-table-entity
              :bordered="true"
              :style="{maxWidth: '800px'}"
              :repository="getUserCertificates"
              :build-edit-config="getCertConfig"
              :build-copy-config="getCertConfig"
              :build-add-new-config="getCertConfig"
            />
          </u-form-row>
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
const { Form, dialogYesNo, mapInstanceFields } = require('@unitybase/adminui-vue')
const formHelpers = require('@unitybase/adminui-vue').formHelpers
const { Repository, connection, i18n } = require('@unitybase/ub-pub')
const { mapState, mapGetters, mapActions } = require('vuex')
const { email, required, requiredIf } = require('vuelidate/lib/validators/index')
const { buildFormsStoreModule } = require('@unitybase/forms/public/controls/dynamic-form/dynamic-form-store-module')

module.exports.mount = (cfg) => {
  Form(cfg)
    .store(
      {
        modules: {
          form: buildFormsStoreModule({ formEntity: 'org_employee' })
        }
      }
    )
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
          firstName: {
            required: requiredIf(() => {
              return !!this.$store.state.employee
            })
          },
          email: { email, required }
        }
      }
    })
    .mount()
}

module.exports.default = {
  name: 'UbaUser',

  components: {
    IndicatorPane: require('@unitybase/forms/public/controls/indicator-pane.vue').default
  },

  mixins: [
    require('@unitybase/dfx/public/controls/doc-renderer/file-based-controls-mixin')
  ],

  data () {
    return {
      userTabs: 'main',
      employee: true,
      props: {
        maxFileSize: 2
      }
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

    pending () {
      return this.$store.state.data.isPending
    },

    disabled () {
      return this.$store.state.data.disabled
    },

    isSupervisor () {
      return connection.userData().roles.includes('Supervisor')
    },

    isEmployee () {
      return !!this.$store.state.employee
    },

    acceptFileExtensions () {
      return ['.jpg', '.png'].join()
    },

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

  async created () {
    const employee = await Repository('org_employee')
      .attrs('ID')
      .where('userID', '=', this.instanceID)
      .selectSingle()
    this.employee = !!employee
    this.employeeID = employee?.ID
    this.$store.commit('SET', { key: 'employee', value: employee })
  },

  methods: {
    ...mapActions([
      'save'
    ]),

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
      if (!this.employeeID) {
        const employeeID = await Repository('org_employee')
          .attrs('ID')
          .where('userID', '=', this.instanceID)
          .selectScalar()

        this.employeeID = employeeID
      }
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
      /*        if (this.isNew) {
                this.save()
              }*/
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
      $App.doCommand({
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

      connection.query(formHelpers.buildDeleteRequest('org_employee', this.employeeID))

      const staff = await this.getEmployeeRepo().select()
      if (staff?.length) {
        for (const s of staff) {
          connection.query(formHelpers.buildDeleteRequest('org_employeeonstaff', s.ID))
        }
      }

      this.employeeID = null
    },

    async setEmployeeStatus (isEmployee) {
      if (isEmployee) {
        await this.addUserToOrgStructure()
      }

      if (!isEmployee) {
        await this.removeUserFromOrgStructure()
      }
    },

    checkFile (e) {
      this.validateFile(e.file)
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
