<template>
  <div class="u-cron">
    <div class="u-cron__desc">
      <div class="u-cron__desc--expresion">{{ cronString }}</div>
      <div class="u-cron__desc--txt">{{ humanCronString }}</div>
    </div>
    <div class="u-cron__main">
      <!-- <URadio
        v-model="everyTimeValue"
        class="u-cron__sidebar"
        :items="everyTime"
      /> -->
      <div class="u-cron__sidebar">
        <span
          v-for="(item, index) in everyTime"
          :key="index"
          @click="everyTimeValue = item.id"
          class="u-cron__tab"
          :class="{'u-cron__tab-active': everyTimeValue === item.id}"
          >{{ item.label }}</span
        >
      </div>
      <div class="u-cron__body">
        <keep-alive>
          <component
            :is="currentComponent"
            :item="everyTime.find((i) => i.id === everyTimeValue)"
            @change="changeHandler"
            :locale="locale"
          />
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script>
// я не понимаю, каким другим способом можно подключить пакет установленый в adminui-pub
const cronstrue = require("../../../../adminui-pub/node_modules/cronstrue/i18n");

export default {
  name: "Cron",
  components: {
    secondsCron: require("./secondsCron.vue").default,
    minutesCron: require("./minutesCron.vue").default,
    hoursCron: require("./hoursCron.vue").default,
    dayCron: require("./dayCron.vue").default,
    weekCron: require("./weekCron.vue").default,
    monthCron: require("./monthCron.vue").default,
    yearCron: require("./yearCron.vue").default,
  },
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      everyTimeValue: "day",
      everyTime: [
        { id: "seconds", label: "секунди", value: "*" },
        { id: "minutes", label: "хвилини", value: "*" },
        { id: "hours", label: "години", value: "*" },
        { id: "day", label: "день", value: "*" },
        { id: "month", label: "місяця", value: "*" },
        { id: "week", label: "дні тижня", value: "*" },
        // { id: 'year', label: 'року', value: '*' }
      ],
    };
  },
  created(){
    this.init(this.value)
  },
  computed: {
    currentComponent() {
      return this.everyTimeValue + "Cron" || "div";
    },
    cronString() {
      return this.everyTime.map((i) => i.value).join(" ");
    },
    locale(){
      return $App.connection.userData('lang')
    },
    humanCronString() {
      let str = ''
      const { locale } = this
      try {
        str = cronstrue.toString(this.cronString, { locale })
      } catch (err) {
        console.log(err)
      } finally {
        return str
      }
    },
  },
  watch: {
    humanCronString(newValue){
      this.$emit('change', {cronString: this.cronString, humanString: newValue })
    }
  },
  methods: {
    init(cronStr = this.value){
      if (!cronStr) return
      const value = cronStr.split(' ')
      value.reverse()
      const { everyTime } = this
      const length = everyTime.length - 1
      value.forEach((str, index)=>{
        everyTime[length - index].value = str
      })

    },
    changeHandler(e) {
      const item = this.everyTime.find((i) => i.id === this.everyTimeValue)
      item.value = e
    },
  },
};
</script>

<style>
.u-cron__sidebar {
    display: flex;
  flex-direction: column;
  padding-right: 24px;
}
.u-cron__tab.u-cron__tab-active{
  color: white;
  background: hsl(var(--hs-primary), var(--l-state-hover));
  border-radius: 4px;
}
.u-cron__tab {
  padding: 10px;
  cursor: pointer;
  text-transform: capitalize;
  white-space: nowrap;
}
.u-cron__main {
  display: flex;
}
.u-cron__sidebar {
  padding-right: 24px;
  margin-right: 24px;
  border-right: 1px solid;
}
.u-cron__body .u-radio {
  margin-bottom: 24px;
}
.u-cron__body .u-radio--wrap {
  width: 100%;
}
.cron__start {
  display: flex;
}
.cron__start__item {
  margin-right: 8px;
}

.u-cron__body .u-radio__label {
  font-weight: 500;
}
.u-cron__desc {
  margin-bottom: 20px;
}
.u-cron__desc--txt {
  font-weight: 500;
}
.u-cron__desc--expresion {
  margin-bottom: 4px;
}
</style>
