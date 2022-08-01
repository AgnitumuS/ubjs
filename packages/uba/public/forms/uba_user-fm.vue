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
          <u-grid
            class="main-settings"
            :max-width="400"
            style="max-width: 1200px;"
            template-columns="3fr 3fr 2fr"
            template-rows="1fr 1fr 1fr"
          >
            <u-auto-field attribute-name="firstName" :required="toOrg"/>

            <u-auto-field attribute-name="lastName" :required="toOrg"/>
            <u-auto-field
              attribute-name="avatar"
              force-cmp="u-file"
              :preview-mode="{ height: 200, width: 200}"
              :remove-default-buttons="['webcam', 'scan', 'scanSettings']"
              :before-set-document="validateFile"
              class="avatar"
            />
            <u-auto-field attribute-name="fullName" v-model="fullName" :required="toOrg"/>
            <u-auto-field attribute-name="name" required/>
            <u-auto-field attribute-name="email"/>
            <u-auto-field attribute-name="phone"/>
            <u-form-row attribute-name="gender">
              <u-select-enum
                e-group="UBA_USER_GENDER"
                v-model="fixGender"
                value-attribute="code"
              />
            </u-form-row>
            <u-form-row
              :required="toOrg"
              :label="$ut('org_employee.code')"
            >
              <u-base-input
                v-model="orgCode"
                :disabled="employee"
              />
            </u-form-row>

            <u-form-row
              :label="$ut('roles')"
              class="roles"
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
              class="groups"
              style="{width: '800px'}"
            >
              <u-select-collection
                associated-attr="groupID"
                entity-name="uba_usergroup"
                collection-name="userGroups"
                clearable
              />
            </u-form-row>

            <u-auto-field
              attribute-name="disabled"
              label-position="right"
              force-cmp="el-switch"
              :max-width="400"
              :readonly="!isSupervisor"
              class="slider"
            />
            <u-auto-field
              attribute-name="isPending"
              label-position="right"
              force-cmp="el-switch"
              :max-width="400"
              :readonly="!isSupervisor"
              class="slider"
            />
            <u-form-row
              :label="$ut('addToOrgStructure')"
              label-position="right"
              class="slider"
              v-if="isOrgEnabled"
            >
              <el-switch
                v-model="toOrg"
                :disabled="employee"
              >
              </el-switch>
            </u-form-row>
          </u-grid>
        </el-tab-pane>

        <el-tab-pane
          name="settings"
          :label="$ut('otherSettings')"
        >
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
          name="orgStructure"
          :label="$ut('orgStructure')"
          v-if="isOrgEnabled"
        >
          <div>
            <u-form-row
              :label="$ut('isEmployee')"
              label-position="right"
            >
              <el-checkbox
                v-model="employee"
                disabled
              >
              </el-checkbox>
            </u-form-row>
            <u-form-row
              v-if="employee"
              :label="$ut('userEmployee')"
              :max-width="800"
            >
              <u-table-entity
                :repository="getEmployeeRepo"
                :build-edit-config="getEmployeeConfig"
                :build-copy-config="getEmployeeConfig"
                :build-add-new-config="getEmployeeConfig"
                :columns="['staffUnitID.caption', 'employeeOnStaffType', 'mi_dateFrom']"
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
const { Repository, connection, UBAbortError } = require('@unitybase/ub-pub')
const { mapState, mapGetters, mapActions } = require('vuex')
const { email, required, requiredIf } = require('vuelidate/lib/validators/index')

module.exports.mount = (cfg) => {
  Form(cfg)
    .store(
      {
        modules: {
          org: {
            namespaced: true,
            state: {
              employee: undefined,
              orgCode: null
            },
            mutations: {
              SET (state, { key, value }) {
                state[key] = value
              }
            }
          }
        },
        actions: {
          async addUserToOrgStructure ({ state }) {
            debugger
            if (state.org.employee?.ID || !state.toOrg) {
              return
            }

            const userParams = state.data
            const orgUserProps = {
              userID: userParams.ID,
              lastName: userParams.lastName,
              firstName: userParams.firstName,
              description: userParams.description,
              sexType: userParams.gender ? userParams.gender.substring(0, 1).toUpperCase() : '?',
              fullFIO: userParams.fullName,
              code: state.org.orgCode
            }

            await connection.query({
              entity: 'org_employee',
              method: 'insert',
              execParams: orgUserProps,
              __skipOptimisticLock: true
            })
          },

          async getEmployeeData ({ state, commit }) {
            const employee = await Repository('org_employee')
              .attrs('ID', 'userID', 'code', 'firstName', 'lastName')
              .where('userID', '=', state.data.ID)
              .misc({ __mip_disablecache: true })
              .selectSingle()

            commit('org/SET', { key: 'employee', value: employee })
            commit('org/SET', { key: 'orgCode', value: employee?.code })
          }
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
      },

      async inited ({ state, dispatch }) {
        Vue.set(state, 'toOrg', !!connection.domain.models.ORG)
        await dispatch('getEmployeeData')
      },

      async saved ({ dispatch, state }) {
        await dispatch('addUserToOrgStructure')
        await dispatch('getEmployeeData')
      }
    })
    .validation({
      validations () {
        return {
          name: { required },
          firstName: {
            required: requiredIf(() => {
              return this.$store.state.toOrg
            })
          },
          lastName: {
            required: requiredIf(() => {
              return this.$store.state.toOrg
            })
          },
          fullName: {
            required: requiredIf(() => {
              return this.$store.state.toOrg
            })
          },
          email: { email }
        }
      }
    })
    .mount()
}

module.exports.default = {
  name: 'UbaUser',

  components: {
    IndicatorPane: require('./controls/indicator-pane.vue').default
  },

  data () {
    return {
      userTabs: 'main',
      maxFileSize: 2,
      acceptFileExtensions: ['.jpg', '.png']
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

    orgCode: {
      get () {
        return this.$store.state.org.orgCode
      },
      set (value) {
        this.$store.commit('org/SET', { key: 'orgCode', value })
      }
    },

    toOrg: {
      get () {
        return this.$store.state.toOrg
      },
      set (value) {
        this.$store.commit('SET', { key: 'toOrg', value })
      }
    },

    employee: {
      get () {
        return !!this.$store.state.org.employee
      },
      set (value) {
        this.$store.commit('org/SET', { key: 'employee', value })
      }
    },

    pending () {
      return this.$store.state.data.isPending
    },

    disabled () {
      return this.$store.state.data.disabled
    },

    isSupervisor () {
      return connection.userData().roles.includes('Supervisor')
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

  methods: {
    ...mapActions([
      'save'
    ]),

    getEmployeeRepo () {
      return Repository('org_employeeonstaff')
        .attrs('ID', 'employeeID', 'employeeID.userID', 'staffUnitID.caption', 'employeeOnStaffType', 'mi_dateFrom')
        .where('employeeID.userID', '=', this.instanceID)
        .misc({ __mip_disablecache: true })
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
      let employeeID = this.$store.state.org.employee?.ID
      if (!employeeID) {
        employeeID = await Repository('org_employee')
          .attrs('ID')
          .where('userID', '=', this.instanceID)
          .misc({ __mip_disablecache: true })
          .selectScalar()
      }
      return {
        ...cfg,
        isModal: true,
        modalWidth: '800px',
        props: {
          parentContext: {
            employeeID
          }
        }
      }
    },

    showPasswordChangeDialog () {
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

    validateFile (e) {
      const file = e.file
      const maxFileSizeInBytes = this.maxFileSize * 1024 ** 2
      if (file.size > maxFileSizeInBytes) {
        const errorMessage = this.$ut('uba_user_errors.maxFileSizeLimitExceeded', this.maxFileSize)
        this.$dialogError(errorMessage, 'error')
        throw new UBAbortError(errorMessage)
      }

      const fileName = (file.name || file.fName).split('.')
      const fileType = '.' + fileName[fileName.length - 1]
      if (!this.acceptFileExtensions.includes(fileType)) {
        const errorMessage = this.$ut('uba_user_errors.fileFormatNotAccepted', this.acceptFileExtensions.join(', '))
        this.$dialogError(errorMessage, 'error')
        throw new UBAbortError(errorMessage)
      }
    }
  }

}
</script>

<style>
.slider .u-form-row__label {
  width: auto !important;
  min-width: auto !important;
}

.main-settings {
  grid-template-areas:
    ". . avatar"
    ". . avatar"
    ". . avatar"
    ". . avatar"
    "roles roles avatar"
    "groups groups avatar"
    ". . .";
}

.avatar {
  grid-area: avatar;
}

.roles {
  grid-area: roles;
  max-width: calc(1200px * 0.75 - 40px) !important;
}

.groups {
  grid-area: groups;
  max-width: calc(1200px * 0.75 - 40px) !important;
}
</style>
