<template>
  <div class="ub-navbar__dropdown">
    <el-popover
      v-model="isVisible"
      placement="bottom-end"
      width="300"
      trigger="click"
      popper-class="notifications__popover"
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
        <span class="notifications__title-list-count">5 new messages</span>

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

      <div class="notifications__list">
        <div
          v-for="item in messages"
          :key="item.ID"
          class="notifications__item"
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

      <el-button
        plain
        class="notifications__btn-show-all"
        @click="showHistory"
      >
        {{ $ut('messageHistory') }}
      </el-button>
    </el-popover>

    <u-navbar-notifications-popup v-model="historyVisible" />
  </div>
</template>

<script>
const UNavbarNotificationsPopup = require('./UNavbarNotificationsPopup.vue').default

export default {
  name: 'UNavbarNotificationsButton',

  components: { UNavbarNotificationsPopup },

  data () {
    return {
      isVisible: false,
      historyVisible: false,
      messages: [{
        ID: 1,
        text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Id, dolores iusto unde est ipsam soluta laborum? Voluptatibus, repellendus doloribus illo!',
        type: 'user',
        date: new Date(2009, 1, 1)
      }, {
        ID: 2,
        text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Id, dolores iusto unde est ipsam soluta laborum? Voluptatibus, repellendus doloribus illo!',
        type: 'system',
        date: new Date(2019, 4, 5)
      }, {
        ID: 3,
        text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Id, dolores iusto unde est ipsam soluta laborum? Voluptatibus, repellendus doloribus illo!',
        type: 'warning',
        date: new Date(2012, 3, 2)
      }, {
        ID: 4,
        text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Id, dolores iusto unde est ipsam soluta laborum? Voluptatibus, repellendus doloribus illo!',
        type: 'information',
        date: new Date(2012, 3, 2)
      }, {
        ID: 5,
        text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Id, dolores iusto unde est ipsam soluta laborum? Voluptatibus, repellendus doloribus illo!',
        type: 'system',
        date: new Date(2012, 3, 2)
      }]
    }
  },

  methods: {
    add () {
      this.isVisible = false
      $App.doCommand({
        cmdType: 'showForm',
        entity: 'ubs_message_edit'
      })
    },

    showList () {
      this.isVisible = false
      // TEMPORARY
      Ext.ComponentQuery.query('[$className=UBS.MessageBar]')[0].showHistory()
    },

    showHistory () {
      this.isVisible = false
      this.historyVisible = true
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

.notifications__item{
  padding: 10px 5px;
  border-bottom: 1px solid rgba(var(--info), 0.05);
  /*max-height: 100px;*/
  /*overflow: hidden;*/
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
