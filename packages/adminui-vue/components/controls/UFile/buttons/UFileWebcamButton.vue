<template>
  <div>
    <el-tooltip
      v-if="scanType !== 'optional'"
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
    <el-dropdown
      v-else
      @command="chooseScanType"
    >
      <span class="el-dropdown-link">
        <u-button
          color="primary"
          icon="u-icon-photo"
          appearance="inverse"
          :disabled="isDisabled"
        />
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="intoPicture">
          {{ $ut("UFile.webcam.intoPicture") }}
        </el-dropdown-item>
        <el-dropdown-item command="intoPdf">
          {{ $ut("UFile.webcam.intoPdf") }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      :fullscreen="fullScreen"
      @opened="openDialog"
      @closed="clearForm"
    >
      <div>
        <u-button
          class="u-file-webcam__full_screen_button"
          icon="u-icon-expand"
          appearance="inverse"
          :disabled="editing"
          @click="onExpand"
        />
      </div>
      <div
        v-if="error"
        class="u-file-webcam__error"
      >
        {{ error }}
      </div>

      <template v-else>
        <u-grid
          :template-columns="inPdf ? '1fr 200px' : '1fr'"
        >
          <div title="Camera">
            <u-crop
              v-if="editing"
              :img-src="previewImageSrc"
              @cropper-saved="cropperSaved"
              @cropper-cancelled="cropperCancelled"
            />
            <div style="text-align: center; ">
              <img
                v-show="isPictureTaken && !editing"
                class="u-file-webcam__img"
                style="width: auto; height: auto; max-height: 80vh; max-width: 100%"
                :src="previewImageSrc"
              >
            </div>
            <el-select
              v-model="videoRatio"
              class="u-file-webcam__el-select"
              :disabled="isPictureTaken"
              value-key="name"
              @change="changeResolution"
            >
              <el-option
                v-for="ratio in videoRatios"
                :key="ratio.name"
                :label="ratio.label"
                :value="ratio"
              />
            </el-select>
            <el-container
              style="width: 100%"
              v-show="!isPictureTaken"
              v-loading="!streamHasStarted"
            >
              <video
                ref="video"
                class="u-file-webcam__video"
                muted
                width="100%"
                autoplay
                playsinline
                @play.passive="onPlay"
              />
            </el-container>
          </div>
          <u-form-row v-if="inPdf">
            <el-scrollbar :wrap-style="'max-height: ' + pdfListHeight + 'px;'">
              <ul class="u-file-webcam__pdf_pages_list">
                <li
                  v-for="(page, index) in pages"
                  :key="index"
                  class="u-file-webcam__pdf_page"
                >
                  <div>
                    {{ index + 1 }}
                  </div>
                  <div>
                    <img :src="page.thumbNail">
                  </div>
                  <div
                    class="u-file-webcam__del_pdf_page_button"
                    @click="deletePdfPage(index)"
                  >
                    <u-icon
                      icon="u-icon-circle-close"
                    />
                  </div>
                </li>
              </ul>
            </el-scrollbar>
          </u-form-row>
        </u-grid>
        <div
          v-show="!editing"
          v-if="!inPdf"
          class="u-file-webcam__button-group"
        >
          <u-button
            color="primary"
            icon="u-icon-photo"
            appearance="plain"
            :disabled="!streamHasStarted"
            @click="takePicture"
          >
            {{ $ut( isPictureTaken ? "UFile.webcam.takeAnotherPictureButton" : "UFile.webcam.takePictureButton" ) }}
          </u-button>

          <u-button
            color="primary"
            icon="u-icon-edit"
            :disabled="!isPictureTaken"
            @click="edit"
          >
            {{ $ut("Edit") }}
          </u-button>

          <u-button
            color="primary"
            icon="u-icon-save"
            :disabled="!isPictureTaken"
            @click="save"
          >
            {{ $ut("Save") }}
          </u-button>
        </div>
        <div
          v-if="inPdf"
          v-show="!editing"
          class="u-file-webcam__button-group-to-pdf"
        >
          <u-button
            color="primary"
            icon="u-icon-photo"
            appearance="plain"
            :disabled="!streamHasStarted || exportingToPdf || addingPageToPdf"
            @click="takePicture"
          >
            {{ $ut( isPictureTaken ? "UFile.webcam.takeAnotherPictureButton" : "UFile.webcam.takePictureButton" ) }}
          </u-button>

          <u-button
            color="primary"
            icon="u-icon-edit"
            :disabled="!isPictureTaken || exportingToPdf || addingPageToPdf"
            @click="edit"
          >
            {{ $ut("Edit") }}
          </u-button>

          <u-button
            color="primary"
            icon="u-icon-file-add"
            :disabled="!isPictureTaken || exportingToPdf || addingPageToPdf"
            :loading="addingPageToPdf"
            @click="addPageToPdf"
          >
            {{ $ut("actionAdd") }}
          </u-button>

          <u-button
            color="primary"
            icon="u-icon-save"
            :disabled="pages.length === 0 || addingPageToPdf || exportingToPdf"
            :loading="exportingToPdf"
            @click="saveToPdf"
          >
            {{ $ut("Save") }}
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

  props: {

    // if you don't set this prop you will be get dropdown with choose working regime
    scanType: {
      type: String,
      default: 'optional',
      validator (value) {
        return ['optional', 'picture', 'pdf'].includes(value)
      }
    },
    startFullScreen: {
      type: Boolean,
      default: false,
      required: false
    }
  },

  data () {
    return {
      dialogVisible: false,
      previewImageSrc: null,
      canvas: null,
      error: null,
      videoRatios: [
        { name: 'low', label: this.$ut('UFile.webcam.lowResolution'), resolution: { width: 1280, height: 720 } },
        { name: 'fullHD', label: 'fullHD', resolution: { width: 1920, height: 1080 } },
        { name: '4К', label: '4К', resolution: { width: 3840, height: 2160 } }
      ],
      videoRatio: null,
      editing: false,
      streamHasStarted: false,
      croppedFile: null,
      exportingToPdf: false,
      takingPicture: false,
      addingPageToPdf: false,
      fullScreen: false,
      pdfListHeight: 340,
      workingRegime: '',
      pages: []
    }
  },

  computed: {
    isDisabled () {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        return this.instance.file || this.instance.disabled
      }

      return false
    },

    inPdf () {
      if (this.scanType === 'optional') {
        return this.workingRegime === 'pdf'
      } else {
        return this.scanType === 'pdf'
      }
    },

    inPicture () {
      if (this.scanType === 'optional') {
        return this.workingRegime === 'picture'
      } else {
        return this.scanType === 'picture'
      }
    },

    dialogTitle () {
      if (this.inPdf) {
        return 'Webcam ' + this.$ut('UFile.webcam.intoPdf')
      } else if (this.inPicture) {
        return 'Webcam ' + this.$ut('UFile.webcam.intoPicture')
      } else {
        return 'Webcam'
      }
    },

    isPictureTaken () {
      return this.previewImageSrc !== null
    }
  },

  mounted () {
    this.videoRatio = this.videoRatios[0]
    this.fullScreen = this.startFullScreen
  },

  methods: {
    chooseScanType (command) {
      if (command === 'intoPicture') {
        this.workingRegime = 'picture'
        this.dialogVisible = true
      }
      if (command === 'intoPdf') {
        this.workingRegime = 'pdf'
        this.dialogVisible = true
      }
    },

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

    stopStream () {
      const tracks = this.$refs.video.srcObject
      if (tracks !== null) {
        tracks.getTracks().forEach(track => (track.stop()))
        this.$refs.video.srcObject = null
      }
      this.streamHasStarted = false
    },

    createCanvas () {
      if (this.canvas === null) {
        this.canvas = document.createElement('canvas')
        this.canvas.width = this.videoRatio.resolution.width
        this.canvas.height = this.videoRatio.resolution.height
      }
    },

    changeResolution () {
      this.stopStream()
      this.startStream()
    },

    takePicture () {
      this.croppedFile = null
      if (!this.isPictureTaken) {
        // adjust canvas resolution to chosen option
        this.canvas.width = this.videoRatio.resolution.width
        this.canvas.height = this.videoRatio.resolution.height
        const context = this.canvas.getContext('2d')
        context.drawImage(
          this.$refs.video,
          0,
          0,
          this.videoRatio.resolution.width,
          this.videoRatio.resolution.height
        )
        this.previewImageSrc = this.canvas.toDataURL('image/png')
      } else {
        this.editing = false
        this.previewImageSrc = null
      }
    },

    cropperSaved (res) {
      this.previewImageSrc = res.croppedImageURI
      this.croppedFile = res.croppedFile
      this.editing = false
    },

    cropperCancelled () {
      this.editing = false
    },

    onPlay () {
      this.streamHasStarted = true
    },

    async addPageToPdf () {
      function toThumbDataUrl (blob) {
        return new Promise(resolve => {
          const canvasOrig = document.createElement('canvas')
          const canvas = document.createElement('canvas')
          const img = new Image()
          let width = 100; let height = 100
          img.onload = () => {
            const ratio = img.height / img.width
            if (img.width > 100) {
              height = width * ratio
            } else {
              width = img.width
              height = img.height
            }
            canvas.width = width
            canvas.height = height
            canvas.getContext('2d').drawImage(img, 0, 0, width, height)
            canvasOrig.width = img.width
            canvasOrig.height = img.height
            canvasOrig.getContext('2d').drawImage(img, 0, 0, img.width, img.height)
            URL.revokeObjectURL(img.src)
            resolve({
              img: {
                dataUrl: canvasOrig.toDataURL('image/png'),
                width: img.width,
                height: img.height
              },
              thumbNail: canvas.toDataURL('image/png')
            })
          }
          img.src = URL.createObjectURL(blob)
        })
      }
      this.addingPageToPdf = true
      if (!this.croppedFile) {
        this.canvas.toBlob(async blob => {
          const result = await toThumbDataUrl(blob)
          this.pages.push({
            img: result.img,
            thumbNail: result.thumbNail
          })
          this.addingPageToPdf = false
        }, 'image/png')
      } else {
        const result = await toThumbDataUrl(this.croppedFile)
        this.pages.push({
          img: result.img,
          thumbNail: result.thumbNail
        })
        this.addingPageToPdf = false
        this.editing = false
        this.previewImageSrc = null
      }
    },

    async saveToPdf () {
      if (this.pages === null || this.pages.length === 0) {
        return
      }
      this.exportingToPdf = true
      await this.$nextTick()
      System.import('@unitybase/pdf').then((PDF) => {
      // eslint-disable-next-line new-cap
        const pdf = new PDF.jsPDF()
        pdf.deletePage(1) // remove first redundant page
        this.pages.forEach(page => {
          let imgWidth, imgHeight
          let pdfPageHeight, pdfPageWidth
          let kWidth // mm / pixel coefficient
          const orientation = page.img.height / page.img.width > 1 ? 'p' : 'l'
          const imgRatio = page.img.height / page.img.width
          if (orientation === 'p') {
            pdfPageHeight = 1086
            pdfPageWidth = 758
            kWidth = 200 / pdfPageWidth // A4 width in mm minus left and right 5 margins / pixel coefficient
          } else {
            pdfPageHeight = 758
            pdfPageWidth = 1086
            kWidth = 287 / pdfPageWidth // A4 height in mm minus left and right 5 margins / pixel coefficient
          }
          if (page.img.width > pdfPageWidth) {
            imgWidth = pdfPageWidth
            imgHeight = imgWidth * imgRatio
            if (imgHeight > pdfPageHeight) {
              imgHeight = pdfPageHeight
              imgWidth = imgHeight / imgRatio
            }
          } else {
            imgWidth = page.img.width
            imgHeight = page.img.height
          }
          pdf.addPage('a4', orientation)
          pdf.addImage(page.img.dataUrl, 'PNG', 5,
            5,
            imgWidth * kWidth,
            imgHeight * kWidth
          )
        })
        const file = new File([pdf.output('arraybuffer')], `webcamPhoto_${new Date().getTime()}.pdf`)
        this.instance.upload([file])
        this.exportingToPdf = false
        this.previewImageSrc = null
        this.dialogVisible = false
      })
    },

    save () {
      this.canvas.toBlob(blob => {
        const file = new File(!this.croppedFile ? [blob] : [this.croppedFile], `webcamPhoto_${new Date().getTime()}.png`)
        this.instance.upload([file])
        this.previewImageSrc = null
        this.dialogVisible = false
      }, 'image/png')
    },

    edit () {
      this.editing = true
    },

    deletePdfPage (index) {
      this.pages.splice(index, 1)
    },

    async onExpand () {
      this.fullScreen = !this.fullScreen
      await this.$nextTick()
      if (this.$refs.video !== undefined && this.$refs.video.offsetHeight !== 0) {
        this.pdfListHeight = this.$refs.video.offsetHeight
      } else {
        this.pdfListHeight = 340
      }
    },

    clearForm () {
      this.stopStream()
      this.pages = []
      this.previewImageSrc = null
      this.canvas = null
      this.croppedFile = null
      this.error = null
    }
  }
}
</script>

<style>

  .u-file-webcam__pdf_pages_list{
    list-style-type: none;
    padding-left: 20px;
  }

  .u-file-webcam__pdf_page{
    display: flex;
    gap: 9px;
    align-items: center;
    margin-bottom: 5px;
  }

  .u-file-webcam__del_pdf_page_button{
    cursor: pointer;
  }

  .u-file-webcam__el-select{
    position: absolute;
    top: 14px;
    left: 220px;
  }

  .u-file-webcam__button-group {
    display: grid;
    grid-template-columns: repeat(3, auto);
    grid-gap: 8px;
    justify-content: flex-end;
    position: absolute;
    right: 10px;
    bottom: 10px;
  }

  .u-file-webcam__button-group-to-pdf{
    display: grid;
    grid-template-columns: repeat(4, auto);
    grid-gap: 8px;
    justify-content: flex-end;
    position: absolute;
    right: 10px;
    bottom: 10px;
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
  .u-file-webcam__full_screen_button{
    position: absolute;
    right: 50px;
    top: 10px;
  }
  .el-dialog__body{
    padding-bottom: 52px;
  }

  @media (max-width: 1110px) {
    .u-file-webcam__el-select{
      position: relative;
      top: 0;
      left: 0;
      margin-bottom: 5px;
    }
  }

</style>
