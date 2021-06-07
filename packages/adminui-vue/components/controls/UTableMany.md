## Usage
Required attributes:
- `attribute-name`

### Basic usage

```vue
<template>
  <div>
    <u-table-many
      attribute-name="relatedUsers"
      :repository="relatedUsersRepository"
      :title="$ut('Related users')"
      :disabled="!$store.state.data.isNew"
    />
</div>
</template>
<script>
  export default {
    methods: {
      relatedUsersRepository () {
        return this.$UB.Repository('uba_user')
          .attrs('ID', 'name')
          .where('ID', '!=', this.$UB.Session.userID)
      }
    }
  }
</script>
```

### Use `v-model` for setting selected values

```vue
<template>
  <div>
    <u-table-many
      v-model="selectedValues"
      attribute-name="relatedUsers"
      :repository="relatedUsersRepository"
      :title="$ut('Related users')"
      :disabled="!$store.state.data.isNew"
    >
      <template #modalContentBefore>
        <u-form-row label="Select role">
          <u-select-entity
            v-model="selectedRole"
            entity-name="uba_role"
          />
        </u-form-row>
      </template>
    </u-table-many>
</div>
</template>
<script>
  export default {
    data () {
      return {
        selectedValues: [],
        selectedRole: null
      }
    },

    watch: {
      async selectedRole (value) {
        this.selectedValues = await this.getUsersByRoleID(value)
      }
    },

    methods: {
      relatedUsersRepository () {
        return this.$UB.Repository('uba_user')
          .attrs('ID', 'name')
          .where('ID', '!=', this.$UB.Session.userID)
      },

      getUsersByRoleID (roleID) {
        return this.$UB.Repository('uba_user')
          .attrs('ID')
          .exists(
            this.$UB.Repository('uba_userrole')
             .correlation('userID', 'ID') // here we link to uba_user.ID
             .where('roleID', '=', roleID)
          )
          .selectAsArrayOfValues()
      }
    }
  }
</script>
```
