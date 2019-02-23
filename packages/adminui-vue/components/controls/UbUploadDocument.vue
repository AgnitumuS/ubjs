<template>
  <div v-loading="loading">
    <div v-if="value">
      <el-dialog :title="currentValue.origName" :visible.sync="dialogVisible" class="ub-upload-document__dialog"
                 @closed="removeUrl">
        <iframe :height="iFrameHeight" :width="iFrameWeight" type="application/pdf" :src="documentURL"></iframe>
      </el-dialog>
      <a @click="downloadFile"
         class="ub-upload-document__a">
        <i class="el-icon-document"></i>
        {{this.currentValue.origName}}
      </a>
      <el-button class="el-icon-circle-close-outline"
                 @click="remove"
                 style="border: none"
                 size="mini"
                 circle
      ></el-button>
    </div>
    <div v-else class="ub-upload-document__file-input">
      <el-button class="el-icon-plus" size="mini" circle></el-button>
      <input type="file" @change="processFile($event)"/>
    </div>
  </div>
</template>

<script>
  module.exports = {
    name: 'UbUploadDocument',
    props: {
      value: [Object, String],
      docParams: Object,
      inputFile: null,
      iFrameHeight: {
        type: String,
        default () {
          return '650px'
        }
      },
      iFrameWeight: {
        type: String,
        default () {
          return '100%'
        }
      }
    },
    computed: {
      currentValue () {
        return typeof this.value === 'string' ? JSON.parse(this.value) : this.value
      }
    },
    data () {
      return {
        documentURL: null,
        dialogVisible: false,
        loading: false
      }
    },
    methods: {
      processFile () {
        this.loading = true
        let file = arguments[0].target.files[0]
        let params = {
          entity: this.docParams.entity,
          attribute: this.docParams.attribute,
          origName: file.name,
          filename: file.name,
          id: this.docParams.ID
        }
        UB.connection.post('setDocument', file, {
          params: params,
          headers: {'Content-Type': 'application/octet-stream'}
        }).then(function (response) {
          this.$emit('input', JSON.stringify(response.data.result))
        }.bind(this)).finally(function () {
          this.loading = false
        }.bind(this))
      },
      downloadFile () {
        this.loading = true
        $App.connection.getDocument(this.docParams, {
          resultIsBinary: true
        }).then(function (result) {
          let nameArray = this.currentValue.origName.split('.')
          let extension = nameArray[nameArray.length - 1]
          if (extension === 'pdf') {
            this.documentURL = window.URL.createObjectURL(new Blob([result], {type: 'application/pdf'}))
            this.dialogVisible = true
          } else {
            saveAs(new Blob([result]), this.currentValue.origName)
          }
        }.bind(this)).finally(function () {
          this.loading = false
        }.bind(this))
      },
      removeUrl () {
        window.URL.revokeObjectURL(this.documentURL)
      },
      remove () {
        this.$emit('input', null)
      }
    }
  }
</script>

<style>
  .ub-upload-document__a {
    white-space: nowrap;
    cursor: pointer;
  }

  .ub-upload-document__file-input input[type=file] {
    font-size: 100px;
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;
  }

  .ub-upload-document__file-input {
    position: relative;
    overflow: hidden;
    display: inline-block;
  }
</style>