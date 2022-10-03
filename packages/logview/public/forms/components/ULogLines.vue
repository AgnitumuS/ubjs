<template>
  <div
    ref="scrollContainer"
    class="u-log-lines"
    v-bind="$attrs"
    @scroll="doOnScroll"
  >
    <div
      ref="viewport"
      class="u-log-lines__viewport"
      :style="{ height: viewportHeight + 'px' }"
    >
      <!-- tabindex is important for key scroll -->
      <div
        ref="slicer"
        :style="{ transform: `translateY(${offsetY}px)`, lineHeight: itemHeight + 'px' }"
        tabindex="0"
        @click="selectRow(parseInt($event.target.dataset.idx,10))"
        @dblclick="jumpCallStack(parseInt($event.target.dataset.idx,10))"
      >
        <pre
          v-for="l in visibleLines"
          :key="l.idx"
          :data-idx="l.idx"
          :class="[{'u-log-lines--selected': selectedRowIndex === l.idx}]"
          :style="{ backgroundColor: l.logLevel.bg, color: l.logLevel.fg}"
        >{{ l.time }} {{ l.th }} {{ l.logLevel.label }} {{ l.txt }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
const Vue = require('vue')
const { LOG_LEVELS } = require('./uLogUtils')
/**
 * Virtual scroll based log lines viewer
 */
export default {
  name: 'ULogLines',

  props: {
    itemHeight: {
      type: Number,
      default: 17
    }
  },
  data () {
    return {
      vpHeight: 0,
      scrollTop: 0,
      itemsCount: 0,
      /**
       * Max height of HTML element (viewport in our case) is limited in browsers
       */
      scale: 1,
      renderAhead: 0,
      selectedRowIndex: -1
    }
  },

  computed: {
    viewportHeight () {
      // amendment with scale * 200 is used to scroll to last element (reason of bug is unknown yet)
      return Math.ceil(this.itemsCount * this.itemHeight / this.scale) + (this.scale === 1 ? 0 : this.scale * 200)
    },
    firstVisibleLine () {
      return Math.max(0, Math.ceil(this.scrollTop * this.scale / this.itemHeight) - this.renderAhead)
    },
    visibleLinesCount () {
      const res = Math.ceil(this.vpHeight / this.itemHeight) + 2 * this.renderAhead
      return Math.min(this.itemsCount - this.firstVisibleLine, res)
    },
    offsetY () {
      return Math.floor(this.firstVisibleLine * this.itemHeight / this.scale)
    },
    visibleLines () {
      const res = []
      for (let i = this.firstVisibleLine, L = this.firstVisibleLine + this.visibleLinesCount; i < L; i++) {
        res.push(this._logParser.parseLine(this._lines[i], i))
      }
      return res
    }
  },

  watch: {
  },

  mounted () {
    // const rect = this.$refs.scrollContainer.getBoundingClientRect()
    // this.vpHeight = rect.height
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry.contentRect.height !== this.vpHeight) {
        this.vpHeight = entry.contentRect.height
      }
    })
    resizeObserver.observe(this.$refs.scrollContainer)
  },

  methods: {
    /**
     * Set array of log lines (non-reactive) for displaying
     *
     * @param {Array<string>} logLines
     * @param {LogParser} logParser
     * @param {boolean} [isPartial=false]
     * @public
     */
    setLines (logLines, logParser, isPartial = false) {
      // for partial content in case last line is selected - scroll to new last line
      const moveToLast = isPartial && (this.selectedRowIndex + 1 >= this.itemsCount)
      const activeText = (this._lines && this._lines.length && this.selectedRowIndex !== -1) ? this._lines[this.selectedRowIndex] : ''
      this._logParser = logParser
      this._lines = logLines
      // Maximum items count for virtual scroll are:
      // Chrome - 1579031
      // FF        526343
      const MAX_PX = (this.$UB.isChrome ? 1579031 : 526343) * 17 // measured max lines count * line height during measurement
      this.scale = Math.ceil(logLines.length * this.itemHeight / MAX_PX)
      this.itemsCount = logLines.length // Math.min(logLines.length, 526343) // this triggers reactivity
      if (moveToLast) {
        Vue.nextTick(() => {
          this.selectRow(logLines.length - 1, true)
        })
      } else if (activeText) {
        if (!this.searchAndSelect(activeText, 'equal', 'full')) {
          this.selectedRowIndex = -1
        }
      }
    },
    /**
     * Return all lines as Blob ready to be saved to file
     * @public
     * @returns {Blob}
     */
    getLinesAsBlob () {
      if (this._lines.length > 1000000) {
        throw new this.$UB.UBError('Too much lines to save..')
      }
      return new Blob([this._lines.join('\n')])
    },
    /**
     * Search for pattern, if found - select row and scroll it into view
     *
     * @param {string} pattern
     * @param {string} [patternType='like'] One of `regexp`, `like`, `equal`
     * @param {string} [direction='down'] Direction from `selectedRowIndex`. One of `up` `down` `full`
     * @returns {boolean} true if found
     */
    searchAndSelect (pattern, patternType, direction = 'down') {
      const L = this._lines
      // by default - down
      let i = this.selectedRowIndex
      let e = this.itemsCount
      let d = 1
      let found = false
      if (direction === 'full') {
        i = -1
      } else if (direction === 'up') {
        e = 0; d = -1
      }
      const maxI = this.itemsCount - d
      // below small code duplication to avoid unnecessary function call
      if (patternType === 'equal') {
        while (i !== e && i >= -1 && i < maxI) {
          i += d
          if (L[i] === pattern) {
            found = true
            break
          }
        }
      } else if (patternType === 'regexp') {
        const re = new RegExp(pattern)
        while (i !== e && i >= -1 && i < maxI) {
          i += d
          if (re.test(L[i])) {
            found = true
            break
          }
        }
      } else { // default - like
        while (i !== e && i >= -1 && i < maxI) {
          i += d
          if (L[i].includes(pattern)) {
            found = true
            break
          }
        }
      }
      if (found) {
        Vue.nextTick(() => {
          this.selectRow(i, true, direction !== 'down')
        })
      }
      return found
    },

    doOnScroll (e) {
      requestAnimationFrame(() => {
        this.scrollTop = e.target.scrollTop
      })
    },
    /**
     * Select row by index
     *
     * @param {number} rowIndex
     * @param {boolean} [scrollIntoView=false]
     * @param {boolean}[scrollUp=false]
     */
    selectRow (rowIndex, scrollIntoView = false, scrollUp = false) {
      this.selectedRowIndex = rowIndex
      /**
       * Triggers when row is selected
       *
       * @param {number} rowIndex index of row in _lines array
       */
      this.$emit('line-select', this._lines[rowIndex], rowIndex)
      if (!scrollIntoView) return
      const el = this.$refs.slicer.querySelector(`[data-idx="${rowIndex}"]`)
      if (!el) { // element not in slicer (invisible) - move scroll
        if (scrollUp) {
          // move active line on 3 line down from top
          const posY = Math.trunc(Math.max(rowIndex - 3, 0) * this.itemHeight / this.scale)
          this.$refs.scrollContainer.scrollTop = posY > 0 ? posY : 0
        } else {
          // move active line on 3 line up from bottom
          const posY = Math.trunc(Math.max(rowIndex - this.visibleLinesCount + 3, 0) * this.itemHeight / this.scale)
          this.$refs.scrollContainer.scrollTop = posY > 0 ? posY : 0
        }
      }
    },
    gotoNextLogLevelLine (ll) {
      let k = this.selectedRowIndex
      const ln = this._lines
      const L = ln.length
      let rowIdx = 0
      while (k < L) {
        k++
        if (this._logParser.parseLine(ln[k], k, true).logLevel === ll) {
          rowIdx = k
          break
        }
      }
      if (rowIdx) this.selectRow(rowIdx, true)
    },
    /**
     * For Enter - jump to Leave of the same thread with same recursion depth and vice versa
     * For other log levels - to the same log level of the same thread
     *
     * @param {number} i initial line
     * @returns {boolean}
     */
    jumpCallStack (i) {
      const p = this._logParser.parseLine(this._lines[i], i, true)
      const TH = p.th
      const lFrom = p.logLevel
      let e = this.itemsCount
      let lTo
      let d = 1
      let scrollUp = false
      if (lFrom === LOG_LEVELS.enter) {
        lTo = LOG_LEVELS.leave
      } else if (lFrom === LOG_LEVELS.leave) {
        d = -1
        lTo = LOG_LEVELS.enter
        e = 0
        scrollUp = true
      } else {
        lTo = lFrom
      }
      let rec = 0
      let found = false
      const maxI = this.itemsCount
      while (i !== e && i >= -1 && i < maxI) {
        i += d
        const p = this._logParser.parseLine(this._lines[i], i, true)
        if (p.th !== TH || !(p.logLevel === lFrom || p.logLevel === lTo)) continue
        if (p.logLevel === lTo && rec === 0) {
          found = true
          break
        } else if (p.logLevel === lTo) {
          rec++
        } else {
          rec--
        }
      }
      if (found) this.selectRow(i, true, scrollUp)
      return found
    }
  }
}
</script>

<style>
.u-log-lines {
  overflow: auto;
  border: 1px solid hsl(var(--hs-border), var(--l-layout-border-default));
  tab-size: 2;
  font-size: 12px;
  scrollbar-width: unset; /* for Firefox*/
}

.u-log-lines__viewport {
  position: relative;
  scroll-behavior: smooth;
}

.u-log-lines pre{
  margin: 0;
}

.u-log-lines--selected {
 background-color: green !important;
 transition: background-color 200ms linear;
}

</style>
