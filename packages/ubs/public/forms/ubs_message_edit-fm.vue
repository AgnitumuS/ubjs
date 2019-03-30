<template>
  <el-dialog
    :visible.sync="visible"
    :title="$ut('messageSendTitle')"
    width="70%"
    :before-close="beforeClose"
    @closed="$destroy()"
  >
    <div class="ub-notification__add__container">
      <div class="ub-notification__add__message">
        <ub-form-row
          required
          :label="$ut('messageType')"
        >
          <ub-error-wrap :error="$v.messageType.$error && $ut('isRequiredFieldFmt', $ut('messageType'))">
            <ub-select-enum
              v-model="messageType"
              :e-group="$UB.connection.domain.entities.ubs_message.attributes.messageType.enumGroup"
              @select="$v.messageType.$touch()"
            />
          </ub-error-wrap>
        </ub-form-row>
        <ub-form-row
          required
          label="message"
        >
          <ub-error-wrap :error="$v.messageBody.$error && $ut('isRequiredFieldFmt', $ut('message'))">
            <el-input
              v-model="messageBody"
              type="textarea"
              :rows="7"
              resize="none"
              @change="$v.messageBody.$touch()"
            />
          </ub-error-wrap>
        </ub-form-row>
        <ub-form-row :label="$ut('byDateRange')">
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
        </ub-form-row>
      </div>
      <div class="ub-notification__add__users">
        <ub-form-row :label="$ut('addByRole')">
          <div class="ub-notification__users__add-row">
            <ub-select-entity
              v-model="roleModel"
              entity-name="uba_role"
            />
            <el-button @click="addByRole">
              {{ $ut('actionAdd') }}
            </el-button>
          </div>
        </ub-form-row>
        <ub-form-row :label="$ut('addUser')">
          <div class="ub-notification__users__add-row">
            <ub-select-entity
              v-model="userModel"
              entity-name="uba_user"
            />
            <el-button @click="addUser">
              {{ $ut('actionAdd') }}
            </el-button>
          </div>
        </ub-form-row>

        <div class="ub-notification__users-list__title">
          {{ $ut('selectedUsers') }}:
        </div>
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
                @click="removeUser(user.ID)"
              />
            </div>
          </template>
          <div
            v-else
            class="ub-notification__users-list__empty"
          >
            {{ $ut('allUsers') }}
          </div>
        </div>
      </div>
    </div>
    <div class="ub-notification__add__footer">
      <el-button
        type="primary"
        size="big"
        @click="save"
      >
        {{ $ut('send') }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
const Vue = require('vue')
const required = require('vuelidate/lib/validators/required').default

module.exports.mount = () => {
  const instance = new Vue({
    render: h => h(module.exports.default)
  }).$mount()
  document.body.append(instance.$el)
}

module.exports.default = {
  data () {
    return {
      roleModel: null,
      userModel: null,
      messageType: null,
      selectedUsers: [],
      messageBody: '',
      visible: false,
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

  mounted () {
    this.visible = true
  },

  methods: {
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
        const notExist = this.selectedUsers.findIndex(u => u.ID === user.ID) === -1
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
      if (this.$v.$error) return false
      await this.insertMessage()
      await this.insertRecipients()
      this.visible = false
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
.ub-notification__add__container{
  display: flex;
  height: 50vh;
  padding-bottom: 20px;
}

.ub-notification__add__footer{
  text-align: right;
}

.ub-notification__add__users-list{
  border-top: 1px solid rgba(var(--info), 0.3);
  margin-top: 10px;
  flex-grow: 1;
  overflow-y: auto;
}

.ub-notification__add__message{
  flex-grow: 1;
  padding-right: 20px
}

.ub-notification__add__users{
  width: 350px;
  display: flex;
  flex-direction: column;
  padding-left: 20px;
  border-left: 1px solid rgba(var(--info), 0.3);
}

.ub-notification__users__add-row{
  display: flex;
}

.ub-notification__users__add-row .el-button{
  margin-left: 8px;
}

.ub-notification__users-list__title{
  color: rgb(var(--info));
  padding-top: 20px;
}

.ub-notification__users-list__empty{
  text-align: center;
  color: rgb(var(--info));
  padding: 20px;
  font-size: 17px;
}

.ub-notification__users-list__item{
  border-bottom: 1px solid rgba(var(--info), 0.1);
  padding: 5px;
  display: flex;
  align-items: center;
}

.ub-notification__users-list__item .el-button{
  margin-left: auto;
}
</style>
