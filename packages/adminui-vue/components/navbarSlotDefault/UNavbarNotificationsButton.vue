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

      <div
        v-if="isVisible"
        class="notifications__list"
      >
        <div
          v-for="item in messagesUnreadOnInit"
          :key="item.ID"
          ref="el"
          class="notifications__item"
          :class="{
            'unread': item.unread,
            'overflowed': /*isOverflowed*/ false,
            'active': false/*isActive*/
          }"
          @click="showHistory(item.ID)"
        >
          <div class="notifications__item__header">
            <i class="notifications__item__icon el-icon-warning" />
            <span class="notifications__item__type">{{item.type}}</span>
            <span class="notifications__item__date">
              {{ $moment(item.date).format('DD.MM.YYYY') }}
            </span>
          </div>
          <div
            class="notifications__item__text"
            v-html="item.text"
          />
          <button
            v-show="/*isOverflowed*/ false"
            class="notifications__item__btn-overflow"
          >
            Полностью...
          </button>
        </div>
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
  </div>
</template>

<script>
/*
get overflowed
if (this.$refs.el.offsetHeight > 120) {
  this.isOverflowed = true
}
*/

export default {
  name: 'UNavbarNotificationsButton',

  data () {
    return {
      isVisible: false,
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

    showHistory (active) {
      this.isVisible = false
      $App.doCommand({
        cmdType: 'showForm',
        isModal: true,
        entity: 'ubs_message',
        active
      })
    },

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

/* item */
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
