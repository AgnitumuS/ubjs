<template>
  <label class="u-cron-occurrence">
    {{ $ut('UCron.oncePer') }}
    <u-base-input
      class="u-cron-occurrence__input"
      type="number"
      :precision="0"
      min="1"
      max="10"
      :value="oncePer"
      @input="emitChange"
    />
    {{ $ut('UCron.oncePerSuffix') }}
  </label>
</template>

<script>
export default {
  name: 'UCronOccurrence',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      oncePer: 1
    }
  },
  watch: {
    value (newVal) {
      this.restoreCron(newVal)
    }
  },
  created () {
    this.restoreCron(this.value)
  },
  methods: {
    emitChange (newVal) {
      const v = newVal > 1 ? '@' + newVal : ''
      this.$emit('change', v)
    },
    parsePart (val) {
      let intVal = val && val.charAt(0) === '@'
        ? parseInt(val.substring(1), 10)
        : 1
      if (intVal < 1) {
        intVal = 1
      } else if (intVal > 10) {
        intVal = 10
      }
      return intVal
    },
    restoreCron (newVal) {
      this.oncePer = this.parsePart(newVal)
    }
  }
}
</script>

<style>
.u-cron-occurrence {
  display: flex;
  line-height: 3em;
}

.u-cron-occurrence__input {
  margin-left: 0.5em;
  margin-right: 0.5em;
  width: 6em;
}
</style>
