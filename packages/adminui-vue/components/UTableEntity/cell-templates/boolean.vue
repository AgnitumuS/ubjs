<template>
  <div>
    {{ $ut(value ? 'da' : 'net') }}
  </div>
</template>

<script>
export default {
  props: ['value']
}
</script>
