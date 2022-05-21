## Basic Usage

```vue
<template>
  <div>
    Choice user's: {{ choice }}
    <u-radio v-model="choice" :items="items" />
  </div>
</template>

<script>
  export default {
    data() {
      return {
        choice: 'second',
        items: [
          { id: 'first', label: 'first' },
          { id: 'second', label: 'second' }
        ]
      };
    }
  };
</script>
```

## Usage with slot

```vue
<template>
  <div>
    Choice user's: {{ choice }}
    <u-radio v-model="choice" :items="items">
      <template #third>
        <div>
          <div style="white-space: nowrap">label from slot</div>
          <div>Some content</div>
        </div>
      </template>
    </u-radio>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        choice: 'second',
        items: [
          { id: 'first', label: 'first' },
          { id: 'second', label: 'second' },
          { id: 'third', label: '' }
        ]
      };
    }
  };
</script>
```

## Items prop names

```vue
<template>
  <div>
    Choice user's: {{ choice }}
    <u-radio v-model="choice" :items="items" id-prop="name" label-prop="description" />
  </div>
</template>

<script>
  export default {
    data() {
      return {
        choice: 'second',
        items: [
          { name: 'first', description: 'first' },
          { name: 'second', description: 'second' }
        ]
      };
    }
  };
</script>
```
