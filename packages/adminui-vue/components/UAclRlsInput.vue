<template>
  <div>
    <u-form-row label="navShortcutRights">
      <u-select-collection
        associated-attr="subjID"
        collection-name="rightsSubjects"
        clearable
      />
    </u-form-row>
  </div>
</template>

<script>

export default {
  name: 'UAclRlsInput',

  props: {
    collectionName: {
      type: String,
      required: true
    }
  }
}

</script>

<style>

</style>

<docs>

</docs>
