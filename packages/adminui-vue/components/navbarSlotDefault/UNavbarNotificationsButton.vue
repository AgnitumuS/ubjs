<template>
  <div
    v-if="ubsMessagesAccessible"
    class="u-navbar__dropdown"
  >
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
        <u-button
          icon="u-icon-bell"
          appearance="inverse"
          circle
        />
      </el-badge>

      <div class="notifications__popover__header">
        <span class="notifications__title-list-count">
          {{ $ut('newMessages', unreadMessagesCount) }}
        </span>

        <el-button
          v-if="$UB.connection.domain.isEntityMethodsAccessible('ubs_message_edit', ['insert', 'update'])"
          icon="u-icon-add"
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
          v-for="item in visibleMessages"
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
              {{ $UB.formatter.formatDate(item.startDate, 'dateTime') }}
            </span>
          </div>
          <div
            class="notifications__item__text"
            v-html="localizeMessage(item.messageBody)"
          />
          <button
            v-show="item.isOverflowed"
            class="notifications__item__btn-overflow"
          >
            {{ $ut('showFull') }}
          </button>
        </div>

        <div
          v-if="hiddenMessagesCount > 0"
          class="notifications__hidden-msgs-count"
        >
          {{ $ut('hiddenMessages',  hiddenMessagesCount) }}
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
/* global $App */

const VISIBLE_MESSAGES_COUNT = 20

/**
 * @class UNavbarNotificationsButton
 * Navbar notification button.
 *
 * Hides itself in case `ubs_message.getCached` is not accessible to user
 */
export default {
  name: 'UNavbarNotificationsButton',

  data () {
    return {
      isVisible: false,
      ubsMessagesAccessible: false,
      messages: []
    }
  },

  computed: {
    unreadMessages () {
      return this.messages.filter(m => m['recipients.acceptDate'] === null)
    },

    unreadMessagesCount () {
      return this.unreadMessages.length
    },

    unreadSystemMessages () {
      return this.unreadMessages.filter(m => m.messageType === 'system')
    },

    visibleMessages () {
      return this.messages.slice(0, VISIBLE_MESSAGES_COUNT)
    },

    hiddenMessagesCount() {
      return this.messages.length - VISIBLE_MESSAGES_COUNT
    }
  },

  watch: {
    messages () {
      this.checkForUnreadSystemMessages(this.unreadSystemMessages)
    }
  },

  created () {
    this.ubsMessagesAccessible = this.$UB.connection.domain.isEntityMethodsAccessible('ubs_message', 'getCached')
    if (this.ubsMessagesAccessible) {
      this.addNotificationListeners()
      this.getMessages()
    }
  },

  methods: {
    checkForUnreadSystemMessages (value) {
      if (value && value.length) {
        this.showHistory(value[0].ID, true)
      }
    },

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

    /**
     * Opens ubs_message form and set focus on received message ID
     * @param {number} ID - message ID
     * @param {boolean} isModal - if true, opens form in modal
     */
    showHistory (ID, isModal = false) {
      this.isVisible = false
      $App.doCommand({
        cmdType: 'showForm',
        entity: 'ubs_message',
        title: this.$ut('messageHistory'),
        isModal: isModal,
        modalWidth: '90vw',
        props: {
          messageIdOnOpen: ID
        }
      })
    },

    async getMessages () {
      const request = this.$UB
        .Repository('ubs_message')
        .using('getCached')
        .attrs('ID', 'messageBody', 'messageType', 'startDate', 'expireDate', 'recipients.acceptDate')
        .where('recipients.acceptDate', 'isNull')
        .orderByDesc('startDate')
        .selectAsObject()
      // get data by connection.query to avoid query buffering
      const messages = await request
      // this.$UB.connection.query(request).then(this.$UB.LocalDataStore.selectResultToArrayOfObjects)
      this.messages = [...this.messages, ...messages]
    },

    addNotificationListeners () {
      $App.on({
        'portal:notify:newMess': (message) => {
          this.messages = [message, ...this.messages]

          this.$notify({
            duration: 0,
            dangerouslyUseHTMLString: true,
            type: 'info',
            message: this.localizeMessage(message.messageBody)
          })
        },

        'portal:notify:readed': (ID, acceptDate) => {
          const index = this.messages.findIndex(m => m.ID === ID)
          if (index !== -1) {
            this.$set(this.messages[index], 'recipients.acceptDate', acceptDate)
          }
        }
      })
    },

    localizeMessage (messageBody) {
      try {
        const parsed = Array.isArray(messageBody) ? messageBody : JSON.parse(messageBody)
        if (parsed && Array.isArray(parsed)) {
          const [localeKey, ...params] = parsed
          if (typeof localeKey === 'object') {
            const value = localeKey[$App.connection.userLang()] ??
              localeKey[$App.connection.appConfig.defaultLang] ??
              localeKey['en']
            return this.$ut(value, params.map(p => this.localizeMessage(p)))
          }
          return this.$ut(localeKey, params.map(p => this.localizeMessage(p)))
        }
        return messageBody
      } catch {
        return messageBody
      }
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
}

.notifications__popover__header{
  display: flex;
  padding: 5px;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid hsl(var(--hs-border), var(--l-layout-border-default));
}

.notifications__btn-show-all{
  width: 100%;
}

.notifications__title-list-count{
  color: hsl(var(--hs-text), var(--l-text-label));
  font-size: 11px;
  padding-left: 10px;
}

/* notifications item */
.notifications__item{
  padding: 10px;
  padding-left: 20px;
  border-bottom: 1px solid hsl(var(--hs-border), var(--l-layout-border-default));
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
  color: hsl(var(--hs-text), var(--l-text-disabled));
  border: none;
  background: linear-gradient(to bottom, transparent, hsl(var(--hs-background), var(--l-background-inverse)) 50%);
  pointer-events: none;
}

.notifications__item.unread .notifications__item__btn-overflow{
  background: linear-gradient(to bottom, transparent, hsl(var(--hs-background), var(--l-background-inverse)) 50%);
}

.notifications__item.overflowed{
  overflow: hidden;
  max-height: 120px;
}

.notifications__item:hover .notifications__item__btn-overflow{
  color: hsl(var(--hs-primary), var(--l-state-default));
}

.notifications__item.active{
  background: hsl(var(--hs-primary), var(--l-background-default));
}

.notifications__item:hover{
  background: hsl(var(--hs-background), var(--l-background-active));
}

.notifications__item.unread:hover{
  background: hsl(var(--hs-primary), var(--l-background-active));
}

.notifications__item.unread{
  background: hsl(var(--hs-primary), var(--l-background-default));
}

.notifications__item.unread:before{
  content: '';
  width: 8px;
  height: 8px;
  background: hsl(var(--hs-primary), var(--l-state-default));
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
  color: hsl(var(--hs-control), var(--l-state-default));
  margin-left: 10px;
}

.notifications__item__icon.el-icon-error{
  color: hsl(var(--hs-danger), var(--l-state-default));
}

.notifications__item__icon.el-icon-warning{
  color: hsl(var(--hs-warning), var(--l-state-default));
}

.notifications__item__type{
  font-size: 11px;
  color: hsl(var(--hs-text), var(--l-text-default));
  padding-left: 7px;
}

.notifications__item__text{
  font-size: 13px;
  color: hsl(var(--hs-text), var(--l-text-default));
  padding-left: 10px;
}

.notifications__item__date{
  font-size: 11px;
  color: hsl(var(--hs-text), var(--l-text-label));
  margin-left: auto;
}

.notifications__hidden-msgs-count {
  color: hsl(var(--hs-text), var(--l-text-label));
  font-size: 11px;
  padding-left: 10px;
  text-align: center;
  padding: 10px;
}
</style>
