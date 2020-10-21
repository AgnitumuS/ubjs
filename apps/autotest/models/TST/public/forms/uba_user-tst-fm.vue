<template>
  <uba-user-root>
    <template #attr_name="{value, originalComponent}">
      <div>
        <!--TODO: remove div-->
        add info before login field
        <component :is="originalComponent" />
        add info after login field
      </div>
    </template>

    <template #tabs="{tabsComponents}">
      <component :is="tabsComponents.main" />

      <el-tab-pane label="New tab">
        <form @submit.prevent="addExampleItem">
          <u-base-input v-model="exampleCaptionModel" />
          <u-button type="submit">
            Add
          </u-button>
        </form>
        <ul>
          <li
            v-for="item in exampleCollectionData"
            :key="item.ID"
          >
            <u-button
              icon="u-icon-delete"
              @click="deleteExampleItem(item.ID)"
            />
            {{ item.caption }}
          </li>
        </ul>
      </el-tab-pane>

      <component :is="tabsComponents.certificates" />

      <el-tab-pane label="Another tab">
        Is empty
      </el-tab-pane>
    </template>
  </uba-user-root>
</template>

<script>
const originalForm = require('@unitybase/uba/public/forms/uba_user-fm.vue')
const { mapMutations, mapActions } = require('vuex')

module.exports.controller = (cfg) => {
  const originalController = originalForm.controller(cfg)

  originalController.fieldList.push('addedAttr')

  originalController.collections.example = ({ state }) => UB.Repository('tst_added_entity')
    .attrs('ID', 'userID', 'caption')
    .where('userID', '=', state.data.ID)

  return originalController
}

module.exports.default = {
  mixins: [
    originalForm.default // mixins is best way to extend original form
  ],

  data () {
    return {
      exampleCaptionModel: ''
    }
  },

  computed: {
    exampleCollectionData () {
      return this.$store.state.collections.example.items.map(i => i.data)
    }
  },

  methods: {
    ...mapMutations(['DELETE_COLLECTION_ITEM']),
    ...mapActions(['addCollectionItem']),

    async addExampleItem () {
      await this.addCollectionItem({
        collection: 'example',
        execParams: {
          caption: this.exampleCaptionModel,
          userID: this.$store.state.data.ID
        }
      })

      this.exampleCaptionModel = ''
    },

    deleteExampleItem (ID) {
      const index = this.exampleCollectionData.findIndex(i => i.ID === ID)
      if (index !== -1) {
        this.DELETE_COLLECTION_ITEM({
          collection: 'example',
          index
        })
      }
    }
  }
}
</script>
