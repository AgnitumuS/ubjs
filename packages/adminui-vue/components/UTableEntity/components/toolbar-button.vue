<template>
  <button
    class="u-table-entity__head__button"
    :class="isBlue && 'blue'"
    v-on="$listeners"
  >
    <i
      v-if="icon"
      :class="icon"
    />
    <slot />
  </button>
</template>

<script>
export default {
  props: {
    icon: String,
    isBlue: Boolean
  }
}
</script>

<style>
.u-table-entity__head__button{
  color: rgb(var(--primary));
  background: none;
  border: none;
  padding: 16px 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: transform 0.1s;
  height: 100%;
}

.u-table-entity__head__button:disabled{
  opacity: 0.5;
  cursor: not-allowed;
}

.u-table-entity__head__button:hover{
  opacity: 0.7;
}

.u-table-entity__head__button.blue {
  color: rgb(var(--secondary));
}

.u-table-entity__head__button i {
  font-size: 18px;
  margin-right: 4px;
}
</style>
