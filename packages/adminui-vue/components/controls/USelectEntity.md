### Use as `entity-name`
One of these options is required:
  - `entity-name`
  - `repository`

```vue
<template>
  <u-select-entity
    v-model="value"
    entity-name="req_Department"
  />
</template>
<script>
  export default {
    data () {
      return {
        value: null
      }
    }
  }
</script>
```

### Use as `repository`
Need to set function which returns UB Repository

```vue
<template>
  <u-select-entity
    v-model="value"
    :repository="getRepo"
    display-attribute="text"
  />
</template>
<script>
  export default {
    data () {
      return {
        value: null
      }
    },

    methods: {
      getRepo () {
        return this.$UB.Repository('req_Request')
          .attrs('ID', 'reqDate', 'text')
          .where('reqDate', '>', new Date('2020-01-01'))
      }
    }
  }
</script>
```

### Custom `valueAttribute`
Need when you need to change default model propery.
Its like attribute `value` in native `<option>` tag.
For example when you need instead `ID` like `code`.

```vue
<template>
  <div>
    value: {{value}}
    <u-select-entity
      v-model="value"
      entity-name="req_Department"
      value-attribute="code"
    />
  </div>
</template>
<script>
  export default {
    data () {
      return {
        value: null
      }
    }
  }
</script>
```

### Change default actions

#### Remove default actions

```vue
<template>
  <u-select-entity
    v-model="value"
    entity-name="req_Department"
    remove-default-actions
  />
</template>
<script>
  export default {
    data () {
      return {
        value: null
      }
    }
  }
</script>
```

#### Add actions

```vue
<template>
  <u-select-entity
    v-model="value"
    entity-name="req_Department"
    :additional-actions="actions"
  />
</template>
<script>
  export default {
    data () {
      return {
        value: null
      }
    },

    computed: {
      actions () {
        return [{
          name: 'test action',
          caption: 'Test action caption',
          icon: 'u-icon-branch',
          handler: () => {
            console.log('click test action')
          }
        }, {
          name: 'test action 2',
          caption: 'Test action 2 caption',
          icon: 'u-icon-calendar-alt',
          handler: () => {
            console.log('click test action 2')
          }
        }]
      }
    }
  }
</script>
```

#### Just custom actions
```vue
<template>
  <u-select-entity
    v-model="value"
    entity-name="req_Department"
    :additional-actions="actions"
    remove-default-actions
  />
</template>
<script>
  export default {
    data () {
      return {
        value: null
      }
    },

    computed: {
      actions () {
        return [{
          name: 'test action',
          caption: 'Test action caption',
          icon: 'u-icon-calendar-alt',
          handler: () => {
            console.log('click test action')
          }
        }, {
          name: 'test action 2',
          caption: 'Test action 2 caption',
          icon: 'u-icon-check-double',
          handler: () => {
            console.log('click test action 2')
          }
        }]
      }
    }
  }
</script>
```

### Disabled

```vue
<template>
  <div>
    <u-select-entity
      v-model="value"
      entity-name="req_Department"
    />

    disabled:
    <u-select-entity
      v-model="value"
      entity-name="req_Department"
      disabled
    />
  </div>
</template>
<script>
  export default {
    data () {
      return {
        value: null
      }
    }
  }
</script>
```

### Actions overrides
```vue
<template>
  <u-select-entity
    v-model="value"
    entity-name="req_Department"
    :build-edit-config="actionEditOverride"
  />
</template>
<script>
  export default {
    data () {
      return {
        value: null
      }
    },

    methods: {
      actionEditOverride (cfg) {
        return Object.assign(
          {},
          cfg,
          {
            isModal: false,
            docID: 12345
          }
        )
      }
    }
  }
</script>
```

### Allow adding
```vue
<template>
  <u-select-entity
    v-model="personID"
    allow-dictionary-adding
    :build-add-dictionary-config="buildAddPersonConfig"
  />
</template>
<script>
  export default {
    data () {
      return {
        personID: null
      }
    },

    methods: {
      buildAddPersonConfig (cfg) {
        const parsedFIO = _.compact(cfg.query.split(' ')).map(word => _.capitalize(word))
        if (!parsedFIO[1]) this.$notify.error('Wrong citizen full name, must contain at least 2 words')
        cfg.props = {}
        cfg.props.parentContext = {
          fullFIO: cfg.query,
          shortFIO: parsedFIO[1] + ' ' + _.compact([parsedFIO[0] && parsedFIO[0][1], parsedFIO[2] && parsedFIO[2][1]])
            .join('.') + '.',
          lastName: parsedFIO[1],
          firstName: parsedFIO[0],
          middleName: parsedFIO[2] || null
        }
        return cfg
      }
    }
  }
</script>
```