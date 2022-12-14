<template>
  <div
    v-loading="loading"
    class="uba-als"
  >
    <div class="uba-als__header">
      <u-form-row
        label-position="top"
        label="Entity"
      >
        <el-select
          v-model="selectedEntity"
          filterable
          :disabled="!isNew"
        >
          <el-option
            v-for="entity in entityList"
            :key="entity.code"
            :label="`${entity.code} (${entity.caption}) `"
            :value="entity.code"
          />
        </el-select>
      </u-form-row>

      <u-form-row
        label-position="top"
        label="State"
      >
        <el-select
          v-model="selectedState"
          :disabled="disabledState"
          filterable
        >
          <el-option
            v-for="state in stateList"
            :key="state"
            :label="`${state} ${getDescription(state)}`"
            :value="state"
          />
        </el-select>
      </u-form-row>

      <div class="uba-als__header__item">
        <div v-if="isNew">
          <el-button
            :disabled="disabledAddBtns"
            :type="btnType"
            @click="showAttrsChoice = true"
          >
            {{ $ut('addАField') }}
          </el-button>
          <el-button
            :disabled="disabledAddBtns"
            :type="btnType"
            @click="showRolesChoice = true"
          >
            {{ $ut('addRole') }}
          </el-button>
          <dialog-table
            :data-table="emptyAttributes"
            :show="showAttrsChoice"
            :columns="fieldColumns"
            :default-selection="selectedFields"
            multi-select-key-attr="code"
            @closed="showAttrsChoice = false"
            @add="handleAddAttrs"
          />
          <dialog-table
            :data-table="roleList"
            :columns="roleColumns"
            :show="showRolesChoice"
            :default-selection="selectedRoles"
            multi-select-key-attr="value"
            @closed="showRolesChoice = false"
            @add="handleAddRoles"
          />
        </div>
        <div>
          <u-button
            v-for="button in controlBtns"
            :key="button.label"
            appearance="inverse"
            size="medium"
            :icon="button.icon"
            :color="button.color"
            :disabled="disabledControlsBtn"
            @click="toGoActions(button)"
          />
        </div>
      </div>
    </div>

    <div class="uba-als_table--wrap">
      <table class="uba-als_table u-table">
        <thead>
          <tr>
            <th
              v-if="isNew"
              rowspan="2"
            >
              {{ $ut('actionType') }}
            </th>
            <th
              v-for="item in baseColumns"
              :key="item.label"
              rowspan="2"
            >
              {{ $ut(item.label) }}
            </th>
            <th
              v-if="selectedRoles.length > 0"
              :colspan="selectedRoles.length"
            >
              <div>{{ $ut('roles') }}</div>
            </th>
          </tr>
          <tr v-if="selectedRoles.length > 0">
            <th
              v-for="role in selectedRoles"
              :key="role.label"
            >
              <div>
                {{ role.label }}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="!isEmpty">
            <tr
              v-for="(row, rowIndex) in selectedFields"
              :key="row.label"
            >
              <td v-if="isNew">
                <el-button
                  size="small"
                  icon="u-icon-delete"
                  circle
                  @click.native="deleteField(rowIndex)"
                />
              </td>
              <td
                v-for="item in baseColumns"
                :key="item.property"
              >
                {{ row[item.property] }}
              </td>
              <td
                v-for="role in row.roles"
                :key="role.label"
              >
                <action-component
                  v-model="role.actions"
                  class="uba-als__actions"
                  @input="changeRolePermissions($event, role)"
                />
              </td>
            </tr>
          </template>
          <template v-else>
            <tr>
              <td
                :colspan="baseColumns.length + 2"
                class="uba-als_table--empty"
              >
                No data
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
const { Form } = require('@unitybase/adminui-vue')
const ActionComponent =
  require('../components/RoleActionsComponent.vue').default
const DialogTable = require('../components/DialogTable.vue').default

module.exports.mount = (cfg) => {
  Form(cfg).processing().mount()
}

module.exports.default = {
  name: 'UBA_ALS',
  components: { DialogTable, ActionComponent },
  data () {
    return {
      controlBtns: [
        {
          name: 'save',
          label: this.$ut('save') + ' (Ctrl + S)',
          icon: 'u-icon-save',
          color: 'primary'
        },
        {
          name: 'export',
          label: this.$ut('export') + ' (Ctrl + S)',
          icon: 'u-icon-download',
          color: 'primary'
        }
      ],
      entityList: this.$UB.connection.domain.filterEntities(e => e.mixins.als),
      roleList: [],
      selectedRoles: [],
      selectedEntity: '',
      stateList: [],
      selectedState: '',
      showAttrsChoice: false,
      showRolesChoice: false,
      fieldColumns: [
        { label: 'description', id: 'name' },
        { label: 'caption', id: 'caption' },
        { label: 'description', id: 'description' }
      ],
      roleColumns: [
        { label: 'value', id: 'value' },
        { label: 'name', id: 'name' }
      ],
      selectedFields: [],
      baseColumns: [
        { label: 'caption', property: 'caption' },
        { label: 'field', property: 'code' }
      ],
      isNew: this.$store.state.isNew,
      blockMonkeyRequest: false,
      wasEdit: false,
      loading: false
    }
  },
  computed: {
    disabledControlsBtn () {
      return (
        this.selectedFields.length === 0 ||
        this.selectedRoles.length === 0 ||
        (!this.isNew && !this.wasEdit)
      )
    },
    isEmpty () {
      return this.selectedFields.length === 0 && this.selectedRoles.length === 0
    },
    disabledSaveBtn () {
      return this.selectedEntity.length === 0
    },
    disabledState () {
      return !this.selectedEntity || !this.isNew
    },
    disabledAddBtns () {
      return this.disabledState || !this.selectedState
    },
    btnType () {
      const type = this.disabledAddBtns ? 'default' : 'success'
      return type
    },
    emptyAttributes () {
      const allAttrs = this.selectedEntity
        ? Object.values(
          this.$UB.connection.domain.get(this.selectedEntity).attributes
        )
        : []
      return allAttrs
    }
  },
  created () {
    if (!this.isNew) this.init()
  },
  watch: {
    selectedEntity (e) {
      if (e) this.getData()
    }
  },
  methods: {
    async init () {
      const propsData = this.$store.state.data
      this.selectedEntity = propsData.entity
      if (this.selectedEntity) await this.getData()
      this.selectedState = propsData.state
      const startAttribute = this.emptyAttributes.find(
        i => i.code === propsData.attribute
      )
      this.handleAddAttrs({ selection: [startAttribute] })
      const startRole = this.roleList.find(i => i.value === propsData.roleName)
      startRole.actions = propsData.actions
      startRole.ID = propsData.ID
      this.handleAddRoles({ selection: [startRole] })
    },
    getDescription (str) {
      const value = this.$lookups.getEnum(this.selectedEntity, str)
      return !value ? '' : `(${value})`
    },
    toGoActions (btn) {
      const permissions = this.createPermissionsList()
      if (permissions.length === 0) {
        window.alert('Permissions is empty')
        return
      }
      this[btn.name](permissions)
    },
    async getData () {
      if (this.blockMonkeyRequest) return
      this.blockMonkeyRequest = true
      await this.getAllStates()
      await this.getAllRoles()
      this.blockMonkeyRequest = false
    },
    export (permissions) {
      permissions = permissions.map(i => JSON.stringify(i, null, 4))
      const output = permissions.join(');\n\nconn.run(')
      /* global saveAs */
      saveAs(
        new Blob([`conn.run(${output});`], {
          type: 'text/plain;charset=utf-8'
        }),
        `uba_als__${
          this.selectedEntity
        }__${new Date().toLocaleDateString()}-${new Date().toLocaleTimeString()}.txt`
      )
    },
    async save (permissions) {
      this.loading = true
      try {
      await this.$UB.connection.runTrans(permissions)
        this.$notify.success({
          title: this.$ut('successfullySaved')
        })
      } finally {
        this.loading = false
      }
    },
    createPermissionsList () {
      const { selectedFields, getExecParamsFromRole, isNew } = this
      const permissions = []
      selectedFields.forEach(row => {
        if (!row.roles || !Array.isArray(row.roles)) return false
        row.roles.forEach(role => {
          if (isNew && role.actions === 0) return
          const template = {
            entity: 'uba_als',
            method: isNew ? 'insert' : role.actions === 0 ? 'delete' : 'update'
          }
          template.execParams = getExecParamsFromRole(role, row.code)
          permissions.push(Object.assign({}, template))
        })
      })
      return permissions
    },
    getExecParamsFromRole (role, attribute) {
      const { selectedState, selectedEntity } = this
      const item = {
        attribute,
        state: selectedState,
        entity: selectedEntity,
        roleName: role.value,
        actions: role.actions
      }
      if (role.ID || role.ID === 0) item.ID = role.ID
      return item
    },
    changeRolePermissions (lvl, item) {
      this.wasEdit = true
      item.actions = lvl
    },
    deleteField (index) {
      this.selectedFields.splice(index, 1)
      if (this.selectedFields.length === 0) this.selectedRoles = []
    },
    async getAllRoles () {
      const response = await this.$UB.connection.query({
        entity: this.selectedEntity,
        method: 'getallroles'
      })
      const values = response.alsRoleAllValues
      this.roleList = response.alsRoleAllNames.map((name, index) => {
        return {
          name,
          value: values[index]
        }
      })
    },
    async getAllStates () {
      const response = await this.$UB.connection.query({
        entity: this.selectedEntity,
        method: 'getallstates'
      })
      this.stateList = response.alsStateAllValues
      if (this.isNew) {
        this.selectedState = null
        this.selectedRoles = []
        this.selectedFields = []
      }
    },
    handleAddRoles (e) {
      const checkValue = typeof e.selection[0] === 'object'
      let selectedRoles = e.selection
      if (!checkValue) {
        selectedRoles = this.roleList.filter(el =>
          e.selection.includes(el.value)
        )
      }
      selectedRoles.forEach(el => {
        el.label = el.value
        el.actions = el.actions === undefined ? 1 : el.actions
      })
      this.selectedFields.forEach(i => {
        const copyRoles = JSON.parse(JSON.stringify(selectedRoles))
        i.roles = copyRoles
      })
      this.selectedRoles = selectedRoles
      this.showRolesChoice = false
    },
    handleAddAttrs (e) {
      const checkValue = typeof e.selection[0] === 'object'
      this.selectedFields = e.selection
      if (!checkValue) {
        this.selectedFields = this.emptyAttributes.filter(el =>
          e.selection.includes(el.code)
        )
      }
      this.selectedFields.forEach((item, index) => {
        this.$set(this.selectedFields[index], 'roles', [])
      })
      this.showAttrsChoice = false
    }
  }
}
</script>

<style>
.uba-als {
  --padding: 12px;
  --cellPadding: calc(var(--padding) / 1.5);
  padding: calc(var(--padding) * 2);
  display: flex;
  flex-direction: column;
  max-height: calc(100% - 1px);
  overflow: hidden;
}
.uba-als__header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
}
.uba-als__header .u-form-row {
  padding: 0 var(--padding);
  flex-basis: 30%;
  min-width: 248px;
  max-width: 400px;
}
.uba-als__header .u-form-row .el-select {
  width: 100%;
}
.uba-als__header__item {
  padding: 0 var(--padding);
  margin-bottom: 10px;
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
}
.uba-als__header__item .el-button {
  text-transform: capitalize;
}
.uba-als_table--wrap {
  overflow: auto;
  border: 1px solid hsl(var(--hs-border), var(--l-layout-border-default));
}
.uba-als .u-table th:after {
  content: none;
}

.uba-als_table {
  width: 100%;
  border-collapse: collapse;
}
.uba-als_table.u-table thead {
  position: sticky;
  top: 0;
  z-index: 1;
}
.uba-als_table.u-table th {
  border-top: none;
  border-bottom: none;
  text-transform: capitalize;
}
.uba-als_table.u-table tr td:first-child {
  width: 100px;
  text-align: center;
}

.uba-als_table--empty {
  text-align: center;
}
.uba-als__actions {
  display: flex;
  justify-content: center;
}
</style>
