<template>
  <div
    class="u-table-entity__filter__container"
    @keydown.stop
  >
    <i class="fa fa-filter u-table-entity__filter__icon" />
    <el-select
      v-model="selectedColumnId"
      class="u-table-entity__filter__input"
      :placeholder="$ut('table.filter.columnPlaceholder')"
    >
      <el-option
        v-for="col in columns"
        :key="col.id"
        :value="col.id"
        :label="$ut(col.label)"
      />
    </el-select>
    <component
      :is="selectedColumnTemplate"
      :key="selectedColumnId"
      class="u-table-entity__filter__section"
    />
  </div>
</template>

<script>
const { mapGetters } = require('vuex')

export default {
  computed: {
    ...mapGetters(['selectedColumn', 'columns']),

    selectedColumnTemplate () {
      const column = this.selectedColumn
      if (column && typeof column.filterTemplate === 'function') {
        return column.filterTemplate()
      } else {
        return null
      }
    },

    selectedColumnId: {
      get () {
        return this.$store.state.selectedColumnId
      },
      set (value) {
        this.$store.commit('SELECT_COLUMN', value)
      }
    }
  }
}
</script>

<style>
.u-table-entity__filter__container {
  display: flex;
  background: rgb(var(--bg-grey));
  border-radius: 5px;
  padding: 4px 8px;
  margin: 12px 0;
  margin-left: 16px;
  align-items: center;
}

.u-table-entity__filter__icon{
  font-size: 20px;
  color: rgba(var(--success), 0.9);
  margin-right: 8px;
  margin-left: 4px;
}

.u-table-entity__filter__input{
  margin: 0 4px;
  width: 150px;
}

.u-table-entity__filter__section{
  display: flex;
  align-items: center;
}

/* used in entity.vue and enum.vue */
.u-table-entity__filter__select-multiple{
  max-width: 470px;
}
.u-table-entity__filter__select-multiple .ub-select-multiple__container{
  background: white;
}
</style>
