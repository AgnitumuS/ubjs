<template>
  <div class="ub-navbar__dropdown">
    <el-popover
      v-model="isVisible"
      placement="bottom-end"
      width="400"
      trigger="click"
      popper-class="notifications__popover"
      @show="getUnreadList"
    >
      <el-badge
        slot="reference"
        type="info"
        :value="0"
      >
        <el-button
          icon="el-icon-bell"
          circle
        />
      </el-badge>

      <div class="notifications__add-btn-wrap">
        <span class="notifications__title-list-count">{{ messagesUnreadOnInit.length }} new messages</span>

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

      <div v-if="isVisible" class="notifications__list">
        <u-navbar-notifications-item
          v-for="item in messagesUnreadOnInit"
          :id="String(item.ID)"
          :key="item.ID"
          :date="item.date"
          :unread="item.unread"
          :type="item.type"
          :text="item.text"
          @click.native="showHistory(item.ID)"
        />
      </div>

      <div v-if="messagesUnreadOnInit.length < 1">
        Empty
      </div>

      <el-button
        plain
        class="notifications__btn-show-all"
        @click="showHistory()"
      >
        {{ $ut('messageHistory') }}
      </el-button>
    </el-popover>

    <u-navbar-notifications-popup
      v-model="historyVisible"
      :current-mess="currentMess"
    >
      <u-navbar-notifications-item
        v-for="item in messages"
        :id="String(item.ID)"
        :key="item.ID"
        :date="item.date"
        :unread="item.unread"
        :type="item.type"
        :text="item.text"
        :is-active="item.ID == active"
        @click.native="markRead(item.ID)"
      />
    </u-navbar-notifications-popup>
  </div>
</template>

<script>
const UNavbarNotificationsPopup = require('./UNavbarNotificationsPopup.vue').default
const UNavbarNotificationsItem = require('./UNavbarNotificationsItem.vue').default

export default {
  name: 'UNavbarNotificationsButton',

  components: {
    UNavbarNotificationsPopup,
    UNavbarNotificationsItem
  },

  data () {
    return {
      isVisible: false,
      historyVisible: false,
      messages: [{
        ID: 1,
        text: '<span style="color: red; font-size:25px;">Lorem ipsum dolor</span> sit amet, consectetur adipisicing elit. Id, dolores iusto unde est ipsam soluta laborum? <span style="color: green; font-size:25px;">Voluptatibus, repellendus doloribus illo!</span>',
        type: 'user',
        date: new Date(2009, 1, 1),
        unread: !false
      }, {
        ID: 2,
        text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Id, dolores iusto unde est ipsam soluta laborum? Voluptatibus, repellendus doloribus illo!',
        type: 'system',
        date: new Date(2019, 4, 5),
        unread: !false
      }, {
        ID: 3,
        text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Id, dolores iusto unde est ipsam soluta laborum? Voluptatibus, repellendus doloribus illo!',
        type: 'warning',
        date: new Date(2012, 3, 2),
        unread: false
      }, {
        ID: 4,
        text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Id, dolores iusto unde est ipsam soluta laborum? Voluptatibus, repellendus doloribus illo!',
        type: 'information',
        date: new Date(2012, 3, 2),
        unread: false
      }, {
        ID: 5,
        text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Id, dolores iusto unde est ipsam soluta laborum? Voluptatibus, repellendus doloribus illo!',
        type: 'system',
        date: new Date(2012, 3, 2),
        unread: false
      }],
      messagesUnreadOnInit: [],
      overflowedList: [],
      active: null
    }
  },

  computed: {
    currentMess () {
      const mess = this.messages.find(m => m.ID === this.active)
      if (mess) {
        return mess.text
      } else {
        return ''
      }
    }
  },

  methods: {
    add () {
      this.isVisible = false
      $App.doCommand({
        cmdType: 'showForm',
        isModal: true,
        entity: 'ubs_message_edit'
      })
    },

    showHistory () {
      this.isVisible = false
      $App.doCommand({
        cmdType: 'showForm',
        cmdCode: 'ubs_message'
      })
    },

    // showHistory (ID) {
    //   this.markRead(ID)
    //   this.isVisible = false
    //   this.historyVisible = true
    // },

    markRead (ID) {
      const index = this.messages.findIndex(m => m.ID === ID)
      if (ID) {
        this.active = ID
      } else {
        this.active = this.messages[0].ID
      }
      this.active = ID
      if (index !== -1) {
        this.messages[index].unread = false
      }
    },

    getUnreadList () {
      this.messagesUnreadOnInit.splice(0, this.messagesUnreadOnInit.length)
      const overflowedList = this.messages.filter(m => m.unread)
      this.messagesUnreadOnInit.push(...overflowedList)
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

.notifications__add-btn-wrap{
  display: flex;
  padding: 5px;
  justify-content: space-between;
  align-items: center;
}

.notifications__btn-show-all{
  width: 100%;
}

.notifications__title-list-count{
  color: rgba(var(--info), 0.7);
  font-size: 11px;
  padding-left: 10px;
}
</style>
