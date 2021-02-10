<template>
  <div>
    <el-tooltip
      :content="$ut('UFile.webcamButtonTooltip')"
      :enterable="false"
    >
      <u-button
        color="primary"
        icon="u-icon-photo"
        appearance="inverse"
        :disabled="isDisabled"
        @click="dialogVisible = true"
      />
    </el-tooltip>

    <el-dialog
      title="Webcam"
      :visible.sync="dialogVisible"
      @opened="openDialog"
      @closed="clearForm"
    >
      <div
        v-if="error"
        class="u-file-webcam__error"
      >
        {{ error }}
      </div>

      <template v-else>

            <u-crop
              v-if="editing"
              v-bind:img-src="previewImageSrc"
              @cropper-saved="cropperSaved"
              @cropper-cancelled="cropperCancelled"
            >
            </u-crop>
            <div style="text-align: center">
            <img
              style="max-width: 100%; height: auto;"
              v-show="previewImageSrc && !editing"
              :src="previewImageSrc"
            >
            </div>
            <div v-show="!previewImageSrc">
              <el-select
                v-model="videoRatio"
                value-key="name"
              >
                <el-option
                  v-for="ratio in videoRatios"
                  :key="ratio.name"
                  :label="ratio.label"
                  :value="ratio"
                >
                </el-option>
              </el-select>
            <video
              ref="video"
              muted
              width="100%"
              autoplay
              playsinline
            />
            </div>

        <div class="u-file-webcam__button-group" v-show="!editing">
          <u-button
            color="primary"
            icon="u-icon-photo"
            appearance="plain"
            @click="takePicture"
          >
            {{ $ut( previewImageSrc ? 'UFile.webcam.takeAnotherPictureButton' : 'UFile.webcam.takePictureButton' ) }}
          </u-button>

          <u-button
            color="primary"
            icon="u-icon-edit"
            :disabled="!previewImageSrc"
            @click="edit"
          >
            {{ $ut('Edit') }}
          </u-button>

          <u-button
            color="primary"
            icon="u-icon-save"
            :disabled="!previewImageSrc"
            @click="save"
          >
            {{ $ut('Save') }}
          </u-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'UFileWebcamButton',
  inject: {
    instance: 'fileComponentInstance'
  },

  data () {
    return {
      dialogVisible: false,
      previewImageSrc: null,
      canvas: null,
      error: null,
      videoRatios: [
        {name: "low", label: "низкое", resolution:{ width: 1280, height: 720 }},
        {name: "fullHD", label: "fullHD", resolution:{ width: 1920, height: 1080}},
        {name: "4К", label: "4К", resolution:{ width: 3840, height: 2160}},
      ],
      videoRatio: null,
      editing: false,
      croppedFile: null
    }
  },

  computed: {
    isDisabled () {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        return this.instance.file || this.instance.disabled
      }

      return false
    }
  },
  mounted () {
    this.videoRatio = this.videoRatios[0];
  },
  methods: {
    openDialog () {
      this.startStream()
      this.createCanvas()
      this.editing = false
    },

    startStream () {
      this.error = null
      navigator.mediaDevices.getUserMedia({ video: this.videoRatio.resolution, audio: false })
        .then(stream => {
          this.error = null
          this.$refs.video.srcObject = stream
        })
        .catch((err) => {
          this.error = this.$ut(`UFile.webcam.error.${err.name}`)
          console.log(err)
        })
    },
    createCanvas () {
      if (this.canvas === null) {
        this.canvas = document.createElement('canvas')
        this.canvas.width = this.videoRatio.resolution.width
        this.canvas.height = this.videoRatio.resolution.height
      }
    },
    checkResolution() {
      if (this.canvas !== null &
        (this.canvas.width !== this.videoRatio.resolution.width ||
        this.canvas.height !== this.videoRatio.resolution.height)) {
        this.canvas.width = this.videoRatio.resolution.width
        this.canvas.height = this.videoRatio.resolution.height
      }
    },
    takePicture () {
      this.croppedFile = null;
      if (this.previewImageSrc === null){
        this.checkResolution();
        const context = this.canvas.getContext('2d')
        context.drawImage(
          this.$refs.video,
          0,
          0,
          this.videoRatio.resolution.width,
          this.videoRatio.resolution.height
        )
        this.previewImageSrc = this.canvas.toDataURL('image/png')
        this.stopStream()
      }else{
        this.editing = false;
        this.previewImageSrc = null;
        this.startStream();
      }
    },
    cropperSaved(res){
      this.previewImageSrc = res.croppedImageURI;
      this.croppedFile = res.croppedFile;
      this.editing = false;
    },
    cropperCancelled(){
      this.editing = false;
    },
    save () {
      if (!this.croppedFile){
        this.canvas.toBlob(blob => {
          const file = new File([blob], `webcamPhoto_${new Date().getTime()}.png`)
          this.instance.upload([file])
          this.previewImageSrc = null
          this.dialogVisible = false
        }, 'image/png')
      }else{
        const file = new File([this.croppedFile], `webcamPhoto_${new Date().getTime()}.png`)
        this.instance.upload([file])
        this.previewImageSrc = null
        this.dialogVisible = false
      }
    },
    stopStream() {
      let tracks = this.$refs.video.srcObject
      if (tracks !== null) {
        tracks.getTracks().forEach(track => (track.stop()))
        this.$refs.video.srcObject = null
      }
    },
    edit () {
      //this.previewImageSrc = null
      this.editing = true;
    },
    clearForm () {
      this.stopStream()
      this.previewImageSrc = null
      this.canvas = null
      this.error = null
    }
  }
}
</script>

<style>
  .u-file-webcam__button-group {
    display: grid;
    grid-template-columns: repeat(3, auto);
    grid-gap: 8px;
    justify-content: flex-end;
  }

  .u-file-webcam__empty-picture span {
    margin-top: 8px;
  }

  .u-file-webcam__error {
    font-size: 16px;
    color: hsl(var(--hs-danger), var(--l-state-default));
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
