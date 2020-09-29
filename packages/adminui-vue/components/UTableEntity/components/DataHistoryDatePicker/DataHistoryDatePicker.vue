<template>
  <el-dialog
    v-hold-focus
    append-to-body
    :close-on-click-modal="false"
    :visible.sync="visible"
    :title="$ut('aktualnoS')"
  >
    <u-date-picker
      v-model="selectedDate"
      :picker-options="pickerOptions"
    />

    <div class="data-history-date-picker__dialog-footer">
      <u-button
        :disabled="!selectedDate"
        @click="submit"
      >
        {{ $ut('ok') }}
      </u-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'DataHistoryDatePicker',

  props: {
    dateFrom: Date,
    pickDate: Function
  },

  data () {
    return {
      visible: false,
      selectedDate: null
    }
  },

  computed: {
    pickerOptions () {
      return {
        disabledDate: time => time.getTime() < this.dateFrom.getTime()
      }
    }
  },

  watch: {
    visible (value) {
      if (value === false) {
        this.pickDate()
        this.$destroy()
      }
    }
  },

  mounted () {
    this.visible = true
  },

  methods: {
    submit () {
      this.pickDate(this.selectedDate)
      this.visible = false
    }
  }
}
</script>

<style>
.data-history-date-picker__dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
