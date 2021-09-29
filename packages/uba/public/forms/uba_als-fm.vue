<template>
  <div class="uba-als">
    <div class="uba-als__header">
      <u-form-row
        label-position="top"
        label="Entity"
      >
        <ElSelect
          v-model="selectedEntity"
          filterable
          :disabled="!isNew"
        >
          <ElOption
            v-for="entity in entityList"
            :key="entity.code"
            :label="`${entity.code} (${entity.caption}) `"
            :value="entity.code"
          />
        </ElSelect>
      </u-form-row>

      <u-form-row
        label-position="top"
        label="State"
      >
        <ElSelect
          v-model="selectedState"
          :disabled="disabledState"
          filterable
        >
          <ElOption
            v-for="state in stateList"
            :key="state"
            :label="state"
            :value="state"
          />
        </ElSelect>
      </u-form-row>

      <div class="uba-als__header__item">
        <div v-if="isNew">
          <ElButton
            :disabled="disabledAddBtns"
            :type="btnType"
            @click="showAttrsChoice = true"
          >
            Додати поля
          </ElButton>
          <ElButton
            :disabled="disabledAddBtns"
            :type="btnType"
            @click="showRolesChoice = true"
          >
            Додати roles
          </ElButton>
          <DialogTable
            :data-table="emptyAttributes"
            :show="showAttrsChoice"
            :columns="fieldColumns"
            :default-selection="selectedFields"
            @closed="showAttrsChoice = false"
            @add="handleAddAttrs"
          />
          <DialogTable
            :data-table="roleList"
            :columns="roleColumns"
            :show="showRolesChoice"
            :default-selection="selectedRoles"
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
              class="uba-als_table--actions"
            >
              Actions
            </th>
            <th
              v-for="item in baseColumns"
              :key="item.label"
              rowspan="2"
            >
              {{ item.label }}
            </th>
            <th
              v-if="selectedRoles.length > 0"
              :colspan="selectedRoles.length"
              class="uba-als_table__header__first"
            >
              <div>
                Roles
              </div>
            </th>
          </tr>
          <tr
            v-if="selectedRoles.length > 0"
            class="uba-als_table__header__second"
          >
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
              class="uba-als_table__row"
            >
              <td
                v-if="isNew"
                class="uba-als_table--actions"
              >
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
                  @change="changeRolePermissions($event, role)"
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
const ActionComponent = require('../components/RoleActionsComponent.vue')
  .default
const DialogTable = require('../components/DialogTable.vue').default

module.exports.mount = cfg => {
  Form(cfg)
    .processing()
    .mount()
}

module.exports.default = {
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
        { property: 'name' },
        { property: 'caption' },
        { property: 'description' }
      ],
      roleColumns: [{ property: 'value' }, { property: 'name' }],
      selectedFields: [],
      baseColumns: [
        { label: 'Caption', property: 'caption' },
        { label: 'attribute', property: 'code' }
      ],
      deletedFields: [],
      isNew: this.$store.state.isNew,
      blockMonkeyRequest: false,
      deleteEntity: []
    }
  },
  computed: {
    disabledControlsBtn () {
      return this.selectedFields.length === 0 || this.selectedRoles.length === 0
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
      this.handleAddRoles({ selection: [startRole] })
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
      await this.$UB.connection.runTrans(permissions)
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
      return {
        attribute,
        state: selectedState,
        entity: selectedEntity,
        roleName: role.value,
        actions: role.actions
      }
    },
    changeRolePermissions (lvl, item) {
      item.actions = lvl
    },
    deleteField (index) {
      const deleteItem = this.selectedFields.splice(index, 1)
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
      if (this.isNew && !this.stateList.includes(this.selectedState)) {
        this.selectedState = null
      }
    },
    handleAddRoles (e) {
      const selectedRoles = e.selection
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
      this.selectedFields = e.selection
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
}
.uba-als__header__item {
  padding: 0 var(--padding);
  margin-bottom: 10px;
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
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
.uba-als_table.u-table th {
  border-top: none;
  border-left: 1px solid var(--border);
  text-transform: capitalize;
}
.uba-als_table thead {
  position: sticky;
  z-index: 1;
  top: 0;
}
.uba-als_table--actions {
  width: 80px;
  text-align: center;
}
.uba-als_table--empty {
  text-align: center;
}

/* .uba-als_table th, */
.uba-als_table td {
  border: 1px solid var(--border);
  padding: var(--cellPadding);
}
.uba-als_table th {
  border-top: none;
  padding: var(--cellPadding);
}
.uba-als_table.u-table .uba-als_table__header__first {
  border-top: none;
  border-bottom: none;
  padding: 0;
}
.uba-als_table__header__first div {
  border-right: 1px solid var(--border);
  padding: var(--cellPadding);
}
.uba-als_table .uba-als_table__header__second th {
  border: none;
  border-bottom: 1px solid var(--border);
  padding: 0;
}
.uba-als_table .uba-als_table__header__second th:first-child {
  border-left: 1px solid var(--border);
}
.uba-als_table .uba-als_table__header__second th:first-child div {
  border-left: none;
}
.uba-als_table .uba-als_table__header__second div {
  border: 1px solid var(--border);
  border-bottom: none;
  padding: var(--cellPadding);
}

.uba-als_table th:last-child,
.uba-als_table td:last-child {
  border-right: none;
}
.uba-als_table th:first-child,
.uba-als_table td:first-child {
  border-left: none;
}
.uba-als_table tbody tr:first-child td {
  border-top: none;
}

.uba-als_table tr:last-child td {
  border-bottom: none;
}
.uba-als__actions {
  display: flex;
  justify-content: center;
}
</style>
