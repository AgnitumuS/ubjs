### Entity based form (with processing)
```vue
<template>
  <div class="u-form-layout">
    <u-toolbar/>
    <u-form-container>
      <!-- Your form -->
    </u-form-container>
  </div>
</template>

<script>
  export default {}
</script>
```

### Custom buttons only
All default buttons are hidden by `hide-default-buttons="true"`.

Two new buttons are added
  - first appears on both toolbar and dropdown menu
  - second - on dropdown only `dropdownOnly: true` 
```vue
<template>
  <div class="u-form-layout">
    <u-toolbar :hide-default-buttons="true" :toolbar-buttons="toolbarButtons"/>
    <u-form-container>
      <!-- Your form -->
    </u-form-container>
  </div>
</template>

<script>
  export default {
    name: 'MyForm',

    computed: {
      toolbarButtons () {
        return [
          // New buttons
          {
            name: 'customButton1',
            label: 'Custom button',
            icon: 'u-icon-person-group',
            type: 'text', // Classic u-button (not icon only) will be shown. Can include icon from prop above
            divider: true, // Will be used for `dropdownButtons`
            handler () {
              // logic
            }
          },
          {
            name: 'customButton2',
            label: 'Custom dropdown only',
            icon: 'u-icon-letter',
            dropdownOnly: true, // Do not add button to the toolbar, but show in the toolbar dropdown only
            handler () {
              // logic
            }
          }
        ]
      }
    }
  }
</script>
```

### Slots
Buttons placement can be customized using available `slots`

```vue
<template>
  <div class="u-form-layout">
    <u-toolbar>
      <u-button appearance="plain" icon="u-icon-download" slot="left"></u-button>
      <u-button slot="right">right side btn</u-button>
      <template #dropdown-prepend>
        <u-dropdown-item
          label="markAsReady"
          icon="u-icon-check"
        />
        <u-dropdown-item divider />
      </template>
      <!-- Or any component you need, text for example -->
      <div slot="toolbarInfoRow">some content</div>
    </u-toolbar>
    <u-form-container>
      <!-- Your form -->
    </u-form-container>
  </div>
</template>

<script>
  export default {
    name: 'Toolbar'
  }
</script>
```

### Default buttons customization
Default buttons can be hidden, default actions - overrides. Below `delete` button is hidden,
behavior of `save` button is override and new button added

```vue
<template>
  <div class="u-form-layout">
    <u-toolbar :toolbar-buttons="toolbarButtons"/>
    <u-form-container>
      <!-- Your form -->
    </u-form-container>
  </div>
</template>

<script>
  export default {
    name: 'MyForm',

    computed: {
      toolbarButtons () {
        return [
          // Hide delete button
          {
            name: 'delete',
            visible: false
          },
          // Override save button attrs
          {
            name: 'save',
            disabled: this.$store.getters.isDirty,
            handler () {
              // new logic
            }
          },
          // New button
          {
            name: 'customButton1',
            label: 'Custom button',
            icon: 'u-icon-person-group',
            disabled: this.$store.state.isNew,
            type: 'text', // Classic u-button (not icon only) will be shown. Can includes icon from prop above
            divider: true, // Will be used for `dropdownButtons`
            handler () {
              // logic
            }
          }
        ]
      }
    }
  }
</script>
```