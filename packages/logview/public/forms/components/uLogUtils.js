const UB = require('@unitybase/ub-pub')

/*
log line
20220916 14490144  ! auth  ....
 */
const MAX_THREADS = 64 + 2
const TH_0 = '!'.charCodeAt(0) // 33
const TH_POS = 19
const LOG_LEVELS = {
  unknown: { idx: 0,  bg: '#C0C0DC', fg: null, code: '??? ', label: '????   ', contentType: 'text/yaml' },
  info: { idx: 1,  bg: '#C0C0DC', fg: null, code: 'info  ', label: 'Info   ' },
  debug: { idx: 2,  bg: '#dcdcdc', fg: null, code: 'debug ', label: 'Debug  ' },
  trace: { idx: 3,  bg: '#dcdcdc', fg: null, code: 'trace ', label: 'Trace  ' },
  warn: { idx: 4,  bg: '#c08080', fg: null, code: 'warn  ', label: 'Warn   ' },
  error: { idx: 5,  bg: '#ff8080', fg: null, code: 'ERROR ', label: 'Error  ' },
  enter: { idx: 6,  bg: '#c0dcc0', fg: null, code: ' +    ', label: '-->    ' },
  leave: { idx: 7,  bg: '#c0dcdc', fg: null, code: ' -    ', label: '<--    ' },
  osErr: { idx: 8,  bg: '#f080c0', fg: null, code: 'OSERR ', label: 'OSError' },
  exc: { idx: 9,  bg: '#ff80c0', fg: null, code: 'EXC   ', label: 'Exc    ' },
  excOs: { idx: 10,  bg: '#f080c0', fg: null, code: 'EXCOS ', label: 'ExcOS  ' },
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

module.exports = {
  getLogFiles,
  parseLog,
  parseLine,
  getLineTime,
  buildMethodsTiming,
  MAX_THREADS,
  LOG_LEVELS,
  LOG_LEVELS_MAP,
  LOG_LEVELS_CNT,
  TH_POS,
  TH_0
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

function parseLog (txt, parsed, isPartial) {
  const perThCnt = new Array(MAX_THREADS).fill(0) // array of per thread event cont
  let totalCnt = 0
  const perLlCnt = new Array(LOG_LEVELS_CNT).fill(0) // array of per log level event cont
  const lines = txt.split('\n')
  console.time('parseLog')
  for (let i = 0, L = lines.length; i < L; i++) {
    parsed = parseLine(lines[i], 0, true)
    if (parsed.logLevel === LOG_LEVELS.unknown) continue
    if (parsed.th < 0 || parsed.th > MAX_THREADS) continue // do not contain thread num
    perThCnt[parsed.th]++
    perLlCnt[parsed.logLevel.idx]++
    totalCnt++
  }
  console.timeEnd('parseLog')
  return {
    lines,
    perThCnt,
    perLlCnt,
    totalCnt
  }
}

/**
 * Compute execution time for each Enter call
 *
 * @param {array<string>} lines
 * @param {number} enterCnt
 * @returns {array<{idx: number, th: number, time: number}>}
 */
function buildMethodsTiming (lines, enterCnt) {
  // we do not use parseLine here due to x5 performance reasons
  console.time('buildMethodsTiming')
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
            res[ri].time = calcExecutionTime(lines[i], lines[j])
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

function calcExecutionTime (b, e) {
  const s = e.substring(TH_POS + 2 + 6).trim().replaceAll('.', '') // 93.156.402 ss.ms.ns
  return parseInt(s, 10)
}
/**
 * Parse log line
 *
 * @param {string} l Log line
 * @param {number} [idx] optional line index
 * @param {boolean} [short=false] if true - parsed result contains only log level and thread (faster)
 * @returns {{txt, logLevel: {}, th: number, time: string, idx}}
 */
function parseLine (l, idx, short = false) {
  const res = { idx, time: '', logLevel: LOG_LEVELS.unknown, th: 0, txt: l }
  if (!l) return res
  if (l.charCodeAt(0) > 57 /* 9 */ || l.charCodeAt(0) < 48 /* 0 */) return res // not a date line
  const thN = l.charCodeAt(TH_POS) - TH_0
  if (thN < 0 || thN > MAX_THREADS) return res // do not contain thread num
  const evName = l.substring(TH_POS + 2, TH_POS + 2 + 6)
  const ll = LOG_LEVELS_MAP.get(evName)
  if (!ll) return res
  res.logLevel = ll
  res.th = thN
  if (!short) {
    res.time = getLineTime(l, true, true)
    res.txt = l.substring(TH_POS + 2 + 6)
  }
  return res
}

/**
 * Return Line Date
 *
 * @param {string} l
 * @param {boolean} [asStr=false]
 * @param {boolean} [timeOnly=false]
 * @returns {string|Date}
 */
function getLineTime (l, asStr = false, timeOnly = false) {
  const t = `${l.substring(9, 11)}:${l.substring(11, 13)}:${l.substring(13, 15)}.${l.substring(15, 17)}`
  const dateStr = timeOnly ? t : `${l.substring(0, 4)}-${l.substring(4, 6)}-${l.substring(6, 8)}T${t}Z`
  return asStr ? dateStr : new Date(dateStr)
}
