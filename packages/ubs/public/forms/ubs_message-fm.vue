<template>
  <div class="notifications-history">
    <template v-if="messages.length > 0">
      <div
        class="notifications-history__list"
      >
        <div
          v-for="item in messages"
          :key="item.ID"
          ref="message"
          :data-id="item.ID"
          class="notifications__item"
          :class="{
            'unread': item['recipients.acceptDate'] === null,
            'overflowed': item.isOverflowed,
            'active': activeID === item.ID
          }"
          @click="setActive(item)"
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
        class="notifications-history__detail"
        v-html="currentMess.messageBody"
      />
    </template>
    <div
      v-else
      class="ub-empty-text"
    >
      {{ $ut('messageHistoryIsEmpty') }}
    </div>
  </div>
</template>

<script>
const Vue = require('vue')
const AdminUiVue = require('@unitybase/adminui-vue')

module.exports.mount = function (params) {
  if (AdminUiVue.mountHelpers.activateIfMounted(params)) return
  let mountParams = {
    FormComponent: UbsMessage,
    showFormParams: params
  }
  AdminUiVue.mountHelpers.mount(mountParams)
}

const UbsMessage = module.exports.default = {
  props: {
    /**
     * ID of message which open on init
     * @type {Number}
     */
    messageIdOnOpen: Number
  },

  data () {
    return {
      visible: false,
      messages: [],
      activeID: null,
      ICON_TYPES: {
        information: 'el-icon-info',
        warning: 'el-icon-warning',
        system: 'el-icon-error',
        user: 'el-icon-message'
      }
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

  created () {
    this.addNotificationListeners()
  },

  async mounted () {
    this.visible = true
    await this.getMessages()
    this.checkOverflowed()
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

    getIconClsByType (type) {
      return this.ICON_TYPES[type]
    },

    async getMessages () {
      const messages = await this.$UB.connection
        .Repository('ubs_message')
        .attrs('ID', 'messageBody', 'messageType', 'startDate', 'expireDate', 'recipients.acceptDate', 'recipients.ID')
        .orderByDesc('startDate')
        .select()
      this.messages.push(...messages)
      let mess = {}
      if (this.messages.length) {
        if (this.messageIdOnOpen) {
          mess = this.messages.find(m => m.ID === this.messageIdOnOpen)
        } else {
          mess = this.messages.find(m => m.ID === this.messages[0].ID)
        }
        this.setActive(mess)
      }
    },

    addNotificationListeners () {
      $App.on({
        'portal:notify:newMess': (message) => {
          this.messages.push(message)
        },
        'portal:notify:readed': (ID, acceptDate) => {
          const index = this.messages.findIndex(m => m.ID === ID)
          if (index !== -1) {
            this.messages[index]['recipients.acceptDate'] = acceptDate
          }
        }
      })
    },

    async markRead (mess) {
      $App.fireEvent('portal:notify:markAsReaded', mess)
    },

    setActive (mess) {
      this.activeID = mess.ID

      if (mess['recipients.acceptDate'] === null) {
        this.markRead(mess)
      }
    },

    getTypeLocaleString (type) {
      const capitalizeStr = type.charAt(0).toUpperCase() + type.slice(1)
      return this.$ut('msgType' + capitalizeStr)
    }
  }
}
</script>

<style>
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
/* styles for notifications item placed in \adminui-vue\components\navbarSlotDefault\UNavbarNotificationsButton.vue */
</style>
