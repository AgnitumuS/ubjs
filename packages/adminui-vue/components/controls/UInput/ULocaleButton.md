### Usage

Component provides user interface for editing translations for a string value of an entity attribute.
It is used together with `UInput` (rendered automatically for multilingual attributes) and `UBaseInput`
(must be added into the `append` slot).

In this example, the combination of `UBaseInput` and `ULocaleButton` control:
- fetches translations for the edited collection item from the server
- apply changes to the `entityModel` property, in this example, it is a containing component;
  this is a typical case for a model dialogs - until user confirms action, data is not in the Vuex store yet

```vue
<template>
  <u-form-row
    attribute-name="name"
    label="dfx_DocTypeAction.name"
  >
    <u-base-input
      v-model="name"
      type="text"
      required
      @blur="$v.name.$touch()"
    >
      <u-locale-button
        slot="append"
        attribute-name="name"
        collection-name="actions"
        :detail-item-id="ID"
        :entity-model="this"
      />
    </u-base-input>
  </u-form-row>
</template>
```

See also `UBaseLocaleButton` for additional examples.
