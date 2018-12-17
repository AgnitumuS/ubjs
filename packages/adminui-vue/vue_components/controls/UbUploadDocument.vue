<template>
    <div v-loading="loading">
        <div v-if="value">
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
      inputFile: null
    },
    computed: {
      currentValue () {
        return typeof this.value === 'string' ? JSON.parse(this.value) : this.value
      }
    },
    data () {
      return {
        loading: false
      }
    },
    methods: {
      processFile () {
        debugger
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
        $App.connection.getDocument(this.docParams).then(function (result) {
          saveAs(new Blob([result]), this.currentValue.origName)
        }.bind(this)).finally(function () {
          this.loading = false
        }.bind(this))
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