<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="16">
        <u-form-row
          required
          :label="$ut('messageType')"
        >
          <u-error-wrap :error="$v.messageType.$error && $ut('isRequiredFieldFmt', $ut('messageType'))">
            <ub-select-enum
              v-model="messageType"
              :e-group="$UB.connection.domain.entities.ubs_message.attributes.messageType.enumGroup"
              @input="$v.messageType.$touch()"
            />
          </u-error-wrap>
        </u-form-row>
        <u-form-row
          required
          label="message"
        >
          <u-error-wrap :error="$v.messageBody.$error && $ut('isRequiredFieldFmt', $ut('message'))">
            <el-input
              v-model="messageBody"
              type="textarea"
              :rows="7"
              resize="none"
              @change="$v.messageBody.$touch()"
            />
          </u-error-wrap>
        </u-form-row>
        <u-form-row :label="$ut('byDateRange')">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            unlink-panels
            range-separator="-"
            :start-placeholder="$ut('startDate')"
            :end-placeholder="$ut('endDate')"
            :picker-options="pickerOptions"
            :clearable="false"
          />
        </u-form-row>
      </el-col>
      <el-col :span="8">
        <u-form-row :label="$ut('addByRole')">
          <el-row :gutter="10">
            <el-col :span="16">
              <ub-select-entity
                v-model="roleModel"
                entity-name="uba_role"
              />
            </el-col>
            <el-col :span="8">
              <el-button @click="addByRole" style="width: 100%">
                {{ $ut('actionAdd') }}
              </el-button>
            </el-col>
          </el-row>
        </u-form-row>
        <u-form-row :label="$ut('addUser')">
          <el-row :gutter="10">
            <el-col :span="16">
              <ub-select-entity
                v-model="userModel"
                entity-name="uba_user"
              />
            </el-col>
            <el-col :span="8">
              <el-button @click="addUser" style="width: 100%">
                {{ $ut('actionAdd') }}
              </el-button>
            </el-col>
          </el-row>
        </u-form-row>

        <u-form-row :label="$ut('selectedUsers')" />
        <div class="ub-notification__add__users-list">
          <template v-if="selectedUsers.length">
            <div
              v-for="user in selectedUsers"
              :key="user.ID"
              class="ub-notification__users-list__item"
            >
              {{ user.name }}
              <el-button
                type="danger"
                plain
                icon="el-icon-delete"
                size="mini"
                style="margin-left: auto"
                @click="removeUser(user.ID)"
              />
            </div>
          </template>
          <div
            v-else
            class="ub-empty-text"
          >
            {{ $ut('allUsers') }}
          </div>
        </div>
      </el-col>
    </el-row>
    <br>
    <el-row
      type="flex"
      justify="end"
    >
      <el-button
        type="primary"
        size="big"
        @click="save"
      >
        {{ $ut('send') }}
      </el-button>
    </el-row>
  </div>
</template>

<script>
const required = require('vuelidate/lib/validators/required').default
const AdminUiVue = require('@unitybase/adminui-vue')

module.exports.mount = function (params) {
  if (AdminUiVue.mountHelpers.activateIfMounted(params)) return
  let mountParams = {
    FormComponent: UbsMessageEdit,
    showFormParams: params
  }
  AdminUiVue.mountHelpers.mount(mountParams)
}

const UbsMessageEdit = module.exports.default = {
  props: {
    entityName: {
      type: String,
      required: true
    },
    instanceID: Number,
    currentTabId: String,
    formCode: String
  },
  data () {
    return {
      roleModel: null,
      userModel: null,
      messageType: null,
      selectedUsers: [],
      messageBody: '',
      /**
       * by default from now to next year
       * @type {Array}
       */
      dateRange: [new Date(), new Date(new Date().getFullYear() + 1, 0)],
      ID: null,
      mi_modifyDate: null,
      pickerOptions: {
        disabledDate: (time) => {
          return this.$moment().isAfter(time, 'day')
        },
        shortcuts: [{
          text: this.$ut('nextWeek'),
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            end.setTime(start.getTime() + 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: this.$ut('nextMonth'),
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            end.setTime(start.getTime() + 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: this.$ut('next3Months'),
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            end.setTime(start.getTime() + 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      }
    }
  },

  validations: {
    messageType: { required },
    messageBody: { required }
  },

  created () {
    this.addNew()
  },

  methods: {
    isDirty () {
      return this.$v.$anyDirty
    },

    async addUser () {
      const user = await this.$UB.connection
        .Repository('uba_user')
        .attrs('ID', 'name')
        .selectById(this.userModel)
      const notExist = this.selectedUsers.findIndex(u => u.ID === user.ID) === -1
      if (notExist) {
        this.selectedUsers.push(user)
      }

      this.userModel = null
    },

    async addByRole () {
      const users = await this.$UB.connection
        .Repository('uba_userrole')
        .attrs('ID', 'roleID', 'userID', 'userID.name')
        .where('roleID', '=', this.roleModel)
        .select()

      for (const user of users) {
        const notExist = this.selectedUsers.findIndex(u => u.ID === user.userID) === -1
        if (notExist) {
          this.selectedUsers.push({
            ID: user.userID,
            name: user['userID.name']
          })
        }
      }

      this.roleModel = null
    },

    removeUser (ID) {
      const index = this.selectedUsers.findIndex(u => u.ID === ID)
      if (index !== -1) {
        this.selectedUsers.splice(index, 1)
      }
    },

    async beforeClose (done) {
      const confirm = await $App.dialogYesNo('close', 'vyUvereny')
      if (confirm) done()
    },

    async save () {
      this.$v.$touch()
      if (this.$v.$anyError) return 'error'
      await this.insertMessage()
      await this.insertRecipients()
      this.$emit('close')
      this.$v.$reset()
    },

    async addNew () {
      const resp = await this.$UB.connection.addNew({
        entity: 'ubs_message_edit',
        fieldList: ['complete', 'messageType', 'startDate', 'expireDate', 'messageBody', 'ID', 'mi_modifyDate']
      })
      const parsedResp = this.$UB.LocalDataStore.selectResultToArrayOfObjects(resp)
      this.ID = parsedResp[0].ID
      this.mi_modifyDate = parsedResp[0].mi_modifyDate
    },

    async insertMessage () {
      if (this.dateRange === null) {
        this.dateRange = [new Date(), new Date(new Date().getFullYear() + 1, 0)]
      }
      await this.$UB.connection.insert({
        entity: 'ubs_message_edit',
        fieldList: ['complete', 'messageType', 'startDate', 'expireDate', 'messageBody', 'ID', 'mi_modifyDate'],
        execParams: {
          ID: this.ID,
          complete: true,
          messageType: this.messageType,
          startDate: this.dateRange[0],
          expireDate: this.dateRange[1],
          messageBody: this.messageBody,
          mi_modifyDate: this.mi_modifyDate
        }
      })
    },

    async insertRecipients () {
      const users = []
      if (this.selectedUsers.length) {
        for (const user of this.selectedUsers) {
          users.push(user.ID)
        }
      } else {
        const allUsers = await this.$UB.connection
          .Repository('uba_user')
          .attrs('ID')
          .selectAsArray()
        for (const item of allUsers.resultData.data) {
          users.push(item[0])
        }
      }
      await this.$UB.connection
        .runTrans(users.map(userID => ({
          method: 'insert',
          entity: 'ubs_message_recipient',
          fieldList: ['ID', 'userID', 'messageID'],
          execParams: {
            messageID: this.ID,
            userID
          }
        })))
    }
  }
}
</script>

<style>
.ub-notification__add__users-list{
  border-top: 1px solid rgba(var(--info), 0.3);
  margin-top: 10px;
  flex-grow: 1;
  overflow-y: auto;
  max-height: 170px;
}

.ub-notification__users-list__item{
  border-bottom: 1px solid rgba(var(--info), 0.1);
  padding: 5px;
  display: flex;
  align-items: center;
}
</style>
