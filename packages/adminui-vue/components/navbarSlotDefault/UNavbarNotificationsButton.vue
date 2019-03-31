<template>
  <div class="ub-navbar__dropdown">
    <el-popover
      v-model="isVisible"
      placement="bottom-end"
      width="400"
      trigger="click"
      popper-class="notifications__popover"
      @after-enter="checkOverflowed"
    >
      <el-badge
        slot="reference"
        :type="unreadMessagesCount === 0 ? 'info' : 'danger'"
        :value="unreadMessagesCount"
      >
        <el-button
          icon="el-icon-bell"
          circle
        />
      </el-badge>

      <div class="notifications__popover__header">
        <span class="notifications__title-list-count">
          {{ $ut('newMessages', unreadMessagesCount) }}
        </span>

        <el-button
          v-if="$UB.connection.domain.isEntityMethodsAccessible('ubs_message_edit', ['insert', 'update'])"
          icon="el-icon-plus"
          type="primary"
          plain
          size="mini"
          @click="add"
        >
          {{ $ut('actionAdd') }}
        </el-button>
      </div>

      <div
        v-if="messages.length > 0"
        class="notifications__list"
      >
        <div
          v-for="item in messages"
          :key="item.ID"
          ref="message"
          :data-id="item.ID"
          class="notifications__item"
          :class="{
            'unread': item['recipients.acceptDate'] === null,
            'overflowed': item.isOverflowed
          }"
          @click="showHistory(item.ID)"
        >
          <div class="notifications__item__header">
            <i
              class="notifications__item__icon"
              :class="getIconClsByType(item.messageType)"
            />
            <span class="notifications__item__type">
              {{ getTypeLocaleString(item.messageType) }}
            </span>
            <span class="notifications__item__date">
              {{ $moment(item.startDate).format('L') }}
            </span>
          </div>
          <div
            class="notifications__item__text"
            v-html="item.messageBody"
          />
          <button
            v-show="item.isOverflowed"
            class="notifications__item__btn-overflow"
          >
            {{ $ut('showFull') }}
          </button>
        </div>
      </div>

      <div
        v-else
        class="ub-empty-text"
      >
        {{ $ut('youHaveNoNewMessages') }}
      </div>

      <el-button
        plain
        class="notifications__btn-show-all"
        @click="showHistory()"
      >
        {{ $ut('messageHistory') }}
      </el-button>
    </el-popover>
  </div>
</template>

<script>
export default {
  name: 'UNavbarNotificationsButton',

  data () {
    return {
      isVisible: false,
      messages: []
    }
  },

  computed: {
    unreadMessagesCount () {
      return this.messages.filter(m => m['recipients.acceptDate'] === null).length
    }
  },

  created () {
    this.addNotificationListeners()
    this.getMessages()
  },

  methods: {
    checkOverflowed () {
      if (this.$refs.message === undefined) return
      for (const message of this.$refs.message) {
        if (message.offsetHeight > 120) {
          const ID = +message.getAttribute('data-id')
          const index = this.messages.findIndex(m => m.ID === ID)
          if (index !== -1) {
            this.$set(this.messages[index], 'isOverflowed', true)
          }
        }
      }
    },

    getTypeLocaleString (type) {
      const capitalizeStr = type.charAt(0).toUpperCase() + type.slice(1)
      return this.$ut('msgType' + capitalizeStr)
    },

    getIconClsByType (type) {
      return {
        information: 'el-icon-info',
        warning: 'el-icon-warning',
        system: 'el-icon-error',
        user: 'el-icon-message'
      }[type]
    },

    add () {
      this.isVisible = false
      $App.doCommand({
        cmdType: 'showForm',
        entity: 'ubs_message_edit'
      })
    },

    showHistory (ID) {
      this.isVisible = false
      $App.doCommand({
        cmdType: 'showForm',
        entity: 'ubs_message',
        messageIdOnOpen: ID
      })
    },

    async getMessages () {
      const messages = await this.$UB.connection
        .Repository('ubs_message')
        .attrs('ID', 'messageBody', 'messageType', 'startDate', 'expireDate', 'recipients.acceptDate')
        .where('recipients.acceptDate', 'isNull')
        .orderByDesc('startDate')
        .select()
      this.messages.push(...messages)
    },

    addNotificationListeners () {
      $App.on({
        'portal:notify:newMess': (message) => {
          this.messages.push(message)
          this.$notify({
            title: 'New message',
            type: 'info'
          })
        },
        'portal:notify:readed': (ID, acceptDate) => {
          const index = this.messages.findIndex(m => m.ID === ID)
          if (index !== -1) {
            this.messages[index]['recipients.acceptDate'] = acceptDate
          }
        }
      })
    }
  }
}
</script>

<style>
.notifications__popover{
  padding: 0;
}

.notifications__list{
  max-height: 180px;
  overflow-y: auto;
  border-top: 1px solid rgba(var(--info), 0.15);
}

.notifications__list::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

.notifications__list::-webkit-scrollbar-thumb {
  border: 2px solid rgba(0, 0, 0, 0);
  background-clip: padding-box;
  background-color: rgba(var(--bg), 0.2);
  transition:background-color .1s;
}

.notifications__popover__header{
  display: flex;
  padding: 5px;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(var(--info), 0.15);
}

.notifications__btn-show-all{
  width: 100%;
}

.notifications__title-list-count{
  color: rgba(var(--info), 0.7);
  font-size: 11px;
  padding-left: 10px;
}

/* notifications item */
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
  color: rgb(var(--info));
  margin-left: 10px;
}

.notifications__item__icon.el-icon-error{
  color: rgb(var(--danger));
}

.notifications__item__icon.el-icon-warning{
  color: rgb(var(--warning));
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
