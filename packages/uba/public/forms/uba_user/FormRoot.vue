<template>
  <div class="u-form-layout">
    <u-toolbar>
      <el-tooltip
        slot="left"
        :content="$ut('changePassword')"
        placement="bottom"
        :open-delay="300"
        :enterable="false"
        :disabled="!canChangePassword"
      >
        <u-button
          appearance="inverse"
          icon="u-icon-key"
          size="large"
          @click="showChangePasswordDialog"
        />
      </el-tooltip>
    </u-toolbar>
    <u-form-container label-position="top">
      <el-tabs>
        <el-tab-pane :label="$ut('main')">
          <u-grid>
            <div>
              <u-auto-field attribute-name="name" />
              <u-grid :columns="3">
                <u-auto-field attribute-name="firstName" />
                <u-auto-field attribute-name="lastName" />
                <u-auto-field attribute-name="fullName" />
              </u-grid>
              <u-form-row label="uba_userrole">
                <u-select-collection
                  collection-name="roles"
                  associated-attr="roleID"
                />
              </u-form-row>
              <u-form-row label="uba_usergroup">
                <u-select-collection
                  collection-name="groups"
                  associated-attr="groupID"
                />
              </u-form-row>
              <u-grid :columns="3">
                <u-auto-field attribute-name="gender" />
                <u-auto-field attribute-name="email" />
                <u-auto-field attribute-name="phone" />
              </u-grid>
              <u-grid :columns="3">
                <u-auto-field attribute-name="trustedIP" />
                <u-auto-field attribute-name="disabled" />
                <u-auto-field attribute-name="isPending" />
              </u-grid>
            </div>

            <div>
              <u-auto-field
                attribute-name="avatar"
                preview-mode
              />
              <u-grid>
                <u-auto-field
                  attribute-name="description"
                  type="textarea"
                  resize="none"
                  rows="4"
                />
                <u-auto-field
                  attribute-name="uData"
                  type="textarea"
                  resize="none"
                  rows="4"
                />
              </u-grid>
            </div>
          </u-grid>
        </el-tab-pane>
        <el-tab-pane :label="$ut(certificateEntity)">
          <certificates />
        </el-tab-pane>
      </el-tabs>
    </u-form-container>
  </div>
</template>

<script>
const { mapInstanceFields } = require('@unitybase/adminui-vue')
const { entityName: certificateEntity } = require('./certificateCollectionDefinition')

export default {
  name: 'UserFormRoot',

  components: {
    Certificates: require('./Certificates.vue').default
  },

  data () {
    return {
      certificateEntity
    }
  },

  computed: {
    canChangePassword () {
      return this.$UB.connection.domain
        .isEntityMethodsAccessible('uba_user', 'changeOtherUserPassword')
    },

    ...mapInstanceFields([
      'ID',
      'name',
      'firstName',
      'lastName',
      'fullName'
    ])
  },

  watch: {
    firstName (newValue, prevValue) {
      if (this.fullNamePattern(prevValue, this.lastName) === this.fullName) {
        this.fullName = this.fullNamePattern(newValue, this.lastName)
      }
    },

    lastName (newValue, prevValue) {
      if (this.fullNamePattern(this.firstName, prevValue) === this.fullName) {
        this.fullName = this.fullNamePattern(this.firstName, newValue)
      }
    }
  },

  methods: {
    showChangePasswordDialog () {
      this.$UB.core.UBApp.doCommand({
        cmdType: 'showForm',
        formCode: 'uba_user-changeUserPassword',
        entity: 'uba_user',
        title: 'changePassword',
        isModal: true,
        props: {
          parentContext: {
            userID: this.ID,
            userLogin: this.name
          }
        }
      })
    },

    /**
     * @param {string|null} firstName
     * @param {string|null} lastName
     * @return {string|null}
     */
    fullNamePattern (firstName, lastName) {
      const fullName = [firstName, lastName]
        .filter(value => value !== '' && value !== null)
        .join(' ')

      if (fullName.length === 0) {
        return null
      }

      return fullName
    }
  }
}
</script>
