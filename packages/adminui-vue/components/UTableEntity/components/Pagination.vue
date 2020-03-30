<template>
  <div class="pagination">
    <div class="pagination__current">
      {{ items.length === 0 ? 0 : pageIndex * pageSize + 1 }} - {{ pageIndex * pageSize + items.length }}
    </div>

    <div class="pagination__out-of">
      {{ $ut('table.pagination.outOf') }}
    </div>

    <button
      v-if="total === null"
      class="pagination__total"
      @click="getTotal"
    >
      <span>---</span>
      <i class="pagination__total-icon fa fa-eye" />
    </button>
    <button
      v-else
      class="pagination__total"
      disabled
    >
      <span>{{ total }}</span>
    </button>

    <button
      class="pagination__button pagination__button__prev"
      :disabled="pageIndex === 0 || loading"
      @click="pageIndex -= 1"
    >
      <i class="el-icon-arrow-left" />
    </button>
    <button
      class="pagination__button pagination__button__next"
      :disabled="isLastPageIndex || loading"
      @click="pageIndex += 1"
    >
      <i class="el-icon-arrow-right" />
    </button>
  </div>
</template>

<script>
const { mapState, mapGetters, mapActions } = require('vuex')

export default {
  computed: {
    ...mapState([
      'items',
      'isLastPageIndex',
      'total',
      'loading'
    ]),

    ...mapGetters(['pageSize']),

    pageIndex: {
      get () {
        return this.$store.state.pageIndex
      },
      set (value) {
        this.updatePageIndex(value)
      }
    }
  },

  methods: mapActions([
    'getTotal',
    'updatePageIndex'
  ])
}
</script>

<style>
  .pagination{
    margin-left: auto;
    display: flex;
    align-items: center;
  }

  .pagination__current{
    color: hsl(var(--hs-text), var(--l-text-label));
    font-weight: 500;
  }

  .pagination__total{
    background: hsl(var(--hs-background), var(--l-background-default));
    border-radius: 5px;
    cursor: pointer;
    border: none;
    height: 100%;
    padding: 8px 6px;
    display: flex;
    align-items: center;
  }

  .pagination__total:disabled{
    cursor: not-allowed;
  }

  .pagination__total span {
    color: hsl(var(--hs-text), var(--l-text-label));
    font-weight: 500;
  }

  .pagination__total-icon{
    margin-left: 6px;
  }

  .pagination__total i {
    color: hsl(var(--hs-primary), var(--l-state-default));
    font-size: 18px;
  }

  .pagination__out-of{
    color: hsl(var(--hs-text), var(--l-text-label));
    font-weight: 500;
    margin: 0 4px;
  }

  .pagination__button{
    border: none;
    background: none;
    color: hsl(var(--hs-control), var(--l-state-default));
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 24px;
    cursor: pointer;
  }

  .pagination__button:disabled {
    color: hsl(var(--hs-info), var(--l-state-disabled));
    cursor: not-allowed;
  }
  .pagination__button__prev{
    margin-left: 12px;
  }
  .pagination__button__next{
    margin-right: 8px;
  }
</style>
