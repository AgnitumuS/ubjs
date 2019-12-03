<template>
  <div
    v-show="filters.length > 0"
    class="u-table-entity__filter-list"
  >
    <div class="u-table-entity__filter-list__title">
      {{ $ut('table.filter.list.title') }}:
    </div>

    <div
      v-for="filter in filters"
      :key="filter.columnId"
      class="u-table-entity__filter-list-item"
      @click.middle="removeFilter(filter.columnId)"
    >
      <div>
        <span>
          {{ $ut(filter.label) }}
        </span>
        <span class="filter-list-item__description">
          {{ $ut(filter.description) }}
        </span>
      </div>
      <i
        class="u-table-entity__filter-list-item__close-icon el-icon-close"
        @click="removeFilter(filter.columnId)"
      />
    </div>
  </div>
</template>

<script>
const { mapState, mapActions } = require('vuex')

export default {
  computed: mapState(['filters']),
  methods: mapActions(['removeFilter'])
}
</script>

<style>
.u-table-entity__filter-list{
  display: flex;
  align-items: center;
  background: rgb(var(--table-bg));
  padding: 8px 16px;
}

.u-table-entity__filter-list__title{
  color: rgb(var(--info-light));
}

.u-table-entity__filter-list-item{
  display: flex;
  align-items: center;
  padding-left: 8px;
  margin-left: 8px;
  color: rgb(var(--text));
  font-size: 12px;
  line-height: 1.1;
  background: rgb(var(--bg-grey));
  border: 1px solid rgba(var(--info-light), 0.4);
  border-radius: 5px;
  font-weight: 300;
}

.filter-list-item__description{
  color: rgb(var(--info-light));
}

.u-table-entity__filter-list-item__close-icon{
  margin-left: 4px;
  font-size: 14px;
  color: #000;
  cursor: pointer;
  width: 30px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
