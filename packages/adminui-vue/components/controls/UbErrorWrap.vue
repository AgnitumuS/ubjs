<template>
  <div
    class="ub-error-wrap"
    :class="{
      'is-error': error
    }"
  >
    <slot />
    <transition name="el-zoom-in-top">
      <div
        v-show="error"
        class="ub-error-wrap__text"
      >
        {{ error ? $ut(error) : '' }}
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'UbErrorWrap',
  props: {
    error: [String, Boolean]
  }
}
</script>

<style>
.ub-error-wrap{
  padding-bottom: 16px;
  position: relative;
}

.ub-error-wrap__text{
  color: rgb(var(--danger));
  position: absolute;
  bottom: 0;
  left: 0;
}

.ub-error-wrap.is-error .el-input__inner,
.ub-error-wrap.is-error .el-textarea__inner{
  border-color: rgb(var(--danger));
}
</style>
