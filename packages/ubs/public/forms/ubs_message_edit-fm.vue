<template>
  <div>
    <div class="ub-notification__add__container">
      <div class="ub-notification__add__message">
        <ub-form-row
          required
          label="Type"
        >
          <ub-error-wrap :error="$v.type.$error && 'please fill this field'">
            <ub-select-enum
              v-model="type"
              :e-group="$UB.connection.domain.entities.ubs_message.attributes.messageType.enumGroup"
              @select="$v.type.$touch()"
            />
          </ub-error-wrap>
        </ub-form-row>
        <ub-form-row
          required
          label="Message"
        >
          <ub-error-wrap :error="$v.text.$error && 'please fill this field'">
            <el-input
              v-model="text"
              type="textarea"
              :rows="7"
              resize="none"
              @change="$v.text.$touch()"
            />
          </ub-error-wrap>
        </ub-form-row>
        <ub-form-row label="By date range">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="-"
            start-placeholder="Start date"
            end-placeholder="End date"
            :picker-options="pickerOptions"
          />
        </ub-form-row>
      </div>
      <div class="ub-notification__add__users">
        <ub-form-row label="Add by role">
          <div class="ub-notification__users__add-row">
            <ub-select-entity
              v-model="roleModel"
              entity-name="uba_role"
            />
            <el-button @click="addByRole">Add</el-button>
          </div>
        </ub-form-row>
        <ub-form-row label="Add user">
          <div class="ub-notification__users__add-row">
            <ub-select-entity
              v-model="userModel"
              entity-name="uba_user"
            />
            <el-button @click="addUser">Add</el-button>
          </div>
        </ub-form-row>

        <div class="ub-notification__users-list__title">
          Selected users:
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
              />
            </div>
          </template>
          <div
            v-else
            class="ub-notification__users-list__empty"
          >
            All users
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
        Send
      </el-button>
    </div>
  </div>
</template>

<script>
const required = require('vuelidate/lib/validators/required').default
const defaultRenderForm = require('@unitybase/adminui-vue/utils/defaultRenderForm')

module.exports.mount = (params) => {
  defaultRenderForm(module.exports.default, params)
}

module.exports.default = {
  data () {
    return {
      roleModel: null,
      userModel: null,
      type: null,
      selectedUsers: [],
      text: '',
      dateRange: null,
      pickerOptions: {
        shortcuts: [{
          text: 'Last week',
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: 'Last month',
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: 'Last 3 months',
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      }
    }
  },

  validations: {
    type: { required },
    text: { required }
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
            ID: user.ID,
            name: user['userID.name']
          })
        }
      }

      this.roleModel = null
    },

    async beforeClose (done) {
      const confirm = await $App.dialogYesNo('Close modal', 'Are you sure?')
      if (confirm) {
        this.$v.$touch()
        if (!this.$v.$error) {
          done()
        }
      }
    },

    save () {
      this.$emit('close')
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
