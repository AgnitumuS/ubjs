<template>
  <div>
    <h1>UbSelect</h1>
    <ub-upload-document
      v-model="value"
      :doc-params="docParams"
      :i-frame-height="iFrameHeight"
      :i-frame-weight="iFrameWeight"
    ></ub-upload-document>
    <h2>Props</h2>
    <ul>
      <li>
        <span class="input-story__prop required">value - Object *</span>
        <el-input :disabled="true" type="textarea" :rows="6" style="width: 300px"
                  v-model="JSON.stringify(value, null, 2)"></el-input>
      </li>
      <li>
        <span class="input-story__prop required">docParams - Object *</span>
        <el-input :disabled="true" type="textarea" :rows="6" style="width: 300px"
                  v-model="JSON.stringify(docParams, null, 2)"></el-input>
      </li>
      <li>
        <span class="input-story__prop">iFrameHeight - String</span>
        <el-input style="width: 300px" v-model="iFrameHeight"></el-input>
      </li>
      <li>
        <span class="input-story__prop">iFrameWeight - String</span>
        <el-input style="width: 300px" v-model="iFrameWeight"></el-input>
      </li>
    </ul>
  </div>
</template>

<script>
import UbUploadDocument from '@unitybase/adminui-vue/components/controls/UbUploadDocument.vue'

export default {
  components: {
    UbUploadDocument
  },
  data () {
    return {
      value: null,
      docParams: { entity: 'tst_maindata', attribute: 'fileStoreSimple', ID: 332307333382255 },
      iFrameHeight: '650px',
      iFrameWeight: '100%'
    }
  }
}
</script>
