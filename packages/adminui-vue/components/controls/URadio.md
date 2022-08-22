## Usage

By default `items.id` is used as value and `items.label` - as option text>

Type of `v-model` attribute can be String, Number or Boolean, and it types will remain the same as in items array</p>

For each `items.id` component generate slot with the same name, 
```vue
<template>
  <section>
    <u-radio v-model="choice" :items="items">
      <template #useslot>
        <div class="u-form-row__description" style="white-space: nowrap">
          Use slot with the same name as item id to add additional info.
          "white-space: nowrap" is not needed in real code - this is styleguide hack
        </div>
      </template>
      <template #slot-wo-label>
        <strong>Empty label replaced with slot content</strong>
      </template>
    </u-radio>
    <p>User choice: {{ choice }}, type is {{ typeof choice }}</p>
  </section>
</template>

<script>
  export default {
    data() {
      return {
        choice: 'second',
        items: [
          { id: 'first', label: 'string id' },
          { id: true, label: 'boolean id' },
          { id: 'useslot', label: 'item with slot' },
          { id: 3, label: 'number id' },
          { id: 'slot-wo-label', label: '' }
        ]
      }
    }
  }
</script>
```

## Customizing value and text props

Use `items.ID` for values and `items.description` for option text
```vue
<template>
  <section>
    <u-radio v-model="choice" :items="items" id-prop="ID" label-prop="description" />
    <p>User choice: {{ choice }}, type is {{ typeof choice }}</p>
  </section>
</template>

<script>
  export default {
    data() {
      return {
        choice: null,
        items: [
          { ID: 10001, description: 'first' },
          { ID: 10002, description: 'second' }
        ]
      }
    }
  }
</script>
```
