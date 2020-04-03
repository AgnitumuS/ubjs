<template>
  <button
    class="u-table-entity__filter__submit"
    :disabled="disabled || loading"
    v-on="$listeners"
  >
    <i class="el-icon-search" />
  </button>
</template>

<script>
const { mapState } = require('vuex')

export default {
  props: {
    disabled: Boolean
  },

  computed: mapState(['loading'])
}
</script>

<style>
.u-table-entity__filter__submit{
  --hs: var(--hs-primary);
  --l: var(--l-state-default);
  color: hsl(var(--hs), var(--l));
  font-size: 24px;
  margin-right: 4px;
  margin-left: 8px;
  cursor: pointer;
  background: none;
  border: none;
}

.u-table-entity__filter__submit:disabled {
  --l: var(--l-state-disabled);
  cursor: not-allowed;
}

.u-table-entity__filter__submit:focus {
  --l: var(--l-state-hover);
}
</style>
