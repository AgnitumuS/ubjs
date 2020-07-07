<template>
  <div>
    <el-tooltip
      :content="$ut('UFile.webcamButtonTooltip')"
      :enterable="false"
    >
      <u-button
        icon="u-icon-photo"
        appearance="inverse"
        :disabled="isDisabled"
        @click="dialogVisible = true"
      />
    </el-tooltip>

    <el-dialog
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
        <u-grid label-position="top">
          <u-form-row label="UFile.webcam.webcamLabel">
            <video
              ref="video"
              muted
              width="100%"
              autoplay
              playsinline
            />
          </u-form-row>
          <u-form-row label="UFile.webcam.pictureLabel">
            <img
              v-if="previewImageSrc"
              width="100%"
              :src="previewImageSrc"
            >
            <div
              v-else
              class="u-file-webcam__empty-picture"
            >
              <u-icon
                icon="u-icon-photo"
                size="large"
              />
              <span>
                {{ $ut('UFile.webcam.emptyPicturePlaceholder') }}
              </span>
            </div>
          </u-form-row>
        </u-grid>

        <div class="u-file-webcam__button-group">
          <u-button
            icon="u-icon-photo"
            appearance="plain"
            @click="takePicture"
          >
            {{ $ut( previewImageSrc ? 'UFile.webcam.takeAnotherPictureButton' : 'UFile.webcam.takePictureButton' ) }}
          </u-button>

          <u-button
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
      videoRatio: { width: 1280, height: 720 }
    }
  },

  computed: {
    isDisabled () {
      return !('getUserMedia' in navigator) || this.instance.file || this.instance.disabled
    }
  },

  methods: {
    openDialog () {
      this.createCanvas()
      this.startStream()
    },

    startStream () {
      this.error = null
      navigator.mediaDevices.getUserMedia({ video: this.videoRatio, audio: false })
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
        this.canvas.width = this.videoRatio.width
        this.canvas.height = this.videoRatio.height
      }
    },

    takePicture () {
      const context = this.canvas.getContext('2d')
      context.drawImage(
        this.$refs.video,
        0,
        0,
        this.videoRatio.width,
        this.videoRatio.height
      )
      this.previewImageSrc = this.canvas.toDataURL('image/png')
    },

    save () {
      this.canvas.toBlob(blob => {
        const file = new File([blob], `webcamPhoto_${new Date().getTime()}.png`)
        this.instance.upload([file])
        this.previewImageSrc = null
        this.dialogVisible = false
      }, 'image/png')
    },

    clearForm () {
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
    grid-template-columns: repeat(2, auto);
    grid-gap: 8px;
    justify-content: flex-end;
  }

  .u-file-webcam__empty-picture {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    justify-content: center;
    border: 1px dashed hsl(var(--hs-border), var(--l-layout-border-default));
    border-radius: var(--border-radius);
    height: 100%;
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
