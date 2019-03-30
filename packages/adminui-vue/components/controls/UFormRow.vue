<template>
  <div class="ub-form-row">
    <div class="ub-form-row__label">
      {{ $ut(label) }}: <span v-show="required" class="ub-form-row__label__required-mark">*</span>
    </div>
    <div class="ub-form-row__content">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'UFormRow',
  props: {
    label: String,
    required: Boolean
  }
}
</script>

<style>
.ub-form-row{
  display: flex;
}

.ub-form-row + .ub-form-row{
  margin-top: 10px;
}

.ub-form-row__label{
  color: rgb(var(--info));
  width: 120px;
  min-width: 120px;
  padding-right: 8px;
  padding-top: 7px;
}

.ub-form-row__content{
  flex-grow: 1;
}

.ub-form-row__label__required-mark{
  color: rgb(var(--danger));
}
</style>
