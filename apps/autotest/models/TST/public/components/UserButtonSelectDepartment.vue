<template>
  <u-dropdown-item
    label="Select department"
    icon="u-icon-hierarchy-alt"
  >
    <u-dropdown-item
      v-for="dep in departments"
      :key="dep.ID"
      :disabled="dep.ID === preferredDepID"
      :icon="dep.ID === preferredDepID ? 'u-icon-arrow-double-right' : ''"
      :label="dep.name"
      @click="changeUDataDep(dep.ID)"
    />
  </u-dropdown-item>
</template>

<script>
export default {
  name: 'UserButtonSelectDepartment',
  data () {
    return {
      departments: [{ ID: -1, name: 'По замовчуванню' }],
      preferredDepID: -1
    }
  },
  async mounted () {
    const departments = await UB.Repository('org_organization')
      .attrs('ID', 'name')
      .limit(5)
      .selectAsObject()
    departments.forEach(d => { this.departments.push(d) })
    const prefUData = this.$UB.connection.getPreferredUData()
    if (prefUData) {
      const prefUDataObj = JSON.parse(prefUData)
      if (prefUDataObj.depID) this.preferredDepID = +prefUDataObj.depID
    }
  },
  methods: {
    changeUDataDep (depID) {
      if (depID === -1) {
        this.$UB.connection.setPreferredUData(null) // remove all preferences
      } else {
        this.$UB.connection.setPreferredUData({ depID: depID })
      }
    }
  }
}
</script>
