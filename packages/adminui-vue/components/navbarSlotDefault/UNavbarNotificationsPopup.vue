<template>
  <el-dialog
    :visible.sync="visible"
    width="70%"
    class="notifications-history__popup"
  >
    <div class="notifications-history">
      <div class="notifications-history__list">
        <div
          v-for="(item, i) in messages"
          :key="item.ID"
          class="notifications__item"
          :class="[i===1 && 'active', i>2 && 'unread']"
        >
          <div class="notifications__item__header">
            <i class="notifications__item__icon el-icon-warning" />
            <span class="notifications__item__type">System message</span>
            <span class="notifications__item__date">
              {{ $moment(item.date).format('DD.MM.YYYY') }}
            </span>
          </div>
          <div class="notifications__item__text">
            {{ item.text }}
          </div>
        </div>
      </div>
      <div class="notifications-history__detail">
        Lorem ipsum dolor sit amet.
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'UNavbarNotificationsPopup',

  props: {
    value: Boolean,
    messages: Array
  },

  computed: {
    visible: {
      get () {
        return this.value
      },

      set (value) {
        this.$emit('input', value)
      }
    }
  }
}
</script>

<style>
.notifications-history__popup .el-dialog__body{
  padding: 0;
  margin-top: 30px;
  border-top: 1px solid rgba(var(--info), 0.15);
  height: 60vh;
}

.notifications-history{
  display: flex;
  height: 100%;
}

.notifications-history__list{
  width: 300px;
  min-width: 300px;
  border-right: 1px solid rgba(var(--info), 0.15);
  height: 100%;
  overflow-y: auto;
  /*padding: 0 10px;*/
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

.notifications-history__detail__text{
  
}
</style>
