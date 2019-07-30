<template>
  <el-tooltip
    :content="tooltip"
    placement="bottom"
    :open-delay="300"
    :enterable="false"
    :disabled="!tooltip"
  >
    <button
      class="ub-toolbar__button"
      :class="iconColor"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <i :class="iconCls" />
    </button>
  </el-tooltip>
</template>

<script>
export default {
  name: 'UToolbarButton',

  props: {
    tooltip: String,
    iconCls: {
      type: String,
      required: true
    },
    iconColor: {
      type: String,
      default: 'blue'
    }
  }
}
</script>

<style>
.ub-toolbar__button{
  border: none;
  cursor: pointer;
  background: none;
  font-size: 18px;
  line-height: 1;
  width: 30px;
  height: 30px;
  display: block;
  padding: 0;
}

.ub-toolbar__button:hover{
  background: rgba(var(--info), 0.1);
}

.ub-toolbar__button + .ub-toolbar__button {
  margin-left: 0.5em;
}

.ub-toolbar__button.blue {
  color: rgb(var(--primary));
}

.ub-toolbar__button.green {
  color: rgb(var(--success));
}

.ub-toolbar__button.info {
  color: rgb(var(--info));
}

.ub-toolbar__button.danger {
  color: rgb(var(--danger));
}

.ub-toolbar__button:disabled{
  color: rgb(var(--info));
  cursor: not-allowed;
}
</style>
