<template>
  <el-dialog
    :visible.sync="visible"
    custom-class="notifications-history__popup"
    :title="title"
  >
    <div class="notifications-history">
      <template v-if="messages.length > 0">
        <div
          class="notifications-history__list"
        >
          <div
            v-for="item in messages"
            :key="item.ID"
            ref="el"
            class="notifications__item"
            :class="{
              'unread': item['recipients.acceptDate'] === null,
              'overflowed': /*isOverflowed*/ false,
              'active': activeID === item.ID
            }"
            @click="activeID = item.ID"
          >
            <div class="notifications__item__header">
              <i class="notifications__item__icon el-icon-warning" />
              <span class="notifications__item__type">{{item.messageType}}</span>
              <span class="notifications__item__date">
                {{ $moment(item.startDate).format('DD.MM.YYYY') }}
              </span>
            </div>
            <div
              class="notifications__item__text"
              v-html="item.messageBody"
            />
            <button
              v-show="/*isOverflowed*/ false"
              class="notifications__item__btn-overflow"
            >
              Полностью...
            </button>
          </div>
        </div>
        <div
          class="notifications-history__detail"
          v-html="currentMess.messageBody"
        />
      </template>
      <div v-else>
        Empty
      </div>
    </div>
  </el-dialog>
</template>

<script>
const defaultRenderForm = require('@unitybase/adminui-vue/utils/defaultRenderForm')

module.exports.mount = ({ title, messageIdOnOpen }) => {
  const instance = new Vue({
    render: h => h(module.exports.default, {
      props: {
        title,
        messageIdOnOpen
      }
    })
  }).$mount()
  document.body.append(instance.$el)
}

module.exports.default = {
  props: {
    messageIdOnOpen: Number,
    title: String
  },

  data () {
    return {
      visible: false,
      messages: [],
      activeID: null
    }
  },

  computed: {
    currentMess () {
      const index = this.messages.findIndex(m => m.ID === this.activeID)
      if (index !== -1) {
        return this.messages[index]
      } else {
        return {}
      }
    }
  },

  async created () {
    await this.getMessages()
    if (this.messages.length) {
      if (this.messageIdOnOpen) {
        this.activeID = this.messageIdOnOpen
      } else {
        this.activeID = this.messages[0].ID
      }
    }
  },

  mounted () {
    this.visible = true
  },

  methods: {
    async getMessages () {
      const messages = await this.$UB.connection
        .Repository('ubs_message')
        .attrs('ID', 'messageBody', 'messageType', 'startDate', 'expireDate', 'recipients.acceptDate')
        .select()
      this.messages.push(...messages)
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
