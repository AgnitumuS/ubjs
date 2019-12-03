<template>
  <button
    class="u-table-entity__filter__submit"
    :disabled="disabled || loading"
    v-on="$listeners"
  >
    <i class="el-icon-check" />
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
  color: rgba(var(--success), 0.9);
  font-size: 24px;
  margin-right: 4px;
  margin-left: 8px;
  cursor: pointer;
  background: none;
  border: none;
}

.u-table-entity__filter__submit:disabled {
  color: rgba(var(--info), 0.9);
  cursor: not-allowed;
}

.u-table-entity__filter__submit:focus {
  background: rgba(var(--primary), 0.05);
}
</style>
