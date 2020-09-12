<template>
  <div>
    <span
      v-if="cellData.type === 'label'"
    >
      {{ cellData.data }}
    </span>

    <span
      v-if="cellData.type === 'text' && cellData.data"
      :style="{color: cellData.data}"
    >
      Text example
    </span>

    <button
      v-if="cellData.type === 'control' && cellData.data"
      :style="{
        background: cellData.data,
        border: 'none',
        color: 'hsl(var(--hs-text), var(--l-text-inverse))',
        padding: '10px',
        borderRadius: 'var(--border-radius)'
      }"
    >
      Button example
    </button>

    <div
      v-if="cellData.type === 'border' && cellData.data"
      :style="{
        border: `2px solid ${cellData.data}`,
        padding: '5px'
      }"
    >
      Border example
    </div>

    <div
      v-if="cellData.type === 'background' && cellData.data"
      :style="{
        background: cellData.data,
        padding: '40px 20px'
      }"
    >
      Background example
    </div>
  </div>
</template>

<script>
export default {
  props: {
    cellData: Object
  }
}
</script>
