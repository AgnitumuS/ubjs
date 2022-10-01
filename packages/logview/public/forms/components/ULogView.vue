<template>
  <div
    v-loading="loading"
    class="u-form-layout"
    style="font-size: 12px"
  >
    <div class="u-toolbar">
      <u-dropdown ref="fileMenu">
        <u-button icon="u-icon-folder-open" appearance="inverse" title="Open log..."></u-button>

        <template #dropdown>
          <u-dropdown-item icon="u-icon-file-text" label="From file..." prevent-close>
            <template #label>
              <label>
                From file
                <input
                  type="file"
                  accept=".log"
                  style="display: none;"
                  @change="selectLocalFile"
                >
              </label>
            </template>
          </u-dropdown-item>
          <u-dropdown-item :disabled="!$UB.connection" @open="refreshFiles" icon="u-icon-data" label="From server...">
            <u-dropdown-item prevent-close icon="u-icon-refresh" label="Refresh logs list" @click="refreshFiles" />
            <u-dropdown-item divider />
            <u-dropdown-item
              v-for="f in files"
              :key="f.fn"
              :label="f.fn"
              :title="formatFileTitle(f)"
              @click="selectRemoteLogFile(f.fn)"
            />
          </u-dropdown-item>
        </template>
      </u-dropdown>

      <u-dropdown :disabled="!selectedFileName">
        <u-button :disabled="!selectedFileName" icon="u-icon-save" appearance="inverse" title="Download log"></u-button>

        <template #dropdown>
          <u-dropdown-item label="Download remote log" :disabled="selectedFileIsLocal" @click="doSave(true)"/>
          <u-dropdown-item label="Save filtered lines" @click="doSave(false)"/>
        </template>
      </u-dropdown>

      <u-button
        title="Change layout"
        :icon="`u-icon-book-alt fa-rotate-${previewPosIsRight ? 0 : 270}`"
        appearance="inverse"
        @click="changeLayout"
      />

      <u-button
        title="Show methods timing"
        :disabled="!selectedFileName"
        icon="u-icon-clock"
        appearance="inverse"
        @click="switchTiming"
      />

      <u-button
        title="Show statistics"
        :disabled="!selectedFileName"
        icon="u-icon-line-chart"
        appearance="inverse"
        @click="showStats"
      />

      <u-base-input
        placeholder="search for..."
        :disabled="!selectedFileName"
        style="width: 25em; margin-right: 1em; margin-left: 1em"
        v-model="searchStr"
        @input="doSearch('down')"
      >
        <el-button icon="u-icon-arrow-down" slot="append" title="Next Occurrence" @click="doSearch('down')"/>
        <el-button icon="u-icon-arrow-up" slot="append" title="Previous Occurrence" @click="doSearch('up')"/>
      </u-base-input>

      <u-base-input
        placeholder="filter..."
        :disabled="!selectedFileName"
        style="width: 25em"
        v-model="filterStr"
      >
        <el-button
          slot="append"
          icon="u-icon-filter"
          title="Apply filter"
          @click="applyFiltersAndShow"
        />
      </u-base-input>

      <div class="u-toolbar__flex-divider" />

      <div v-if="selectedFileRangeSupported">
        <u-checkbox
          v-model="followMode"
          kind="switch"
          title="Follow mode on/off"
          :disabled="!selectedFileRangeSupported"
          @change="startStopFollowing"
        >
          <u-button
            icon="u-icon-arrow-double-right fa-rotate-90"
            appearance="inverse"
            title="Check for remote lines appends"
            @click="retrieveContent(selectedFileName, true)"
          />
        </u-checkbox>
      </div>

      <table class="u-toolbar__date">
        <tr>
          <td>{{ selectedFileIsLocal ? 'File:' : 'Remote:' }}</td>
          <td>{{ selectedFileName }}</td>
        </tr>
        <tr>
          <td>Line:</td>
          <td>{{ selectedLineIdx + 1 }} / {{ totalCnt }}</td>
        </tr>
      </table>
    </div>

    <u-form-container
      label-position="top"
    >
      <div
        class="log-view"
        :class="{'log-view--right': previewPosIsRight, 'log-view--timing': methodsTimingVisible}"
      >
        <div class="log-view__sidebar">
          <u-field-set title="Events">
            <u-checkbox
              v-for="ll in usedLogLevels"
              :key="ll.idx"
              v-model="ll.checked"
              :label="`${ll.label}(${ll.cnt})`"
              @contextmenu.prevent="showLogLevelPrefilter($event, ll)"
            />
            <u-dropdown ref="logLevelsPre">
              <template slot="dropdown">
                <u-dropdown-item
                  label="Find next"
                  @click="findNextLogLevelLine"
                />
                <u-dropdown-item divider />
                <u-dropdown-item label="Filter" disabled />
                <u-dropdown-item
                  v-for="pf in logLevelPrefilters"
                  :key="pf.label"
                  :label="pf.label"
                  @click="applyLogLevelPrefilter(pf)"
                />
              </template>
            </u-dropdown>
          </u-field-set>

          <u-field-set title="Threads">
            <u-checkbox
              v-for="th in usedThreads"
              :key="th.idx"
              v-model="th.checked"
              data-thread="th.idx"
              :label="`${th.label}(${th.cnt})`"
              @contextmenu.prevent="showThreadsPrefilter($event, th.idx)"
            />
            <u-dropdown ref="threadPre">
              <template slot="dropdown">
                <u-dropdown-item
                  label="All"
                  @click="applyThreadPrefilter('all')"
                />
                <u-dropdown-item
                  label="None"
                  @click="applyThreadPrefilter('none')"
                />
                <u-dropdown-item
                  label="Only this"
                  @click="applyThreadPrefilter('cur')"
                />
              </template>
            </u-dropdown>
          </u-field-set>
        </div>

        <u-log-lines
          ref="log"
          class="log-view__lines"
          @line-select="showLineContent"
        />

        <u-code-mirror
          class="log-view__preview"
          v-model="selectedLineFormatted"
          :editor-mode="selectedLineContentType"
          :options="{lineNumbers: false, lineWrapping: true}"
        />

        <section
          v-if="methodsTimingVisible"
          ref="logTimings"
          class="log-view__timing"
          tabindex="0"
          @dblclick="showTimingLine(parseInt($event.target.dataset.idx,10))"
        >
          <div> Top 1000 durations</div>
          <pre
            v-for="t in timingLines"
            :key="t.idx"
            :data-idx="t.idx"
          >{{ t.timeFmt }} {{ t.txtFmt }} </pre>
        </section>
      </div>
    </u-form-container>
  </div>
</template>

<script>
const logUtils = require('./uLogUtils')
const sqlFormatter = require('sql-formatter/dist/sql-formatter.min.js')
const { LOG_LEVELS } = logUtils
const ULogLines = require('./ULogLines.vue').default

export default {
  name: 'ULogView',
  components: {
    ULogLines
  },
  data () {
    const lls = Object.values(LOG_LEVELS)
      .sort((a, b) => a.idx - b.idx)
      .map(ll => Object.assign({ cnt: 0, checked: true }, ll))
    const threads = []
    for (let i = 0; i < logUtils.MAX_THREADS; i++) {
      threads.push({ idx: i, label: i === 0 ? 'Main' : ('' + i).padStart(2, '0'), cnt: 0, checked: true })
    }
    return {
      files: [],
      selectedFileName: '',
      selectedFileIsLocal: true,
      selectedFileBytes: 0,
      selectedFileRangeSupported: false,
      followMode: false,
      followModeTimer: null,
      threads,
      lls,
      loading: false,
      totalCnt: 0,

      checkedLl: new Array(logUtils.LOG_LEVELS_CNT).fill(true),
      threadCount: 1,
      filterByThread: 0,
      searchStr: '',
      filterStr: '',
      selectedLineContent: '',
      selectedLineFormatted: '',
      selectedLineContentType: LOG_LEVELS.unknown.contentType,
      editorMode: 'text/yaml',
      selectedLineIdx: 0,

      methodsTimingVisible: false,

      logLevelPrefilters: [
        { label: 'None', onFor: new Set([]) },
        { label: 'All', onFor: new Set(Object.values(LOG_LEVELS).map(ll => ll.code)) },
        { label: 'Errors', onFor: new Set([LOG_LEVELS.error.code, LOG_LEVELS.osErr.code, LOG_LEVELS.exc.code, LOG_LEVELS.excOs.code]) },
        { label: 'Database', onFor: new Set([LOG_LEVELS.SQL.code, LOG_LEVELS.DB.code, LOG_LEVELS.cust1.code, LOG_LEVELS.cust2.code]) }
      ],

      previewPosIsRight: this.$uiSettings.get('LogView', 'previewPosIsRight') || false
    }
  },

  async mounted () {
    // this.refreshFiles()
  },

  beforeDestroy () {
    clearInterval(this.followModeTimer)
  },

  methods: {
    reset () {
      clearInterval(this.followModeTimer)
      this._logParser = undefined
      this.$refs.log.setLines([])
      this.totalCnt = 0
      this.lls.forEach(ll => { ll.cnt = 0; ll.checked = true })
      this.threads.forEach(th => { th.cnt = 0; th.checked = true })
      this.filterByThread = 0
      this.searchStr = ''
      this.filterStr = ''
      this.selectedLineContent = ''
      this.selectedLineContentType = LOG_LEVELS.unknown.contentType
      this.selectedLineIdx = 0
      this.selectedFileRangeSupported = false
      this.selectedFileBytes = 0
      this.followMode = false
      this.methodsTimingVisible = false
    },

    async refreshFiles () {
      this.files = await logUtils.getLogFiles()
    },

    selectRemoteLogFile (fn) {
      this.selectedFileName = fn
      this.selectedFileIsLocal = false
      this.retrieveContent(fn)
    },
    selectLocalFile (e) {
      const file = e.target.files[0]
      this.$refs.fileMenu.close()
      if (!file) return
      this.selectedFileName = file.name
      this.selectedFileIsLocal = true
      this.selectedFileRangeSupported = false
      this.retrieveContent(file)
    },

    /**
     * Retrieve log content either from remote server or from local file
     *
     * @param {string|File} file If string - this is file name from server, if Blob - local file
     * @param {boolean} [isPartial=false]
     * @returns {Promise<void>}
     */
    async retrieveContent (file, isPartial = false) {
      if (!isPartial) {
        this.reset()
        this.loading = true
      }
      let txt
      try {
        if (typeof file === 'string') {
          const rangeHeader = `bytes=${this.selectedFileBytes}-` // 0- for first chunk
          let resp
          try {
            resp = await this.$UB.connection.get(`/rest/log_view/logContent/${file}`, { headers: { Range: rangeHeader } })
          } catch (e) {
            if (e.status === 416) {
              return // no new content
            }
            throw e
          }
          // await this.$UB.connection.get(`/rest/log_view/logContent/${file}`, { headers: { Range: 'bytes=0-4048' } })
          txt = resp.data
          const rangeVal = resp.headers('Content-Range') // bytes 0-1967958/1967959
          const fSize = rangeVal ? parseInt(rangeVal.split('/')[1], 10) : 0 // much faster than Buffer([txt]).byteLength
          this.selectedFileRangeSupported = !!fSize
          this.selectedFileBytes = fSize || 0
        } else {
          txt = await file.text()
        }
      } finally {
        if (!isPartial) this.loading = false
      }
      if (isPartial) {
        this._logParser.addLogPortion(txt)
      } else {
        this._logParser = new logUtils.LogParser(txt)
      }
      for (let i = 0; i < logUtils.LOG_LEVELS_CNT; i++) {
        this.lls[i].cnt = this._logParser.perLlCnt[i]
      }
      for (let i = 0; i < logUtils.MAX_THREADS; i++) {
        this.threads[i].cnt = this._logParser.perThCnt[i]
      }
      this.applyFiltersAndShow(isPartial)
    },

    retrievePartialContent () {
      this.retrieveContent(this.selectedFileName, true)
    },

    startStopFollowing () {
      if (this.followMode) {
        if (this.selectedFileIsLocal) return
        this.$refs.log.selectRow(this._logParser.allLines.length - 1)
        this.followModeTimer = setInterval(this.retrievePartialContent, 10 * 1000)
      } else {
        clearInterval(this.followModeTimer)
      }
    },

    doSearch (direction) {
      this.$refs.log.searchAndSelect(this.searchStr, 'like', direction)
    },

    applyFiltersAndShow (isPartial) {
      if (!this._logParser) return
      this.loading = true
      try {
        const filteredLines = this._logParser.getFilteredLines(this.logLevels4Filter, this.threads4Filter, this.filterStr)
        this.$refs.log.setLines(filteredLines, this._logParser, isPartial)
        this.totalCnt = filteredLines.length
      } finally {
        this.loading = false
      }
    },

    async doSave (fromRemote) {
      let logData
      if (fromRemote) {
        logData = await this.$UB.connection.get(`/rest/log_view/logContent/${this.selectedFileName}`, { responseType: 'blob' })
        logData = logData.data
      } else {
        logData = this.$refs.log.getLinesAsBlob()
      }
      window.saveAs(logData, this.selectedFileName)
    },

    async showLineContent (line, idx) {
      this.selectedLineContent = line
      this.selectedLineIdx = idx
      const parsed = this._logParser.parseLine(line, idx, false)
      this.selectedLineContentType = parsed.logLevel.contentType || LOG_LEVELS.unknown.contentType
      this.selectedLineFormatted = this.formatPreview(parsed, line)
    },

    applyLogLevelPrefilter (pf) {
      const onSet = pf.onFor
      this.lls.forEach(ll => { ll.checked = onSet.has(ll.code) })
    },

    showThreadsPrefilter (e, thIdx) {
      this._prefilterPoppedAt = thIdx
      this.$refs.threadPre.show(e)
    },
    applyThreadPrefilter (action) {
      if (action === 'all') {
        this.threads.forEach(th => { th.checked = true })
      } else if (action === 'none') {
        this.threads.forEach(th => { th.checked = false })
      } else if (action === 'cur') {
        this.threads.forEach(th => { th.checked = th.idx === this._prefilterPoppedAt })
      }
    },

    showLogLevelPrefilter (e, ll) {
      this._llPoppedAt = logUtils.LOG_LEVELS_MAP.get(ll.code)
      this.$refs.logLevelsPre.show(e)
    },
    findNextLogLevelLine () {
      this.$refs.log.gotoNextLogLevelLine(this._llPoppedAt)
    },

    formatFileInfo (f) {
      let res = f.size < 1024 * 1024
        ? this.$UB.formatter.formatNumber(f.size / 1024, 'numberGroup') + 'Kb  '
        : this.$UB.formatter.formatNumber(f.size / (1024 * 1024), 'numberGroup') + 'Mb  '
      if (f.startDate) res += this.$UB.formatter.formatDate(f.startDate, 'dateTimeFull') + ' - '
      if (f.startDate && f.startDate.getFullYear() === f.endDate.getFullYear() &&
        f.startDate.getMonth() === f.endDate.getMonth() &&
        f.startDate.getDate() === f.endDate.getDate()) {
        res += this.$UB.formatter.formatDate(f.endDate, 'timeFull')
      } else {
        res += this.$UB.formatter.formatDate(f.endDate, 'dateTimeFull')
      }
      return res
    },

    formatFileTitle (f) {
      return f.fn + '\n' + this.formatFileInfo(f)
    },

    formatPreview (parsed, line) {
      let txt = parsed.txt
      let fmt
      try {
        if (parsed.logLevel.contentType === 'text/x-sql') {
          let qStart = txt.indexOf('q=')
          const isUB = qStart !== -1
          if (!isUB) {
            const uTXT = txt.toLowerCase()
            qStart = (uTXT.indexOf('select') + 1) || (uTXT.indexOf('insert') + 1) || (uTXT.indexOf('update') + 1) || (uTXT.indexOf('delete') + 1)
            qStart -= 1
          } else {
            qStart += 2
          }
          fmt = `-- ${this._logParser.getLineTime(line, true)} Thread: #${parsed.th}`
          if (qStart === -1) {
            fmt += `\n${parsed.txt}`
          } else {
            const comment = txt.substring(0, isUB ? qStart - 2 : qStart).trim()
            const SQL = txt.substring(qStart)
            // heuristic for dialect based on parameters format
            let lang = 'sqlite' // ?
            if (SQL.includes('$1')) { // Postgres, SQL Server
              lang = 'postgresql'
            } else if (SQL.includes(':1')) { // Oracle
              lang = 'plsql'
            }
            if (isUB) {
              // r=1 t=1260 fr=1257 c=0
              const MT = { r: 'Rows: ', t: 'Time: ', fr: 'TimeToFirstRow: ', c: 'PlaneCached: ' }
              const metrics = comment.split(' ').map(v => {
                const parts = v.split('=')
                let res = v
                if (parts.length === 2) {
                  if (parts[0] === 'c') {
                    res = MT[parts[0]] + (parts[1] === '0' ? 'no' : 'yes')
                  } else {
                    if (parts[0] === 'r') {
                      res = MT[parts[0]] + parts[1]
                    } else {
                      res = MT[parts[0]] + (Math.round(parseInt(parts[1], 10) / 100) / 10) + 'ms'
                    }
                  }
                }
                return res
              })
              fmt += `\n-- ${metrics.join(', ')}\n` + sqlFormatter.format(SQL, { language: lang })
            } else {
              fmt += '\n' + sqlFormatter.format(SQL, { language: lang })
            }
          }
        } else if (parsed.logLevel.contentType === 'application/json') {
          txt = txt.trim().replaceAll('...]', '"more..."]') // truncated array parameter
          fmt = JSON.stringify(JSON.parse(txt), null, '\t')
          fmt = `//${this._logParser.getLineTime(line, true)} Thread: #${parsed.th} \n${fmt}`
        } else if (parsed.logLevel !== LOG_LEVELS.unknown) {
          fmt = `-- ${this._logParser.getLineTime(line, true)} Thread: #${parsed.th} Log level: ${parsed.logLevel.label}\n`
          txt = txt.trim()
          if (txt.startsWith('[{') || txt.startsWith('{')) { // most likely UBQL or some other JSON
            try {
              txt = JSON.stringify(JSON.parse(txt), null, '\t')
            } catch {}
          }
          fmt += txt
        } else {
          fmt = line
        }
      } catch (e) {
        console.error(e, 'for', txt)
      }
      return fmt
    },

    changeLayout () {
      this.previewPosIsRight = !this.previewPosIsRight
      this.$uiSettings.put(this.previewPosIsRight, 'LogView', 'previewPosIsRight')
    },

    switchTiming () {
      if (this.methodsTimingVisible) {
        this.methodsTimingVisible = false
      } else {
        this.loading = true
        try {
          let timings = this._logParser.buildMethodsTiming()
          timings.sort((a, b) => b.time - a.time)
          timings = timings.slice(0, 1000)
          timings.forEach(t => {
            const sec = Math.trunc(t.time / (1000 * 1000))
            if (sec > 60) { // > minute - show with seconds precision 01m01s
              t.timeFmt = Math.trunc(sec / 60) + 'm' + (sec % 60 + 's')
            } else if (sec > 0) { // seconds precision 50s124ms
              t.timeFmt = (sec + 's').padStart(2, ' ') + (Math.round((t.time % 1000000) / 1000) + 'ms')
            } else if (t.time > 1000) { // milliseconds
              t.timeFmt = (Math.round(t.time / 1000) + 'ms')
            } else { // microseconds
              t.timeFmt = (t.time + 'μs')
            }
            t.timeFmt = t.timeFmt.padStart(8, ' ')
            t.txtFmt = this._logParser.allLines[t.idx].substring(this._logParser.TH_POS + 2 + 6)
          })
          this._timings = timings
        } finally {
          this.loading = false
        }
        this.methodsTimingVisible = true // force reactivity
      }
    },
    showTimingLine (idx) {
      const p = this._logParser.parseLine(idx)
      this._prefilterPoppedAt = p.th
      this.applyThreadPrefilter('cur') // filter by thread
      // eslint-disable-next-line no-undef
      Vue.nextTick(() => { this.$refs.log.searchAndSelect(this._logParser.allLines[idx], 'equal', 'full') })
    },

    showStats () {
      this.selectedLineFormatted = this._logParser.computeStats(this.selectedFileName)
      this.selectedLineContentType = LOG_LEVELS.unknown.contentType
    }
  },
  computed: {
    usedLogLevels () {
      return this.lls.filter(ll => ll.cnt > 0)
    },
    logLevels4Filter () {
      const res = []
      this.lls.forEach(ll => {
        if (ll.checked) {
          res.push(ll.code)
        }
      })
      return res
    },
    usedThreads () {
      return this.threads.filter(th => th.cnt > 0)
    },
    threads4Filter () {
      const res = []
      this.threads.forEach(th => {
        if (th.checked) { res.push(th.idx) }
      })
      return res
    },
    timingLines () {
      return this.methodsTimingVisible ? this._timings : []
    }
  },
  watch: {
    logLevels4Filter: {
      handler () {
        this.applyFiltersAndShow()
      },
      deep: true
    },
    threads4Filter: {
      handler () {
        this.applyFiltersAndShow()
      },
      deep: true
    }
  }
}
</script>

<style>
.log-view {
  display: grid;
  grid-template-columns: 145px 1fr 1fr;
  grid-template-rows: 2fr 1fr;
  grid-template-areas:
    "sidebar lines lines"
    "preview preview preview";
  column-gap: 5px;
  row-gap: 5px;
  grid-auto-flow: row;
  height: 100%;
}

.log-view.log-view--timing {
  grid-template-areas:
    "sidebar lines lines"
    "timing preview preview";
}

.log-view--right {
  grid-template-areas:
    "sidebar lines preview"
    "sidebar lines preview";
}

.log-view--right.log-view--timing {
  grid-template-areas:
    "sidebar lines preview"
    "sidebar lines timing";
}

.log-view__lines {
  grid-area: lines;
}
.log-view__sidebar {
  overflow: auto;
  grid-area: sidebar;
}
.log-view__sidebar .u-field-set {
  line-height: 2em;
  margin-bottom: 0;
}

.log-view__preview {
  grid-area: preview;
  font-family: monospace;
  tab-size: 4;
  overflow: auto;
}

.log-view__timing {
  grid-area: timing;
  overflow: auto;
  font-family: monospace;
  tab-size: 2;
  font-size: 12px;
  border: 1px solid hsl(var(--hs-border), var(--l-layout-border-default));
}
</style>
