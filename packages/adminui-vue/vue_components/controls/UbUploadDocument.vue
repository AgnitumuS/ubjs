<template>
    <div>
        <div v-if="value">
            <a @click="downloadFile"
               class="ub-upload-document__a">
                <i class="el-icon-document"></i>
                {{this.currentValue.origName}}
            </a>
            <el-button class="el-icon-circle-close-outline" @click="remove" style="border: none" size="mini" circle></el-button>
        </div>
        <el-input v-else type="file"></el-input>
        <!--<el-button v-else class="el-icon-plus" @click="addFile" size="mini" circle></el-button>-->
    </div>
</template>

<script>
  module.exports = {
    name: 'UbUploadDocument',
    props: {
      value: [Object, String],
      docParams: Object
    },
    computed: {
      currentValue () {
        return typeof this.value === 'string' ? JSON.parse(this.value) : this.value
      }
    },
    methods: {
      downloadFile () {
        $App.connection.getDocument(this.docParams).then(function (result) {
          saveAs(new Blob([result]), this.currentValue.origName)
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
</style>