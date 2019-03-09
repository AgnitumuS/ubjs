<template>
  <div>
    <h1>UbUploadDocument</h1>
    <ub-upload-document
      v-model="value"
      :doc-params="docParams"
      :i-frame-height="iFrameHeight"
      :i-frame-weight="iFrameWeight"
      @input="inputFn"
    ></ub-upload-document>
    <br>
    <el-checkbox v-model="loadPdf">Try PDF</el-checkbox>
    <h2>Props</h2>
    <ul>
      <li>
        <span class="input-story__prop required">value - Object *</span>
        <el-input :disabled="true" type="textarea" :rows="6" style="width: 300px"
                  v-model="value"></el-input>
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
import { action } from '@storybook/addon-actions'

export default {
  components: {
    UbUploadDocument
  },
  watch: {
    loadPdf (val) {
      if (this.value) {
        let obj = JSON.parse(this.value)
        obj.fName = val ? 'test.pdf' : 'test.txt'
        obj.origName = val ? 'test.pdf' : 'test.txt'
        this.value = JSON.stringify(obj)
      }
    },
    value (val) {
      if (val) {
        let obj = JSON.parse(val)
        obj.fName = this.loadPdf ? 'test.pdf' : 'test.txt'
        obj.origName = this.loadPdf ? 'test.pdf' : 'test.txt'
        this.value = JSON.stringify(obj)
      }
    }
  },
  methods: {
    inputFn: action('Entered value')
  },
  data () {
    return {
      value: null,
      docParams: { entity: 'tst_maindata', attribute: 'fileStoreSimple', ID: 332307333382255 },
      iFrameHeight: '650px',
      iFrameWeight: '100%',
      loadPdf: false
    }
  }
}
</script>
