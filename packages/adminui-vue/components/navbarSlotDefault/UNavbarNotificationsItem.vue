<template>
  <div
    ref="el"
    class="notifications__item"
    :class="{
      'unread': unread,
      'overflowed': isOverflowed,
      'active': isActive
    }"
  >
    <div class="notifications__item__header">
      <i class="notifications__item__icon el-icon-warning" />
      <span class="notifications__item__type">System message</span>
      <span class="notifications__item__date">
        {{ $moment(date).format('DD.MM.YYYY') }}
      </span>
    </div>
    <div
      class="notifications__item__text"
      v-html="text"
    />
    <button
      v-show="isOverflowed"
      class="notifications__item__btn-overflow"
    >
      Полностью...
    </button>
  </div>
</template>

<script>
export default {
  name: 'UNavbarNotificationsItem',

  props: {
    date: Date,
    unread: Boolean,
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    isActive: Boolean
  },

  data () {
    return {
      isOverflowed: false
    }
  },

  mounted () {
    if (this.$refs.el.offsetHeight > 120) {
      this.isOverflowed = true
    }
  }
}
</script>

<style>
.notifications__item{
  padding: 10px;
  padding-left: 20px;
  border-bottom: 1px solid rgba(var(--info), 0.05);
  position: relative;
  cursor: pointer;
}

.notifications__item__btn-overflow{
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 10px;
  padding-top: 20px;
  font-size: 14px;
  font-weight: 700;
  color: rgb(var(--info));
  border: none;
  background: linear-gradient(to bottom, transparent, white 50%);
  pointer-events: none;
}

.notifications__item.unread .notifications__item__btn-overflow{
  background: linear-gradient(to bottom, transparent, #f5faff 50%);
}

.notifications__item.overflowed{
  overflow: hidden;
  max-height: 120px;
}

.notifications__item:hover .notifications__item__btn-overflow{
  color: rgb(var(--primary));
}

.notifications__item.active{
  background: rgba(var(--info), 0.05);
}

.notifications__item:hover{
  background: rgba(var(--info), 0.1);
}

.notifications__item.unread:hover{
  background: rgba(var(--primary), 0.1);
}

.notifications__item.unread{
  background: rgba(var(--primary), 0.05);
}

.notifications__item.unread:before{
  content: '';
  width: 8px;
  height: 8px;
  background: rgb(var(--primary));
  border-radius: 100px;
  position: absolute;
  top: 50%;
  margin-top: -4px;
  left: 10px;
}

.notifications__item:last-child{
  border-bottom: none;
}

.notifications__item__header{
  display: flex;
  align-items: center;
  margin-bottom: 7px;
}

.notifications__item__icon{
  font-size: 16px;
  color: rgb(var(--danger));
  margin-left: 10px;
}

.notifications__item__type{
  font-size: 11px;
  color: rgba(var(--info), 0.8);
  padding-left: 7px;
}

.notifications__item__text{
  font-size: 13px;
  color: rgb(var(--info));
  padding-left: 10px;
}

.notifications__item__date{
  font-size: 11px;
  color: rgba(var(--info), 0.8);
  margin-left: auto;
}
</style>
