<template>
    <a v-if="value" @click="downloadFile"
       class="ub-upload-document__a">
        <i class="el-icon-document"></i>
        {{this.currentValue.origName}}
    </a>
</template>

<script>
  module.exports = {
    name: 'UbUploadDocument',
    props: {
      value: [Object, String],
      docParams: Object
    },
    computed: {
      currentValue() {
        return typeof this.value === 'string' ? JSON.parse(this.value) : this.value
      }
    },
    methods: {
      downloadFile () {
        $App.connection.getDocument(this.docParams).then(function (result) {
          saveAs(new Blob([result]), this.currentValue.origName)
        }.bind(this))
      }
    }
  }
</script>

<style>
    .ub-upload-document__a {
        white-space: nowrap;
        cursor: pointer;
    }
</style>