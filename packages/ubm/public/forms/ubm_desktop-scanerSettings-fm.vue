<template>
  <div class="u-form-layout">
    <u-form-container :label-width="250">
      <el-tabs>
        <el-tab-pane label="Scanning">
          <u-form-row :label="$ut('Scanner')">
            <el-select
              v-model="selectedScanner"
              placeholder="Choose scanner"
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

          <u-form-row :label="$ut('ScannerType')">
            <el-radio
              v-for="{ label } in scannerTypes" :key="label"
              v-model="scannerType"
              :label="label"
            >
              {{ label }}
            </el-radio>
          </u-form-row>

          <u-form-row :label="$ut('Show scanner driver window')">
            <el-checkbox v-model="isDriverWindowShown" />
          </u-form-row>


          <u-form-row :label="$ut('Picture mode')">
            <el-select
              v-model="pictureMode"
              placeholder="Choose picture mode"
            >
              <el-option
                v-for="{ value, label } in pictureModes" :key="value"
                :label="label"
                :value="value"
              />
            </el-select>
          </u-form-row>

          <u-form-row :label="$ut('Resolution in DPI')">
            <el-input-number
              v-model="dpiResolution"
              :min="200"
              :max="600"
              :step="100"
            />
          </u-form-row>

          <u-form-row :label="$ut('Duplex scanning')">
            <el-checkbox v-model="isDuplexScanning" />
          </u-form-row>

          <u-form-row :label="$ut('Multiple pages')">
            <el-checkbox v-model="isMultiplePages" />
          </u-form-row>

          <u-form-row :label="$ut('Use tray')">
            <el-checkbox v-model="isTrayUsed" />
          </u-form-row>

          <u-form-row :label="$ut('File format')">
            <el-radio
              v-for="{ label, value } in outputFormats" :key="value"
              v-model="outputFormat"
              :label="value"
            >
              {{ label }}
            </el-radio>
          </u-form-row>

          <u-form-row :label="$ut('JPEG quality')">
            <el-input-number
              v-model="jpegQuality"
              :min="10"
              :max="100"
              :step="5"
            />
          </u-form-row>
        </el-tab-pane>

        <el-tab-pane label="Bar code">
          <u-form-row :label="$ut('Printer')">
            <el-select
              v-model="selectedPrinter"
              placeholder="Choose scanner"
            >
              <el-option
                v-for="{ value, label } in printers"
                :key="value"
                :label="label"
                :value="value"
              />
            </el-select>
          </u-form-row>

          <u-form-row :label="$ut('Rotate by 180 degrees')">
            <el-checkbox v-model="isBarcodeRotated" />
          </u-form-row>

          <u-form-row :label="$ut('Position on the page')">
            <el-select
              v-model="pagePosition"
              placeholder="Choose position"
              @change="pagePositionChange"
            >
              <el-option
                v-for="{ value, label } in pagePositions" :key="value"
                :label="label"
                :value="value"
              />
            </el-select>
          </u-form-row>

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
  </div>
</template>

<script>
const { Form } = require('@unitybase/adminui-vue')

module.exports.mount = function (cfg) {
  Form({
    ...cfg,
    isModal: true,
    modalWidth: '700px'
  })
    .mount()
}

module.exports.default = {
  name: 'UbmDesktopScanerSettings',

  data () {
    return {
      selectedScanner: null,
      scanners: [],

      scannerType: 'Streaming',
      scannerTypes: [
        { label: 'Streaming' },
        { label: 'Tablet' }
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
        { label: 'JPEG', value: 'JPEG' },
        { label: 'PDF', value: 'PDF' },
        { label: 'TIFF', value: 'TIFF' },
        { label: 'PDF/A', value: 'PDF/A' }
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
        label: this.$ut('Left'),
        value: 5,
        disabled: [
          'bcppTopCenter',
          'bcppTopRight',
          'bcppBottomCenter',
          'bcppBottomRight'
        ]
      }, {
        label: this.$ut('Top'),
        value: 5,
        disabled: [
          'bcppBottomLeft',
          'bcppBottomCenter',
          'bcppBottomRight'
        ]
      }, {
        label: this.$ut('Right'),
        value: 5,
        disabled: [
          'bcppTopLeft',
          'bcppTopCenter',
          'bcppBottomLeft',
          'bcppBottomCenter'
        ]
      }, {
        label: this.$ut('Bottom'),
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
    async getScanners () {
      const service = await $App.scanService()
      const scanners = await service.getScanners()
      if (scanners) {
        this.scanners = scanners
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
        if (margin.disabled.includes(this.pagePosition)) {
          margin.value = 5
        }
        accum.push(margin)
        return accum
      }, [])
    }
  }
}
</script>
