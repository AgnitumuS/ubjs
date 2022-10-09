const UB = require('@unitybase/ub-pub')

/*
log line
20220916 14490144  ! auth  ....
 */
const MAX_THREADS = 64 + 2
const TH_0 = '!'.charCodeAt(0) // 33
const LOG_LEVELS = {
  unknown: { idx: 0, bg: '#C0C0DC', fg: null, code: '??? ', label: '', contentType: 'text/yaml' },
  info: { idx: 1, bg: '#C0C0DC', fg: null, code: 'info  ', label: 'Info   ' },
  debug: { idx: 2, bg: '#dcdcdc', fg: null, code: 'debug ', label: 'Debug  ' },
  trace: { idx: 3, bg: '#dcdcdc', fg: null, code: 'trace ', label: 'Trace  ' },
  warn: { idx: 4, bg: '#c08080', fg: null, code: 'warn  ', label: 'Warn   ' },
  error: { idx: 5, bg: '#ff8080', fg: null, code: 'ERROR ', label: 'Error  ' },
  enter: { idx: 6, bg: '#c0dcc0', fg: null, code: ' +    ', label: '-->    ' },
  leave: { idx: 7, bg: '#c0dcdc', fg: null, code: ' -    ', label: '<--    ' },
  osErr: { idx: 8, bg: '#f080c0', fg: null, code: 'OSERR ', label: 'OSError' },
  exc: { idx: 9, bg: '#ff80c0', fg: null, code: 'EXC   ', label: 'Exc    ' },
  excOs: { idx: 10, bg: '#f080c0', fg: null, code: 'EXCOS ', label: 'ExcOS  ' },
  mem: { idx: 11, bg: '#C0C0DC', fg: null, code: 'mem   ', label: 'Memory ' },
  stack: { idx: 12, bg: '#C0C0DC', fg: null, code: 'stack ', label: 'Stack  ' },
  fail: { idx: 13, bg: '#C0C0DC', fg: null, code: 'fail  ', label: 'Fail   ' },
  SQL: { idx: 14, bg: '#c8c8ff', fg: null, code: 'SQL   ', label: 'SQL    ', contentType: 'text/x-sql' },
  cache: { idx: 15, bg: '#C0C0DC', fg: null, code: 'cache ', label: 'Cache  ' },
  res: { idx: 16, bg: '#C0C0DC', fg: null, code: 'res   ', label: 'Result ' },
  DB: { idx: 17, bg: '#80dc80', fg: null, code: 'DB    ', label: 'DB     ' },
  http: { idx: 18, bg: '#8080dc', fg: null, code: 'http  ', label: 'HTTP   ' },
  clnt: { idx: 19, bg: '#C0C0DC', fg: null, code: 'clnt  ', label: 'Clnt   ' },
  srvr: { idx: 20, bg: '#00d0dc', fg: null, code: 'srvr  ', label: 'Server ' },
  call: { idx: 21, bg: '#C0C0DC', fg: null, code: 'call  ', label: 'Call   ' },
  ret: { idx: 22, bg: '#C0C0DC', fg: null, code: 'ret   ', label: 'Ret    ' },
  auth: { idx: 23, bg: '#dcdcdc', fg: null, code: 'auth  ', label: 'Auth   ' },
  cust1: { idx: 24, bg: '#c8c8ff', fg: null, code: 'cust1 ', label: 'Params ', contentType: 'application/json' },
  cust2: { idx: 25, bg: '#c08080', fg: null, code: 'cust2 ', label: 'SlowSQL' },
  cust3: { idx: 26, bg: '#C0C0DC', fg: null, code: 'cust3 ', label: 'Reserv1' },
  cust4: { idx: 27, bg: '#C0C0DC', fg: null, code: 'cust4 ', label: 'Reserv2' },
  rotat: { idx: 28, bg: '#C0C0DC', fg: null, code: 'rotat ', label: 'LogRt  ' },
  dddER: { idx: 29, bg: '#C0C0DC', fg: null, code: 'dddER ', label: 'DDDErr ' },
  dddIN: { idx: 30, bg: '#C0C0DC', fg: null, code: 'dddIN ', label: 'DDDIn  ' },
  mon: { idx: 31, bg: '#C0C0DC', fg: null, code: 'mon   ', label: 'Monitor', contentType: 'application/json' }
}
const LOG_LEVELS_CNT = Object.keys(LOG_LEVELS).length
/** Map of log leve, string in log into LOG_LEVELS */
const LOG_LEVELS_MAP = new Map()
Object.keys(LOG_LEVELS).forEach(k => LOG_LEVELS_MAP.set(LOG_LEVELS[k].code, LOG_LEVELS[k]))

/*
mORMot2 HiRes timing
0000000000000000  ! info  SetThreadName 7f251daa7740=Main
0000000000000C72  ! SQL   <----><------>mormot.db.sql.postgres.TSqlDBPostgresStatement(7f251d78aba0) ExecutePrepared 227us 00 rows=1 SELECT LOCALTIMESTAMP
mORMot1 Timestamp
20210727 08260933  $ SQL                                r=1 t=389 fr=388 c=2 q=SELECT A01.ID,A01.lo
 */

class LogParser {
  /**
   * Create a log parser specialized for log file format. mORMot1 mORMot2, HiRes timing etc.
   *
   * @param {string} logFileTxt
   */
  constructor (logFileTxt) {
    const lines = logFileTxt.split('\n')
    /**
     * Log lines
     *
     * @type {Array<string>}
     */
    this.allLines = []
    /**
     * Lines to be shown (with filters applied)
     * @type {Array<string>}
     */
    this.filteredLines = []
    /**
     * Is Last added line ends with \n
     *
     * @type {boolean}
     */
    this.lastLineComplete = logFileTxt.endsWith('\n')
    /**
     * array of per thread event cont
     *
     * @type {Array<number>}
     */
    this.perThCnt = new Array(MAX_THREADS).fill(0)
    /**
     * Total events count
     *
     * @type {number}
     */
    this.totalCnt = 0
    /**
     * array of per thread log-level event cont
     *
     * @type {Array<number>}
     */
    this.perLlCnt = new Array(LOG_LEVELS_CNT).fill(0) // array of per log level event cont
    /**
     * log started at time (milliseconds since epoch)
     *
     * @type {number}
     */
    this.startedAt = new Date().getTime()
    /**
     * For Hi resolution timer logs - timer frequency in milliseconds
     *
     * @type {number}
     */
    this.hiResTimerFreq = 1000
    /**
     * Position of character with thread #
     *
     * @type {number}
     */
    this.TH_POS = 19 // 20210727 08260933  $ SQL
    /**
     * Return line time
     *
     * @param {string} l
     * @param {boolean} [asStr=false]
     * @param {boolean} [timeOnly=false]
     * @returns {string|Date}
     */
    this.getLineTime = this._getTlLineTime

    const L = lines.length
    let probeLine = ''
    if (L > 4) {
      if (lines[3].trim() === '') { // log with header
        probeLine = lines[4]
        const dtLine = lines[2].split(' ') // TSynLog 2.0.4068 x64MMs 2022-09-30T16:52:57
        this.startedAt = new Date(dtLine[dtLine.length - 1] + 'Z').getTime()
        const freqIdx = lines[1].indexOf('Freq=')
        if (freqIdx !== -1) this.hiResTimerFreq = Math.trunc(parseInt(lines[1].substring(freqIdx + 5)) / 1000)
      } else { // log without header (trimmed)
        probeLine = lines[0]
        const dt = this._getTlLineTime(probeLine)
        if (!isNaN(dt)) this.startedAt = dt.getTime()
      }
    }

    if (probeLine.startsWith('00000000000000')) { // 0000000000000C72  ! SQL HiRes timing
      this.TH_POS = 18
      this.getLineTime = this._getHiResLineTime
    }

    this.addLogPortion(lines, false)
  }

  lineThread (l) {
    const thN = l.charCodeAt(this.TH_POS) - TH_0
    return (thN < 0 || thN > MAX_THREADS) ? -1 : thN
  }

  /**
   * Parse log line
   *
   * @param {string|number} l Either log line text, all line index in this.allLines array
   * @param {number} [idx] optional line index
   * @param {boolean} [short=false] if true - parsed result contains only log level and thread (faster)
   * @returns {{txt, logLevel: {}, th: number, time: string, idx}}
   */
  parseLine (l, idx, short = false) {
    const res = { idx, time: '', logLevel: LOG_LEVELS.unknown, th: 0, txt: l }
    if (typeof l === 'number') l = this.allLines[l]
    if (!l) return res
    if (l.charCodeAt(0) > 57 /* 9 */ || l.charCodeAt(0) < 48 /* 0 */) return res // not a date line
    const thN = l.charCodeAt(this.TH_POS) - TH_0
    if (thN < 0 || thN > MAX_THREADS) return res // do not contain thread num
    const evName = l.substring(this.TH_POS + 2, this.TH_POS + 2 + 6)
    const ll = LOG_LEVELS_MAP.get(evName)
    if (!ll) return res
    res.logLevel = ll
    res.th = thN
    if (!short) {
      res.time = this.getLineTime(l, true, true)
      res.txt = l.substring(this.TH_POS + 2 + 6)
    }
    return res
  }

  /**
   * Add log lines. Calc count statistic
   *
   * @param {Array<string>|string} linesOrText
   * @param {boolean} [isPartial=true]
   */
  addLogPortion (linesOrText, isPartial = true) {
    const lines = Array.isArray(linesOrText) ? linesOrText : linesOrText.split('\n')
    console.time('parseLogPortion')
    const L = lines.length
    for (let i = 0; i < L; i++) {
      const parsed = this.parseLine(lines[i], 0, true)
      if (parsed.logLevel === LOG_LEVELS.unknown) continue
      if (parsed.th < 0 || parsed.th > MAX_THREADS) continue // do not contain thread num
      this.perThCnt[parsed.th]++
      this.perLlCnt[parsed.logLevel.idx]++
      this.totalCnt++
    }
    if (isPartial) {
      if (this.lastLineComplete) {
        this.allLines = this.allLines.concat(lines)
      } else { // add first line to the end of prev. log last line
        this.allLines[L - 1] += lines[0]
        this.allLines = this.allLines.concat(lines.slice(1))
      }
    } else {
      this.allLines = lines
    }
    this.filteredLines = this.allLines
    if (!Array.isArray(linesOrText)) {
      this.lastLineComplete = linesOrText.endsWith('\n')
    }
    console.timeEnd('parseLogPortion')
  }

  /**
   * Search for pattern, return line index (in allLines or in filtered lines depending on `inFiltered` param) or -1 if not found
   *
   * @param {string} pattern
   * @param {string} [patternType='like'] One of `regexp`, `like`, `equal`
   * @param {string} [direction='down'] Direction from `selectedRowIndex`. One of `up` `down` `full`
   * @param {number} from For `up`/`down` directions - line # to search from
   * @param {boolean} [inFiltered=true] Search in filtered lines or on allLines
   * @returns {number} line index or -1 if not found
   */
  findLine (pattern, patternType, direction = 'down', from = 0, inFiltered = true) {
    const L = inFiltered ? this.filteredLines : this.allLines
    // by default - down
    let i = from
    let e = L.length
    let d = 1
    let found = false
    if (direction === 'full') {
      i = -1
    } else if (direction === 'up') {
      e = 0; d = -1
    }
    const maxI = L.length - d
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
    return found ? i : -1
  }

  /**
   * Compute execution time for each Enter call
   *
   * @returns {Array<{idx: number, th: number, time: number}>}
   */
  buildMethodsTiming () {
    // we do not use parseLine here due to x5 performance reasons
    console.time('buildMethodsTiming')
    const lines = this.allLines
    const enterCnt = this.perLlCnt[LOG_LEVELS.enter.idx]
    const TH_POS = this.TH_POS
    const res = []
    for (let i = 0; i < enterCnt; i++) res.push({ idx: 0, th: '', time: 0 })
    let ri = 0
    for (let i = 0, L = lines.length; i < L; i++) {
      const llChar = lines[i].charAt(TH_POS + 2 + 1) // + , -, ...
      if (llChar !== '+') continue
      let j = i + 1
      let r = 0
      const TH = lines[i].charCodeAt(TH_POS) - TH_0
      // TODO - optimize to one pass using threadCount*maxRecursion matrix. Current time is ~1sec for ~1mill enters
      while (j < L) {
        const th2 = lines[j].charCodeAt(TH_POS) - TH_0
        if (th2 === TH) {
          const llChar2 = lines[j].charAt(TH_POS + 2 + 1) // + , -, ...
          if (llChar2 === '+') {
            r++
          } else if (llChar2 === '-') {
            if (r === 0) {
              res[ri].idx = i
              const s = lines[j].substring(TH_POS + 2 + 6).trim().replaceAll('.', '') // 93.156.402 ss.ms.ns
              res[ri].time = parseInt(s, 10)
              res[ri].th = TH
              ri++
              break
            } else {
              r--
            }
          }
        }
        j++
      }
    }
    console.timeEnd('buildMethodsTiming')
    return res
  }

  /**
   * Compute filteredLInes array what match filtering conditions
   *
   * @param {Array<string>} logLevels Log levels codes (code from LOG_LEVELS)
   * @param {Array<number>} threads Array of threads indexes to show
   * @param {string} expr
   * @returns {Array<string>}
   */
  applyFilters (logLevels, threads, expr) {
    // use direct log line access instead of parseLine, it's x3 times faster
    // filter by log level
    console.time('filtration')
    const usedLLs = new Set(logLevels)
    const isLlFiltered = usedLLs.size !== LOG_LEVELS_CNT
    const TH_POS = this.TH_POS
    const byLl = isLlFiltered
      ? (l) => usedLLs.has(l.substring(TH_POS + 2, TH_POS + 2 + 6))
      : () => true
    // filter by threads
    const usedTh = new Set()
    threads.forEach(th => {
      usedTh.add(TH_0 + th)
    })
    const isThFiltered = usedTh.size !== MAX_THREADS
    const byTh = isThFiltered
      ? (l) => usedTh.has(l.charCodeAt(TH_POS))
      : () => true

    const fStr = expr
    const byStr = expr
      ? (l) => l.includes(fStr)
      : () => true

    let filtered
    if (isLlFiltered || isThFiltered || fStr) {
      filtered = this.allLines.filter(l => byLl(l) && byTh(l) && byStr(l))
    } else {
      filtered = this.allLines
    }
    console.timeEnd('filtration')
    this.filteredLines = filtered
  }

  /**
   * Compute statistic
   * @param {string} fileName
   * @returns {string}
   */
  computeStats (fileName) {
    const LL = this.allLines
    const dateStart = new Date(this.startedAt)
    let dateEnd
    for (let i = LL.length - 1; i >= 0; i--) { // last line with date
      dateEnd = this.getLineTime(LL[i])
      if (!isNaN(dateEnd)) break // last line with valid date
    }
    if (!dateStart || !dateEnd) {
      return 'Log should contains at last 2 line what starts with dates to compute statistic'
    }
    const FMT = UB.formatter
    const totalSeconds = Math.round((dateEnd - dateStart) / 1000)
    const thStat = []
    this.perThCnt.forEach((cnt, i) => {
      if (cnt) thStat.push(`${i.toString().padStart(2, '0')}: ${FMT.formatNumber(cnt, 'numberGroup').padStart(9, ' ')}`)
    })
    const threadsInfo = thStat.join('\n')
    const userThreadsCnt = thStat.length
    const llStat = []
    const llsOrdered = Object.values(LOG_LEVELS).sort((a, b) => a.idx - b.idx)
    this.perLlCnt.forEach((cnt, llIdx) => {
      if (!cnt) return
      const ll = llsOrdered[llIdx]
      llStat.push(`${ll.label}: ${FMT.formatNumber(cnt, 'numberGroup').padStart(9, ' ')}`)
    })
    const llInfo = llStat.join('\n')
    const totalEvents = this.totalCnt
    const cHTTP = this.perLlCnt[LOG_LEVELS.http.idx]
    const cSQL = this.perLlCnt[LOG_LEVELS.SQL.idx]
    const dateElapsed = new Date(dateEnd - dateStart)
    return `${fileName}
-------------------------------

Started : ${FMT.formatDate(dateStart, 'dateTimeFull')}
Ended   : ${FMT.formatDate(dateEnd, 'dateTimeFull')}
Duration: ${dateElapsed.getUTCDate() - 1}.${dateElapsed.getUTCHours()}:${dateElapsed.getUTCMinutes()}:${dateElapsed.getUTCSeconds()}
Events  : ${FMT.formatNumber(totalEvents, 'numberGroup')}
Threads : ${userThreadsCnt}

Load average
------------------------------
HTTP Requests Per Second: ${FMT.formatNumber(Math.round(cHTTP / 2 / totalSeconds), 'numberGroup').padStart(3, ' ')}
SQL Query Per Second    : ${FMT.formatNumber(Math.round(cSQL / totalSeconds), 'numberGroup').padStart(3, ' ')}

Events
------------------
${llInfo}

Per thread events
-----------------
${threadsInfo}
`
  }

  /**
   * Return Line Date for lines starts with YYYYMMDD HHMMSSSSS
   *
   * @private
   * @param {string} l
   * @param {boolean} [asStr=false]
   * @param {boolean} [timeOnly=false]
   * @returns {string|Date}
   */
  _getTlLineTime (l, asStr = false, timeOnly = false) {
    const dtStr = `${l.substring(0, 4)}-${l.substring(4, 6)}-${l.substring(6, 8)}T${l.substring(9, 11)}:${l.substring(11, 13)}:${l.substring(13, 15)}.${l.substring(15, 17)}Z`
    const d = new Date(dtStr)
    if (!asStr) return d
    if (isNaN(d)) return ''
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset()) // shift timezone to get ISO string in "local" TZ
    const dateStr = d.toISOString().substring(0, 23) // remove Z
    return timeOnly ? dateStr.substring(11, 23) : dateStr
  }

  /**
   * Return Line Date for lines starts with Int64 in HEX (HiRes timer)
   *
   * @private
   * @param {string} l
   * @param {boolean} [asStr=false]
   * @param {boolean} [timeOnly=false]
   * @returns {string|Date}
   */
  _getHiResLineTime (l, asStr = false, timeOnly = false) {
    const delta = parseInt(l.substring(0, 16), 16)
    const d = new Date(this.startedAt + delta / this.hiResTimerFreq)
    if (!asStr) return d
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset()) // shift timezone to get ISO string in "local" TZ
    const dateStr = d.toISOString().substring(0, 23) // remove Z
    return timeOnly ? dateStr.substring(11, 23) : `${dateStr} ${delta}tix`
  }
}

/**
 * Retrieve list of available log files, returns array of files with it creation date, last modify date and size
 *
 * @returns {Promise<Array<{fn: string, startDate: Date, endDate: Date, size: number}>>}
 */
async function getLogFiles () {
  const resp = await UB.connection.get('/rest/log_view/logsList')
  const FN_RE = /(\d{8})_(\d{6})/ // ub_sedapp_8081_20210921_131039.log -> 20210921_131039, 20210921, 131039
  const files = resp.data.files.map(f => {
    const dateInFn = FN_RE.exec(f.fn)
    let startDate
    if (dateInFn) {
      const d = dateInFn[1]
      const h = dateInFn[2]
      startDate = new Date(`${d.substring(0, 4)}-${d.substring(4, 6)}-${d.substring(6, 8)}T${h.substring(0, 2)}:${h.substring(2, 4)}:${h.substring(4, 6)}`)
    }
    return {
      fn: f.fn,
      startDate,
      endDate: new Date(f.mtime),
      size: f.size
    }
  })
  files.sort((a, b) => b.endDate.getTime() - a.endDate.getTime()) // from newer to older
  return files
}

module.exports = {
  getLogFiles,
  LogParser,
  MAX_THREADS,
  LOG_LEVELS,
  LOG_LEVELS_MAP,
  LOG_LEVELS_CNT,
  TH_0
}
