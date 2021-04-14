## Usage
One of these options is required:
- `entity-name`
- `repository`

### Get list vales using `entity-name`

```vue
<template>
  <u-grid>
    <u-select-multiple
      v-model="deps"
      entity-name="req_department"
    />
    <div>Selected IDs are: {{deps}}</div>
  </u-grid>
</template>
<script>
  export default {
    data () {
      return {
        deps: []
      }
    }
  }
</script>
```

### Get list vales using `repository` function

```vue
<template>
  <u-select-multiple
    v-model="deps"
    :repository="getRepo"
  />
</template>
<script>
  export default {
    data () {
      return {
        deps: []
      }
    },

    methods: {
      getRepo () {
        return this.$UB.Repository('req_department')
          .attrs('ID', 'code', 'name')
          .where('parentID', 'notIsNull')
      }
    }
  }
</script>
```

### Custom `valueAttribute`
By default an `ID` attribute is used as a value. This can be changed by set a `value-attribute`:

```vue
<template>
  <u-grid>
    <u-select-multiple
      v-model="deps"
      entity-name="req_department"
      value-attribute="code"
    />
    <div>Selected codes are: {{deps}}</div>
  </u-grid>
</template>
<script>
  export default {
    data () {
      return {
        deps: []
      }
    }
  }
</script>
```

### Clearable

```vue
<template>
  <u-select-multiple
    v-model="deps"
    entity-name="req_department"
    value-attribute="code"
    clearable
  />
</template>
<script>
  export default {
    data () {
      return {
        deps: ["dep2", "dep1"]
      }
    }
  }
</script>
```

### Disabled

```vue
<template>
  <u-select-multiple
    v-model="deps"
    entity-name="req_department"
    value-attribute="code"
    disabled
  />
</template>
<script>
  export default {
    data () {
      return {
        deps: ["dep2", "dep3"]
      }
    }
  }
</script>
```

### Use `fixed-items` to mark som items as non-removable

```vue
<template>
  <u-select-multiple
    v-model="deps"
    entity-name="req_department"
    value-attribute="code"
    :fixed-items="fixedItems"
  />
</template>
<script>
  export default {
    data () {
      return {
        deps: ["dep1", "dep2", "dep3"],
        fixedItems: ["dep1", "dep3"]
      }
    }
  }
</script>
```
