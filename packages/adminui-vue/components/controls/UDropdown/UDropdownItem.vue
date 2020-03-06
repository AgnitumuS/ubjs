<template>
  <div
    v-if="divider"
    class="u-dropdown-item__divider"
  />

  <u-dropdown
    v-else
    placement="right-start"
    position="absolute"
  >
    <button
      class="u-dropdown-item"
      :disabled="disabled"
      v-on="$listeners"
      @click="close"
    >
      <i
        v-if="icon"
        class="u-dropdown-item__icon"
        :class="icon"
      />

      <span class="u-dropdown-item__label">
        <!-- @slot Replace label prop -->
        <slot
          v-if="$slots.label"
          name="label"
        />

        <template v-else>
          {{ $ut(label) }}
        </template>
      </span>

      <i
        v-if="hasChildren"
        class="u-dropdown-item__arrow el-icon-caret-right"
      />
    </button>

    <!-- @slot For children u-dropdown-item -->
    <slot slot="dropdown" />
  </u-dropdown>
</template>

<script>
/**
 * Child of UDropdown
 */
export default {
  name: 'UDropdownItem',

  props: {
    /**
     * Icon class
     */
    icon: String,

    /**
     * Item text
     */
    label: String,

    /**
     * Render divider ignore other props
     */
    divider: Boolean,

    /**
     * Disabled state
     */
    disabled: Boolean,

    /**
     * Prevent close dropdown
     */
    preventClose: Boolean
  },

  computed: {
    hasChildren () {
      return this.$slots.default !== undefined
    }
  },

  mounted () {
    this.$on('hide', () => {
      this.$parent.$emit('hide')
    })
  },

  inject: ['parentClose'],

  methods: {
    close () {
      if (this.preventClose || this.hasChildren) {
        return
      }
      this.parentClose()
    }
  }
}
</script>

<style>
.u-dropdown-item{
  display: flex;
  align-items: center;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  white-space: nowrap;
}

.u-dropdown-item:hover {
  background: rgba(var(--info), 0.13);
}

.u-dropdown-item__arrow{
  font-size: 12px;
  color: rgba(var(--info), 0.8);
  padding-right: 4px;
  margin-left: auto;
}

.u-dropdown-item__icon{
  font-size: 14px;
  color: rgba(var(--table-text), 0.8);
  width: 14px;
  height: 14px;
  margin-left: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.u-dropdown-item__label{
  color: rgb(var(--table-text));
  font-size: 14px;
  line-height: 1.4;
  padding: 8px;
  padding-right: 12px;
  margin-left: 4px;
}

.u-dropdown-item__divider{
  width: 100%;
  height: 1px;
  background: rgba(var(--info), 0.1);
  margin: 6px 0;
}

.u-dropdown-item:disabled{
  opacity: 0.5;
  cursor: not-allowed;
}

.u-dropdown-item:disabled:hover{
  background: #fff;
}
</style>

<docs>
  ### Basic usage

  ```vue
  <template>
    <u-dropdown>
      <el-button>click me</el-button>

      <template #dropdown>
        <u-dropdown-item icon="el-icon-edit" label="Edit" @click="say('Edit')"/>
        <u-dropdown-item icon="el-icon-delete" label="Delete" @click="say('Delete')"/>
        <u-dropdown-item icon="el-icon-plus" label="Add" @click="say('Add')"/>
      </template>
    </u-dropdown>
  </template>

  <script>
    export default {
      methods: {
        say(value) {
          alert(value)
        }
      }
    }
  </script>
  ```

  ### Nested items

  ```vue
  <template>
    <u-dropdown>
      <el-button>click me</el-button>

      <template #dropdown>
        <u-dropdown-item icon="el-icon-setting" label="Actions">
          <u-dropdown-item icon="el-icon-edit" label="Edit"/>
          <u-dropdown-item icon="el-icon-delete" label="Delete"/>
          <u-dropdown-item icon="el-icon-plus" label="Add"/>
        </u-dropdown-item>
        <u-dropdown-item icon="el-icon-user" label="User"/>
        <u-dropdown-item icon="el-icon-bell" label="Notifications"/>
      </template>
    </u-dropdown>
  </template>
  ```

  ### Disabled item

  ```vue
  <template>
    <u-dropdown>
      <el-button>click me</el-button>

      <template #dropdown>
        <u-dropdown-item icon="el-icon-lollipop" disabled label="Disabled" @click="say('Disabled')"/>
        <u-dropdown-item icon="el-icon-edit" label="Edit" @click="say('Edit')"/>
        <u-dropdown-item icon="el-icon-delete" label="Delete" @click="say('Delete')"/>
        <u-dropdown-item icon="el-icon-plus" label="Add" @click="say('Add')"/>
      </template>
    </u-dropdown>
  </template>

  <script>
    export default {
      methods: {
        say(value) {
          alert(value)
        }
      }
    }
  </script>
  ```

  ### Divider

  ```vue
  <template>
    <u-dropdown>
      <el-button>click me</el-button>

      <template #dropdown>
        <u-dropdown-item icon="el-icon-edit" label="Edit"/>
        <u-dropdown-item icon="el-icon-plus" label="Add"/>
        <u-dropdown-item divider/>
        <u-dropdown-item icon="el-icon-delete" label="Delete"/>
      </template>
    </u-dropdown>
  </template>
  ```

  ### Prevent click
  In case dont need close dropdown on click

  ```vue
  <template>
    <u-dropdown>
      <el-button>click me</el-button>

      <template #dropdown>
        <u-dropdown-item label="This button will close dropdown"/>
        <u-dropdown-item prevent-close label="Prevented"/>
      </template>
    </u-dropdown>
  </template>
  ```

  ### Slot label

  ```vue
  <template>
    <u-dropdown>
      <el-button>click me</el-button>

      <template #dropdown>
        <u-dropdown-item prevent-close>
          <el-checkbox v-model="checked" slot="label">
            Some action
          </el-checkbox>
        </u-dropdown-item>
        <u-dropdown-item label="Another item 1"/>
        <u-dropdown-item label="Another item 2"/>
      </template>
    </u-dropdown>
  </template>

  <script>
    export default {
      data () {
        return {
          checked: true
        }
      }
    }
  </script>
  ```
</docs>
