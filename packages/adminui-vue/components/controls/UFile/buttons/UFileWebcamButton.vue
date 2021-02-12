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
      title="Webcam to"
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
        <u-grid v-bind:columns = "inPdf ? 2 : 1">
          <u-form-row>
            <u-crop
              v-if="editing"
              v-bind:img-src="previewImageSrc"
              @cropper-saved="cropperSaved"
              @cropper-cancelled="cropperCancelled"
            >
            </u-crop>
            <div style="text-align: center">
            <img class="u-file-webcam__img"
              style="max-width: 100%; height: auto;"
              v-show="previewImageSrc && !editing"
              :src="previewImageSrc"
            >
            </div>
            <div v-show="!previewImageSrc">
              <el-select class="u-file-webcam__el-select"
                v-model="videoRatio"
                value-key="name"
                @change="changeResolution"
              >
                <el-option
                  v-for="ratio in videoRatios"
                  :key="ratio.name"
                  :label="ratio.label"
                  :value="ratio"
                >
                </el-option>
              </el-select>
            <div class="u-file-webcam__load-video"
                 v-show="!streamHasStarted">
              <u-icon
                icon="u-icon-refresh"
                size="large"
              />
              <span>
                {{ $ut('loadingData') }}
              </span>
            </div>
            <video class="u-file-webcam__video"
              ref="video"
              muted
              width="100%"
              autoplay
              playsinline
              v-on:play.passive="onPlay"
            />

            </div>
          </u-form-row>
          <u-form-row v-if="inPdf">
            <ul
              v-for="(page, index) in pages"
             >
              <li>
                {{index}} <img v-bind:src="page.thumbNail">
              </li>
            </ul>
          </u-form-row>
        </u-grid>
        <div class="u-file-webcam__button-group" v-show="!editing" v-if="!inPdf">
          <u-button
            color="primary"
            icon="u-icon-photo"
            appearance="plain"
            :disabled="!streamHasStarted"
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
        <div class="u-file-webcam__button-group-to-pdf" v-if="inPdf" v-show="!editing">
          <u-button
            color="primary"
            icon="u-icon-photo"
            appearance="plain"
            :disabled="!streamHasStarted"
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
            icon="u-file-add"
            :disabled="!previewImageSrc"
            @click="addPageToPdf"
          >
            Add page
          </u-button>

          <u-button
            color="primary"
            icon="u-file-pdf"
            @click="saveToPdf"
          >
            {{ $ut('SaveToPdf') }}
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
      streamHasStarted: false,
      croppedFile: null,
      pages: [],
    }
  },

  props:{
    scanType: {
      type: String,
      default: "PDF",
      //required: true
    }
  },
  computed: {
    isDisabled () {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        return this.instance.file || this.instance.disabled
      }

      return false
    },
    inPdf(){
      if (this.scanType === "PDF"){
        return true;
      }else{
        return false;
      }
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
    stopStream() {
      let tracks = this.$refs.video.srcObject
      if (tracks !== null) {
        tracks.getTracks().forEach(track => (track.stop()))
        this.$refs.video.srcObject = null
      }
      this.streamHasStarted = false;
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
    changeResolution(){
      this.stopStream();
      this.startStream();
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
    onPlay(){
      this.streamHasStarted = true;
    },
    addPageToPdf(){
      function toThumbDataUrl(blob){
          return new Promise(resolve => {
            const canvasOrig = document.createElement("canvas");
            const canvas = document.createElement("canvas");
            let img = new Image()
            let width = 100, height = 100
            img.onload = function(){
              let ratio = img.height / img.width;
              if (img.width > 100) {
                 height = width * ratio
              }else{
                 width = img.width;
                 height = img.height;
              }
              canvas.width = width;
              canvas.height = height;
              canvas.getContext("2d").drawImage(img, 0, 0, width, height);
              canvasOrig.width = img.width;
              canvasOrig.height = img.height;
              canvasOrig.getContext("2d").drawImage(img, 0, 0, img.width, img.height);
              resolve({img: {
                                   dataUrl: canvasOrig.toDataURL("image/png"),
                                   width: img.width,
                                   height: img.height
                                  },
                                  thumbNail:canvas.toDataURL("image/png")})
            }
            img.src = URL.createObjectURL(blob);
        })
      }
      if (!this.croppedFile){
        this.canvas.toBlob(blob => {
          toThumbDataUrl(blob)
            .then(result =>
              this.pages.push({
                "img": result.img,
                "thumbNail": result.thumbNail
              })
            )
        }, 'image/png')
      }else{
        toThumbDataUrl(this.croppedFile)
          .then(result =>
            this.pages.push({
              "img": result.img,
              "thumbNail": result.thumbNail
            })
          )
      }
      this.editing = false;
      this.previewImageSrc = null;
      this.startStream();
    },
    saveToPdf(){
      if (this.pages === null || this.pages.length === 0) {
        return
      }
      const PDF = require('@unitybase/pdf')
      const pdf = new PDF.jsPDF()
      pdf.deletePage(1) //remove first redundant page
      this.pages.forEach(page => {
        let imgWidth, imgHeight
        let pdfPageHeight, pdfPageWidth
        let kWidth //mm / pixel coefficient
        let orientation = page.img.height / page.img.width > 1 ? "p" : "l"
        let imgRatio = page.img.height / page.img.width;
        if (orientation === "p") {
           pdfPageHeight = 1086
           pdfPageWidth = 758
           kWidth = 200 / pdfPageWidth // A4 width in mm minus left and right 5 margins / pixel coefficient
        }else{
           pdfPageHeight = 758
           pdfPageWidth = 1086
           kWidth = 287 / pdfPageWidth // A4 height in mm minus left and right 5 margins / pixel coefficient
        }
        if (page.img.width > pdfPageWidth) {
          imgWidth = pdfPageWidth;
          imgHeight = imgWidth * imgRatio
          if (imgHeight > pdfPageHeight) {
            imgHeight = pdfPageHeight
            imgWidth = imgHeight / imgRatio
          }
        }else{
          imgWidth = page.img.width;
          imgHeight = page.img.height;
        }
        pdf.addPage('a4', orientation)
        pdf.addImage(page.img.dataUrl, "PNG", 5,
          5,
          imgWidth * kWidth,
          imgHeight * kWidth
        )
      })
      const file = new File([pdf.output('arraybuffer')], `webcamPhoto_${new Date().getTime()}.pdf`)
      this.instance.upload([file])
      this.previewImageSrc = null
      this.dialogVisible = false
    },
    save () {
        if (!this.croppedFile){
          this.canvas.toBlob(blob => {
            const file = new File([blob], `webcamPhoto_${new Date().getTime()}.png`)
          }, 'image/png')
        }else{
          const file = new File([this.croppedFile], `webcamPhoto_${new Date().getTime()}.png`)
        }
        this.instance.upload([file])
        this.previewImageSrc = null
        this.dialogVisible = false
    },
    edit () {
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

  .u-file-webcam__img{
     margin-bottom: 5px;
  }

  .u-file-webcam__video{
    margin-bottom: 5px;
  }

  .u-file-webcam__el-select{
    margin-bottom: 5px;
  }

  .u-file-webcam__button-group {
    display: grid;
    grid-template-columns: repeat(3, auto);
    grid-gap: 8px;
    justify-content: flex-end;
  }

  .u-file-webcam__button-group-to-pdf{
    display: grid;
    grid-template-columns: repeat(4, auto);
    grid-gap: 8px;
    justify-content: flex-end;
  }

  .u-file-webcam__empty-picture span {
    margin-top: 8px;
  }

  .u-file-webcam__load-video {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    justify-content: center;
    height: 100%;
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
