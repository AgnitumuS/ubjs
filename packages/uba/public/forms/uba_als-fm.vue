<template>
  <div id="AlsComponent">
    <el-select
      v-model="selectedEntity"
      filterable
      clearable
      :placeholder="entityCaption"
    >
      <el-option
        v-for="entity in entityList"
        :key="entity.code"
        :label="entity.code"
        :value="entity.code"
      />
    </el-select>
    <el-select
      v-if="selectedEntity"
      v-model="selectedState"
      filterable
      clearable
      :placeholder="(Object.values(alsEntity.attributes).find(item => {return item.name === 'state'}) || {}).caption"
    >
      <el-option
        v-for="entity in stateList"
        :key="entity"
        :label="entity"
        :value="entity"
      />
    </el-select>
    <el-popover
      v-model="popoverVisible"
      placement="bottom-end"
      trigger="click"
    >
      <el-table
        :data="emptyAttributes"
        :show-header="false"
        @row-click="onEmptyAttributesClick"
      >
        <el-table-column
          width="200"
          property="name"
        />
      </el-table>
      <el-button
        v-if="selectedState && emptyAttributes.length !== 0"
        slot="reference"
        icon="el-icon-plus"
        @click="popoverVisible = !popoverVisible"
      >
        {{ addCaption }}
      </el-button>
    </el-popover>
    <el-button
      v-if="selectedState"
      type="success"
      icon="el-icon-check"
      :disabled="!needSave"
      @click="save"
    >
      {{ saveCaption }}
    </el-button>
    <el-button
      v-if="selectedState"
      type="success"
      icon="el-icon-document"
      :disabled="!needSave"
      @click="generateDiffFile"
    >
      {{ generateDiffFileCaption }}
    </el-button>
    <el-row v-if="selectedState">
      <el-col :span="18">
        <el-table
          :data="[...usedAttributes].sort()"
          width="100"
        >
          <el-table-column
            :label="(Object.values(alsEntity.attributes).find(item => {return item.name === 'attribute'}) || {}).caption"
          >
            <template slot-scope="scope">
              {{ scope.row }}
            </template>
          </el-table-column>
          <el-table-column
            v-for="role in checkedRoles"
            :key="role"
            header-align="center"
          >
            <template slot-scope="scope">
              <action-component
                v-model="(currentRights.find(right => right.attribute === scope.row && right.roleName === role) || {}).actions"
                class="als__actions"
              />
            </template>
            <template
              slot="header"
              slot-scope="scope"
            >
              <el-popover
                placement="bottom"
                trigger="click"
              >
                <span slot="reference">{{ role }}</span>
                <action-component
                  class="als__actions"
                  :value="0"
                  @input="setForAllAttributes(...arguments, role)"
                />
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column
            fixed="right"
            width="50"
          >
            <template slot-scope="scope">
              <el-button
                size="small"
                icon="el-icon-delete"
                circle
                @click.native.prevent="deleteRow(scope.row)"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col
        :span="6"
        style="padding-left: 30px"
      >
        <h4>{{ rolesCaption }}:</h4>
        <el-checkbox
          v-model="checkAll"
          :indeterminate="isIndeterminate"
          @change="handleCheckAllChange"
        >
          <strong>{{ checkAllCaption }}</strong>
        </el-checkbox>
        <el-checkbox-group
          v-model="checkedRoles"
          style="margin-top: 10px"
          @change="handleCheckedRolesChange"
        >
          <div
            v-for="role in roleList"
            :key="role"
            style="margin-top: 5px"
          >
            `
            <el-checkbox
              :key="role"
              :label="role"
              @change="checkBoxChange(role)"
            >
              {{ role }}
            </el-checkbox>
          </div>
        </el-checkbox-group>
      </el-col>
    </el-row>
  </div>
</template>

<script>
const actionComponent = require('../components/RoleActionsComponent.vue').default
const AdminUiVue = require('@unitybase/adminui-vue')

module.exports.mount = function (params) {
  if (AdminUiVue.mountHelpers.activateIfMounted(params)) return
  let mountParams = {
    FormComponent: AlsComponent,
    showFormParams: params
  }
  AdminUiVue.mountHelpers.mount(mountParams)
}

const AlsComponent = module.exports.default = {
  name: 'AlsComponent',
  data () {
    return {
      popoverVisible: false,
      entityList: $App.domainInfo.filterEntities(e => e.mixins.als),
      alsEntity: $App.domainInfo.get('uba_als'),
      roleList: [],
      stateList: [],
      selectedEntity: null,
      selectedState: null,
      checkedRoles: [],
      isIndeterminate: false,
      rightsFromDb: [],
      oldRights: [],
      createdRights: [],
      deletedRights: [],
      checkAll: false,
      addCaption: UB.i18n('actionAdd'),
      checkAllCaption: UB.i18n('checkAll'),
      deleteCaption: UB.i18n('Delete'),
      entityCaption: UB.i18n('entity'),
      rolesCaption: UB.i18n('roles'),
      saveCaption: UB.i18n('save'),
      generateDiffFileCaption: 'Save diff in file',
      fieldList: ['ID', 'attribute', 'state', 'roleName', 'actions'],
      usedAttributes: [],
      actions: [{
        name: 'Select',
        value: 1
      }, {
        name: 'Update',
        value: 3
      }, {
        name: 'Mandatory',
        value: 7
      }]
    }
  },
  computed: {
    attributeList () {
      return this.selectedEntity ? Object.keys($App.domainInfo.get(this.selectedEntity).attributes) : []
    },
    changedRights () {
      let rows = []
      this.rightsFromDb.forEach((right) => {
        let oldRight = this.oldRights.find((oldR) => { return oldR.ID === right.ID })
        if (oldRight && JSON.stringify(oldRight) !== JSON.stringify(right)) {
          rows.push(right)
        }
      })
      return rows
    },
    currentRights () {
      return [...this.rightsFromDb, ...this.createdRights].filter(right => right.state === this.selectedState)
    },
    emptyAttributes () {
      return Object.values(this.alsEntity.attributes).filter(attr => !this.usedAttributes.includes(attr.name)).map(_ => { return { name: _.name } })
    },
    needSave () {
      return this.changedRights.length > 0 || this.createdRights.some(cr => cr.actions !== 0)
    }
  },
  watch: {
    currentRights () {
      this.setUsedAttributes(this)
    },
    selectedEntity () {
      this.loadRightsFromDB()
      this.createdRights = []
      this.selectedState = null
      if (this.selectedEntity) {
        $App.connection.run({ entity: this.selectedEntity, method: 'getallroles' }).then(response => {
          this.roleList = response.alsRoleAllValues
        })
        $App.connection.run({ entity: this.selectedEntity, method: 'getallstates' }).then(response => {
          this.stateList = response.alsStateAllValues
        })
      } else {
        this.roleList = []
        this.stateList = []
      }
    }
  },
  methods: {
    setForAllAttributes (action, roleName) {
      this.currentRights.forEach(right => {
        if (right.roleName === roleName) {
          right.actions = action
        }
      })
    },
    createRightForRole (role) {
      this.usedAttributes.forEach(attr => this.createRightByRoleAttr(role, attr))
    },
    createRightByRoleAttr (role, attr) {
      if (!this.currentRights.some(right =>
        right.attribute === attr &&
          right.roleName === role)) {
        this.createdRights.push({
          state: this.selectedState,
          entity: this.selectedEntity,
          attribute: attr,
          roleName: role,
          actions: 0
        })
      }
    },
    checkBoxChange (role) {
      if (this.checkedRoles.includes(role)) {
        this.createRightForRole(role)
      }
    },
    handleCheckAllChange (val) {
      if (val) {
        let unchecked = this.roleList.filter(role => this.checkedRoles.indexOf(role) === -1)
        unchecked.forEach(role => this.createRightForRole(role))
        this.checkedRoles = this.roleList
      } else {
        this.checkedRoles = []
      }
      this.isIndeterminate = false
    },
    handleCheckedRolesChange (value) {
      let checkedCount = value.length
      this.checkAll = checkedCount === this.roleList.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.roleList.length
    },
    onEmptyAttributesClick (item) {
      this.addRow(item.name)
      this.popoverVisible = this.emptyAttributes.length !== 0
    },
    setUsedAttributes () {
      this.usedAttributes = this.currentRights.map(right => right.attribute).filter((value, index, self) => self.indexOf(value) === index)
    },
    loadRightsFromDB () {
      UB.Repository('uba_als').attrs(this.fieldList).where('[entity]', '=', this.selectedEntity).selectAsObject().then((rights) => {
        this.rightsFromDb = rights
        this.oldRights = rights.map((right) => { return { ...right } })
      })
    },
    generateDiffFile () {
      let output = ''
      let allRigts = [...this.changedRights.map(row => JSON.stringify({
        entity: 'uba_als',
        method: row.actions !== 0 ? 'update' : 'delete',
        execParams: row
      }, null, '\t')),
      ...this.createdRights.filter(cr => cr.actions !== 0).map(row => JSON.stringify({
        entity: 'uba_als',
        method: 'insert',
        execParams: row
      }, null, '\t'))]
      output = allRigts.join(']);\n\nconn.runList([')
      saveAs(
        new Blob([`conn.runList([${output}]);`], { type: 'text/plain;charset=utf-8' }),
        `uba_als__${this.selectedEntity}__${new Date().toLocaleDateString()}-${new Date().toLocaleTimeString()}.txt`
      )
    },
    save () {
      if (this.needSave) {
        let requests = []
        this.changedRights.forEach(row => requests.push({
          entity: 'uba_als',
          method: row.actions !== 0 ? 'update' : 'delete',
          execParams: row
        }))
        this.createdRights.filter(cr => cr.actions !== 0).forEach(row => requests.push({
          entity: 'uba_als',
          method: 'insert',
          execParams: row
        }))
        $App.connection.runTrans(requests).then(this.loadRightsFromDB.bind(this)).then(_ => this.createdRights = this.createdRights.filter(cr => cr.actions === 0))
      }
    },
    addRow (attr) {
      this.usedAttributes.push(attr)
      this.checkedRoles.forEach(role => this.createRightByRoleAttr(role, attr))
    },
    deleteRow (attr) {
      let index = this.usedAttributes.indexOf(attr)
      if (index !== -1) {
        this.usedAttributes.splice(index, 1)
      }
      this.currentRights.filter(cr => cr.attribute === attr && cr.state === this.selectedState).forEach(right => right.actions = 0)
    }
  },
  components: {
    'action-component': actionComponent
  }
}
</script>

<style>
  .als__actions {
    display: flex;
    justify-content: center;
  }

  .role-actions-component i:not(:last-child) {
    margin-right: 7px;
  }
</style>
