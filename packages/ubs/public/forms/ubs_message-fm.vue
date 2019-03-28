<template>
  <div>
    <!-- notifications-history__popup -->
    <div class="notifications-history">
      <div
        class="notifications-history__list"
      >
        {{commandConfig.active}}
      </div>
      <div
        class="notifications-history__detail"
        v-html="currentMess"
      />
    </div>
  </div>
</template>

<script>
const defaultRenderForm = require('@unitybase/adminui-vue/utils/defaultRenderForm')

module.exports.mount = (params) => {
  defaultRenderForm(params, module.exports.default)
}

module.exports.default = {
  props: {
    commandConfig: Object
  },

  data () {
    return {
      currentMess: 123
    }
  }
}
</script>

<style>
.notifications-history__popup .el-dialog__body{
  padding: 0;
  border-top: 1px solid rgba(var(--info), 0.15);
  height: 60vh;
}

.notifications-history{
  display: flex;
  height: 100%;
}

.notifications-history__list{
  width: 350px;
  min-width: 350px;
  border-right: 1px solid rgba(var(--info), 0.15);
  height: 100%;
  overflow-y: auto;
}

.notifications-history__detail{
  flex-grow: 1;
  height: 100%;
  overflow-y: auto;
  font-size: 15px;
  padding: 20px;
  line-height: 1.4;
}

.notifications-history__detail__date{
  font-size: 13px;
  color: rgb(var(--info));
  text-align: right;
  padding: 20px;
}
</style>
