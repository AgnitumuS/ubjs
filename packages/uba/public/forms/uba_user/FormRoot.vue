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
          <div class="u-form-max-width">
            <u-auto-field attribute-name="name" />
            <u-grid :columns="3">
              <u-auto-field attribute-name="firstName" />
              <u-auto-field attribute-name="lastName" />
              <u-auto-field attribute-name="fullName" /> <!--TODO: compute from "firstName" and "lastName"-->
            </u-grid>
            <u-grid :columns="3">
              <u-auto-field attribute-name="gender" />
              <u-auto-field attribute-name="email" />
              <u-auto-field attribute-name="phone" />
            </u-grid>
            <u-auto-field
              attribute-name="avatar"
              preview-mode
            />
            <u-grid :columns="3">
              <u-auto-field attribute-name="trustedIP" />
              <u-auto-field attribute-name="disabled" />
              <u-auto-field attribute-name="isPending" />
            </u-grid>
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
          </div>
        </el-tab-pane>
        <el-tab-pane :label="$ut('uba_usercertificate')">
          <certificates />
        </el-tab-pane>
      </el-tabs>
    </u-form-container>
  </div>
</template>

<script>
const { mapInstanceFields } = require('@unitybase/adminui-vue')
export default {
  name: 'UserFormRoot',

  components: {
    Certificates: require('./Certificates.vue').default
  },

  computed: {
    canChangePassword () {
      return this.$UB.connection.domain
        .isEntityMethodsAccessible('uba_user', 'changeOtherUserPassword')
    },

    ...mapInstanceFields(['ID', 'name'])
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
    }
  }
}
</script>
