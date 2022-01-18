<template>
  <div>
    <label
      for=""
    >Кожної:
      <input
        v-model="data.minute"
        type="number"
        min="1"
        max="59"
        step="1"
      > хвилини
    </label>
  </div>
</template>

<script>
export default {
  name: 'MinutesCron',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

<style lang="scss" scoped></style>
