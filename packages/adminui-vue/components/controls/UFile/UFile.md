### Basic usage
  ```vue
  <template>
    <u-file
      entity-name="req_Request"
      attribute-name="attachment"
      v-model="attachment"
    />
  </template>
  <script>
    const {mapInstanceFields} = require('@unitybase/adminui-vue')

    export default {
      computed: mapInstanceFields(['attachment'])
    }
  </script>
  ```

  ### Disabled
  ```vue
  <template>
    <u-file
      entity-name="req_Request"
      attribute-name="attachment"
      disabled
      v-model="attachment"
    />
  </template>
  <script>
    const {mapInstanceFields} = require('@unitybase/adminui-vue')

    export default {
      computed: mapInstanceFields(['attachment'])
    }
  </script>
  ```

  ### Preview mode
  ```vue
  <template>
    <u-file
      entity-name="req_Request"
      attribute-name="attachment"
      preview-mode
      v-model="attachment"
    />
  </template>
  <script>
    const {mapInstanceFields} = require('@unitybase/adminui-vue')

    export default {
      computed: mapInstanceFields(['attachment'])
    }
  </script>
  ```

  ### Preview mode with size
  ```vue
  <template>
    <u-file
      entity-name="req_Request"
      :preview-mode="{
        height: 400,
        width: 300
      }"
      attribute-name="attachment"
      v-model="attachment"
    />
  </template>
  <script>
    const {mapInstanceFields} = require('@unitybase/adminui-vue')

    export default {
      computed: mapInstanceFields(['attachment'])
    }
  </script>
  ```

  ### Custom additional button
  ```vue
  <template>
    <u-file
      entity-name="req_Request"
      v-model="attachment"
      attribute-name="attachment"
    >
      <u-button
        appearance="inverse"
        icon="u-icon-send"
      >
        Test
      </u-button>
    </u-file>
  </template>
  <script>
    const {mapInstanceFields} = require('@unitybase/adminui-vue')

    export default {
      computed: mapInstanceFields(['attachment'])
    }
  </script>
  ```

  ### Remove default buttons

  ```vue
  <template>
    <u-file
      entity-name="req_Request"
      v-model="attachment"
      attribute-name="attachment"
      remove-default-buttons
    />
  </template>
  <script>
    const {mapInstanceFields} = require('@unitybase/adminui-vue')

    export default {
      computed: mapInstanceFields(['attachment'])
    }
  </script>
  ```

  To remove one or few buttons pass array with buttons names
  Buttons names:
   - add
   - webcam
   - scan
   - scanSettings
   - download
   - remove
   - preview
   - fullscreen

  ```vue
  <template>
    <u-file
      entity-name="req_Request"
      v-model="attachment"
      attribute-name="attachment"
      :remove-default-buttons="['add', 'preview']"
    />
  </template>
  <script>
    const {mapInstanceFields} = require('@unitybase/adminui-vue')

    export default {
      computed: mapInstanceFields(['attachment'])
    }
  </script>
  ```
