<template>
  <div class="u-form-layout">
    <u-form-container :label-width="250">
      <el-tabs>
        <el-tab-pane :label="$ut('desktopService.UBScan.tabScanning')">
          <u-form-row :label="$ut('desktopService.UBScan.LastUsedScanner')">
            <el-select
              v-model="selectedScanner"
            >
              <el-option
                v-for="{ value, label } in scanners"
                :key="value"
                :label="label"
                :value="value"
              />
            </el-select>

            <el-button
              type="primary"
              icon="u-icon-refresh"
              circle
              @click="getScanners"
            />
          </u-form-row>

          <u-form-row>
            <el-radio
              v-for="{ label } in scannerTypes" :key="label"
              v-model="scannerType"
              :label="label"
            >
              {{ label }}
            </el-radio>
          </u-form-row>

          <u-form-row :label="$ut('desktopService.UBScan.ShowUI')">
            <el-checkbox v-model="isDriverWindowShown" />
          </u-form-row>


          <u-form-row :label="$ut('desktopService.UBScan.CurrentScaner.PictureMode')">
            <el-select
              v-model="pictureMode"
            >
              <el-option
                v-for="{ value, label } in pictureModes" :key="value"
                :label="label"
                :value="value"
              />
            </el-select>
          </u-form-row>

          <u-form-row :label="$ut('desktopService.UBScan.CurrentScaner.Resolution')">
            <el-input-number
              v-model="dpiResolution"
              :min="200"
              :max="600"
              :step="100"
            />
          </u-form-row>

          <u-form-row :label="$ut('desktopService.UBScan.CurrentScaner.DuplexMode')">
            <el-checkbox v-model="isDuplexScanning" />
          </u-form-row>

          <u-form-row :label="$ut('desktopService.UBScan.CurrentScaner.AllowAddPages')">
            <el-checkbox v-model="isMultiplePages" />
          </u-form-row>

          <u-form-row :label="$ut('desktopService.UBScan.CurrentScaner.UseFeeder')">
            <el-checkbox v-model="isTrayUsed" />
          </u-form-row>

          <u-form-row :label="$ut('desktopService.UBScan.OutputFormat')">
            <el-radio
              v-for="{ label, value } in outputFormats" :key="value"
              v-model="outputFormat"
              :label="value"
            >
              {{ label }}
            </el-radio>
          </u-form-row>

          <u-form-row :label="$ut('desktopService.UBScan.jpegQuality')">
            <el-input-number
              v-model="jpegQuality"
              :min="10"
              :max="100"
              :step="5"
            />
          </u-form-row>
        </el-tab-pane>

        <el-tab-pane :label="$ut('desktopService.tabBarcode')">
          <h4>
            {{ $ut('desktopService.FRScan.tabFineReader.Common') }}
          </h4>
          <u-form-row :label="$ut('desktopService.BarcodeSettings.PrinterName')">
            <el-select
              v-model="selectedPrinter"
            >
              <el-option
                v-for="{ value, label } in printers"
                :key="value"
                :label="label"
                :value="value"
              />
            </el-select>
          </u-form-row>

          <u-form-row :label="$ut('desktopService.BarcodeSettings.Rotate180')">
            <el-checkbox v-model="isBarcodeRotated" />
          </u-form-row>

          <u-form-row :label="$ut('desktopService.BarcodeSettings.pagePosition')">
            <el-select
              v-model="pagePosition"
              @change="pagePositionChange"
            >
              <el-option
                v-for="{ value, label } in pagePositions" :key="value"
                :label="label"
                :value="value"
              />
            </el-select>
          </u-form-row>

          <h4>
            {{ $ut('desktopService.tabBarcode.Margins') }}
          </h4>
          <u-form-row
            v-for="({ label, value, disabled }, i) in pageMargins" :key="label"
            :label="label"
          >
            <el-input-number
              :value="value"
              :min="0"
              :max="100"
              :disabled="disabled.includes(pagePosition)"
              @change="(val) => pageMargins[i].value = val"
            />
          </u-form-row>
        </el-tab-pane>
      </el-tabs>
    </u-form-container>
    <span slot="footer" class="el-dialog__footer">
      <el-button
        @click="saveClick"
      >
        {{ $ut('Change') }}
      </el-button>
      <el-button
        type="primary"
        @click="closeClick"
      >
        {{ $ut('cancel') }}
      </el-button>
    </span>
  </div>
</template>

<script>
const { Form } = require('@unitybase/adminui-vue')

module.exports.mount = function (cfg) {
  const props = {}
  props.customParams = cfg.customParams
  props.deferred = cfg.deferred
  Form({
    ...cfg,
    props,
    isModal: true,
    modalWidth: '700px'
  })
    .mount()
}

module.exports.default = {
  name: 'UbmDesktopScanerSettings',
  inject: ['$formServices'],

  props: {
    customParams: undefined,
    deferred: Object
  },

  mounted () {
    this.initData()
  },

  data () {
    return {
      isDeferred: false,

      selectedScanner: null,
      scanners: [],

      scannerType: 'Streaming',
      scannerTypes: [
        { label: this.$ut('desktopService.UBScan.CurrentScaner.MultiplePages.true') },
        { label: this.$ut('desktopService.UBScan.CurrentScaner.MultiplePages.false') }
      ],

      isDriverWindowShown: false,

      pictureMode: null,
      pictureModes: [
        { label: this.$ut('desktopService.BlackAndWhite'), value: 'SPM_BlackAndWhite' },
        { label: this.$ut('desktopService.Grayscale'), value: 'SPM_Grayscale' },
        { label: this.$ut('desktopService.Color'), value: 'SPM_Color' }
      ],

      dpiResolution: 300,
      isDuplexScanning: false,
      isMultiplePages: false,
      isTrayUsed: false,

      outputFormat: 'PDF',
      outputFormats: [
        { label: this.$ut('desktopService.UBScan.OutputFormat.JPEG'), value: 'JPEG' },
        { label: this.$ut('desktopService.UBScan.OutputFormat.PDF'), value: 'PDF' },
        { label: this.$ut('desktopService.UBScan.OutputFormat.TIFF'), value: 'TIFF' },
        { label: this.$ut('desktopService.UBScan.OutputFormat.PDF/A'), value: 'PDF/A' }
      ],

      jpegQuality: 70,

      selectedPrinter: this.$ut('desktopService.DefaultPrinter'),
      printers: [],

      isBarcodeRotated: false,

      pagePosition: 'bcppBottomRight',
      pagePositions: [
        { label: this.$ut('desktopService.TopLeft'), value: 'bcppTopLeft' },
        { label: this.$ut('desktopService.TopCenter'), value: 'bcppTopCenter' },
        { label: this.$ut('desktopService.TopRight'), value: 'bcppTopRight' },
        { label: this.$ut('desktopService.BottomLeft'), value: 'bcppBottomLeft' },
        { label: this.$ut('desktopService.BottomCenter'), value: 'bcppBottomCenter' },
        { label: this.$ut('desktopService.BottomRight'), value: 'bcppBottomRight' }
      ],

      pageMargins: [{
        key: 'LeftMargin',
        label: this.$ut('desktopService.BarcodeSettings.LeftMargin'),
        value: 5,
        disabled: [
          'bcppTopCenter',
          'bcppTopRight',
          'bcppBottomCenter',
          'bcppBottomRight'
        ]
      }, {
        key: 'TopMargin',
        label: this.$ut('desktopService.BarcodeSettings.TopMargin'),
        value: 5,
        disabled: [
          'bcppBottomLeft',
          'bcppBottomCenter',
          'bcppBottomRight'
        ]
      }, {
        key: 'RightMargin',
        label: this.$ut('desktopService.BarcodeSettings.RightMargin'),
        value: 5,
        disabled: [
          'bcppTopLeft',
          'bcppTopCenter',
          'bcppBottomLeft',
          'bcppBottomCenter'
        ]
      }, {
        key: 'BottomMargin',
        label: this.$ut('desktopService.BarcodeSettings.BottomMargin'),
        value: 5,
        disabled: [
          'bcppTopLeft',
          'bcppTopCenter',
          'bcppTopRight'
        ]
      }]
    }
  },

  created () {
    this.getScanners()
    this.getPrinters()
  },

  methods: {
    initData (){
      if (this.customParams.BarcodeSettings.UseDefaultPrinter)
        this.selectedPrinter = this.$ut('desktopService.DefaultPrinter')
      this.selectedPrinter = this.customParams.BarcodeSettings.PrinterName
      this.isBarcodeRotated = this.customParams.BarcodeSettings.Rotate180
      this.pagePosition = this.customParams.BarcodeSettings.pagePosition
      this.pageMargins.forEach((attr) => {
        attr.value = this.customParams.BarcodeSettings[attr.key]
      })

      this.isDriverWindowShown = this.customParams.UBScan.ShowUI
      this.outputFormat = this.customParams.UBScan.OutputFormat
      this.jpegQuality = this.customParams.UBScan.jpegQuality

      if(this.customParams.LastUsedScanner){
        this.selectedScanner = this.customParams.LastUsedScanner
        let scannerParam = _.find(this.customParams.UBScan.ScanSettings, {Source: this.selectedScanner})
        this.pictureMode = scannerParam.PictureMode
        this.dpiResolution = scannerParam.Resolution
        this.isDuplexScanning = scannerParam.DuplexMode
        this.isMultiplePages = scannerParam.AllowAddPages
        this.isTrayUsed = scannerParam.UseFeeder
      }
    },

    async getScanners () {
      const service = await $App.scanService()
      const scanners = await service.getScanners()
      if (scanners) {
        this.scanners = [
          ...scanners.map(scannerName => ({ label: scannerName, value: scannerName }))
        ]
      }
    },

    async getPrinters () {
      const service = await $App.scanService()
      const printers = await service.getPrinters()

      if (printers) {
        this.printers = [
          ...[{
            label: this.$ut('desktopService.DefaultPrinter'),
            value: this.$ut('desktopService.DefaultPrinter')
          }],
          ...printers.map(printerName => ({ label: printerName, value: printerName }))
        ]
      }
    },

    pagePositionChange () {
      this.pageMargins = this.pageMargins.reduce((accum, margin) => {
        /*if (margin.disabled.includes(this.pagePosition)) {
          margin.value = 5
        }*/
        accum.push(margin)
        return accum
      }, [])
    },

    saveScanner() {
      if (this.selectedScanner){
        let scannerParam = _.find(this.customParams.UBScan.ScanSettings, {Source: this.selectedScanner})
        scannerParam.PictureMode = this.pictureMode
        scannerParam.Resolution = this.dpiResolution
        scannerParam.DuplexMode = this.isDuplexScanning
        scannerParam.AllowAddPages = this.isMultiplePages
        scannerParam.UseFeeder = this.isTrayUsed
      }
    },

    saveParams() {
      this.saveScanner()

      this.customParams.BarcodeSettings.PrinterName = this.selectedPrinter
      this.customParams.BarcodeSettings.Rotate180 = this.isBarcodeRotated
      this.customParams.BarcodeSettings.pagePosition = this.pagePosition
      this.pageMargins.forEach((attr) => {
        this.customParams.BarcodeSettings[attr.key] = attr.value
      })

      this.customParams.UBScan.ShowUI = this.isDriverWindowShown
      this.customParams.UBScan.OutputFormat = this.outputFormat
      this.customParams.UBScan.jpegQuality = this.jpegQuality

      this.customParams.BarcodeSettings.UseDefaultPrinter = (this.selectedPrinter == this.$ut(
        'desktopService.DefaultPrinter'));
    },

    saveClick() {
      this.saveParams()
      this.isDeferred = true

      this.$props.deferred.resolve({
        action: 'ok',
        params: this.customParams
      })
      this.$formServices.forceClose()
    },

    closeClick(){
      this.$props.deferred.resolve({
        action: 'cancel'
      })
      this.$formServices.forceClose()
    }

  }

}
</script>
