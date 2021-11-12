### Usage
  
### Slots
You can override values as named slots.
In this case another columns will be shows as usual.
Slot scope will pass `value`, `row`, and `column`
Header cell also has format functions and scoped slots, but it provides only `column` param.
To set scoped slot for header cell just add prefix `head_` to column ID

```vue
<template>
  <u-table
    :items="currencies"
    :columns="columns"
  >
    <template #head_code="{ column }">
      <u-base-input
        :value="column.label"
      />
    </template>

    <template #code="{ value, row }">
      <u-base-input
        :value="value"
        @input="changeCode({ ID: row.ID, value: $event })"
      />
    </template>
  </u-table>
</template>
<script>
  export default {
    data () {
      return {
        currencies: [{
          ID: 1,
          code: 'UAH',
          caption: 'Hryvna',
          country: 'Ukraine'
        },{
          ID: 2,
          code: 'USD',
          caption: 'Dollar',
          country: 'USA'
        },{
          ID: 3,
          code: 'EUR',
          caption: 'Euro',
          country: 'France'
        }],

        columns: [{
          id: 'code',
          label: 'Code'
        }, {
          id: 'caption',
          label: 'Caption'
        }, {
          id: 'country',
          label: 'Country'
        }]
      }
    },

    methods: {
      changeCode ({ ID, value }) {
        const currency = this.currencies.find(c => c.ID === ID)

        currency.code = value
      }
    }
  }
</script>
```

### Selection Mode
`v-model` matched with `selected` event

```vue
<template>
  <div>
    <u-table
      v-model="selectedIDs"
      :items="currencies"
      :columns="columns"
      enable-multi-select
      @remove-selected="beenRemoved = $event"
      @add-selected="beenAdded = $event"
    />
    <p>selectionIDs: {{selectedIDs}}</p>
    <p>have been added: {{beenAdded}}</p>
    <p>have been removed: {{beenRemoved}}</p>
  </div>
</template>
<script>
  export default {
    data () {
      return {
        selectedIDs: [2,3],
        beenRemoved: [],
        beenAdded: [],
        currencies: [{
          ID: 1,
          code: 'UAH',
          caption: 'Hryvna',
          country: 'Ukraine'
        },{
          ID: 2,
          code: 'USD',
          caption: 'Dollar',
          country: 'USA'
        },{
          ID: 3,
          code: 'EUR',
          caption: 'Euro',
          country: 'France'
        }],

        columns: [{
          id: 'code',
          label: 'Code'
        }, {
          id: 'caption',
          label: 'Caption'
        }, {
          id: 'country',
          label: 'Country'
        }]
      }
    },
  }
</script>
```

### Sort Mode
Sorting in the browser. Without request to server
```vue
<template>
  <u-table
    :items="currencies"
    :columns="columns"
    sorting
    :initial-sorting="{col: 'country', direction: 'asc'}"
  />
</template>
<script>
  export default {
    data () {
      return {
        currencies: [{
          ID: 1,
          code: 'UAH',
          caption: 'Hryvna',
          country: 'Ukraine'
        },{
          ID: 2,
          code: 'USD',
          caption: 'Dollar',
          country: 'USA'
        },{
          ID: 3,
          code: 'EUR',
          caption: 'Euro',
          country: 'France'
        },{
          ID: 4,
          code: 'MDL',
          caption: 'Ley',
          country: 'Moldova'
        }],

        columns: [{
          id: 'code',
          label: 'Code'
        }, {
          id: 'caption',
          label: 'Caption'
        }, {
          id: 'country',
          label: 'Country'
        }]
      }
    },
  }
</script>
```