### Basic usage

```vue
<template>
  <u-dropdown>
    <el-button>click me</el-button>

    <template #dropdown>
      <u-dropdown-item label="item 1" @click="doSomething"/>
      <u-dropdown-item label="item 2"/>
      <u-dropdown-item label="item 3"/>
    </template>
  </u-dropdown>
</template>
```

### Context menu

Using as a context menu

```vue
<template>
  <div>
    <div
      @contextmenu="showContextMenu"
      style="width: 200px; height: 200px; background: lightblue"
    />

    <u-dropdown ref="contextMenu">
      <template slot="dropdown">
        <u-dropdown-item label="item 1" @click="doSomething"/>
        <u-dropdown-item label="item 2"/>
        <u-dropdown-item label="item 3"/>
      </template>
    </u-dropdown>
  </div>
</template>

<script>
  export default {
    methods: {
      showContextMenu (event) {
        this.$refs.contextMenu.show(event)
      },
      doSomething () {
        this.$alert('Ups...') 
      }
    }
  }
</script>
```

### Items

```vue
<template>
<u-dropdown>
  <el-button>click me</el-button>

  <template #dropdown>
    <u-dropdown-item @click="say('Edit')" icon="u-icon-edit" label="Edit"/>
    <u-dropdown-item @click="say('Delete')" icon="u-icon-delete" label="Delete"/>
    <u-dropdown-item @click="say('Add')" icon="u-icon-add" label="Add"/>
  </template>
</u-dropdown>
</template>

<script>
export default {
  methods: {
    say (value) {
      alert(value)
    }
  }
}
</script>
```

### Nested items

```vue
<template>
<u-dropdown>
  <el-button>click me</el-button>

  <template #dropdown>
    <u-dropdown-item icon="u-icon-setting" label="Actions">
      <u-dropdown-item icon="u-icon-edit" label="Edit"/>
      <u-dropdown-item icon="u-icon-delete" label="Delete"/>
      <u-dropdown-item icon="u-icon-add" label="Add"/>
    </u-dropdown-item>
    <u-dropdown-item icon="u-icon-person" label="User"/>
    <u-dropdown-item icon="u-icon-bell" label="Notifications"/>
  </template>
</u-dropdown>
</template>
```

### Disabled item

```vue
<template>
<u-dropdown>
  <el-button>click me</el-button>

  <template #dropdown>
    <u-dropdown-item @click="say('Disabled')" disabled icon="u-icon-person" label="Disabled"/>
    <u-dropdown-item @click="say('Edit')" icon="u-icon-edit" label="Edit"/>
    <u-dropdown-item @click="say('Delete')" icon="u-icon-delete" label="Delete"/>
    <u-dropdown-item @click="say('Add')" icon="u-icon-add" label="Add"/>
  </template>
</u-dropdown>
</template>

<script>
export default {
  methods: {
    say (value) {
      alert(value)
    }
  }
}
</script>
```

### Divider

```vue
<template>
<u-dropdown>
  <el-button>click me</el-button>

  <template #dropdown>
    <u-dropdown-item icon="u-icon-edit" label="Edit"/>
    <u-dropdown-item icon="u-icon-add" label="Add"/>
    <u-dropdown-item divider/>
    <u-dropdown-item icon="u-icon-delete" label="Delete"/>
  </template>
</u-dropdown>
</template>
```

### Prevent click
In case dont need close dropdown on click

```vue
<template>
<u-dropdown>
  <el-button>click me</el-button>

  <template #dropdown>
    <u-dropdown-item label="This button will close dropdown"/>
    <u-dropdown-item label="Prevented" prevent-close/>
  </template>
</u-dropdown>
</template>
```

### Slot label

```vue
<template>
<u-dropdown>
  <el-button>click me</el-button>

  <template #dropdown>
    <u-dropdown-item prevent-close>
      <el-checkbox slot="label" v-model="checked">
        Some action
      </el-checkbox>
    </u-dropdown-item>
    <u-dropdown-item label="Another item 1"/>
    <u-dropdown-item label="Another item 2"/>
  </template>
</u-dropdown>
</template>

<script>
export default {
  data () {
    return {
      checked: true
    }
  }
}
</script>
```