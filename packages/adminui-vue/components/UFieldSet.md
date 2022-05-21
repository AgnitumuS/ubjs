### Basic usage

```vue
<template>
  <u-field-set title="Basic usage">
    <h1>Field set content</h1>
    <u-form-row
      label="User name (required)"
    >
      <u-base-input />
    </u-form-row>
  </u-field-set>
</template>
```

### Advanced usage

- Turn expandable (by checking checkbox)
- title align
- custom icon

``` vue
<template>
  <div>
  <p>Expanded: {{fieldSetExpanded ? 'Yes' : 'No'}}</p>
  <p>Expandable <input type="checkbox" v-model="isExpandable"></input> </p>
  <u-field-set
      v-model="fieldSetExpanded"
      :expandable="isExpandable"
      title="Advanced usage"
      title-align="center"
      icon-position="right"
      title-color="danger"
      :icons="['u-icon-eye', 'u-icon-eye-slash']"
    >
    <h1>Field set content</h1>
    <u-form-row
      label="User name (required)"
    >
      <u-base-input />
    </u-form-row>

  </u-field-set>
  </div>
</template>

<script>
export default {
    data () {
    return {
      isExpandable: true,
      fieldSetExpanded: true
    }
  }
}
</script>
```
