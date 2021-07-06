const fs = require('fs')
const os = require('os')
const path = require('path')

/**
 * Read fn file as buffer (strings in JS limited to 2^28-1 bytes) and extract content of XML tag into temp files,
 * replacing tag content by file://teml/file/name.
 *
 *  - content of single tag (one attachment) theoretically limited to 268_435_455 bytes (after decoding from base64)
 *  - Buffer.slice used to prevent addition memory allocations
 *  - base64 content written to the temp files to give GC a chance to free memory ASAP
 *  - caller should read files one-by-one to prevent OutOfMemory
 *
 *  <DocTransfer type="pdf" description="Документ_547247(1).pdf" idnumber="778443">VeryLongBase64content</DocTransfer>
 *
 *  will become
 *  <DocTransfer type="pdf" description="Документ_547247(1).pdf" idnumber="778443">file:///tmp/{4E46AB3C-B1E8-40CD-A2FF-9E1696966923}.base64</DocTransfer>
 *
 * @param {string} fn file name to extract tags content from
 * @param {string} [tag=DocTransfer] Name of tag with content
 * @return {string} XML with tag content replaced with temp file names
 */
function extractFilesFormPackage(fn, tag = 'DocTransfer') {
  const CT = '>'.charCodeAt(0)
  const TAG_OPEN_PATTERN = Buffer.from('<' + tag)
  const TAG_CLOSE_PATTERN = Buffer.from('</' + tag + '>')

  const d = fs.readFileSync(fn) // read fle as Buffer
  console.debug('Start extracting content from file', fn, 'of', d.byteLength, 'byte length')
  const L = d.byteLength

  let clearXml = ''
  let openedIdx = d.indexOf(TAG_OPEN_PATTERN)
  let prevDtEnds = 0
  while (openedIdx !== -1) {
    let dataStartIdx = openedIdx + TAG_OPEN_PATTERN.byteLength // end of <DocTransfer ... >
    while ((d[dataStartIdx] !== CT) && (dataStartIdx < L)) dataStartIdx++ // start of base64 (end of <DocTransfer ...> opened tag)
    if (dataStartIdx === L) throw new Error(`Invalid XML: tag at ${openedIdx} is not closed`)
    const dataEndIdx = d.indexOf(TAG_CLOSE_PATTERN, dataStartIdx + 1)
    if (dataEndIdx === -1) throw new Error(`Invalid XML: no matching </${tag}> for tag opened at ${openedIdx}`)
    const bfn = path.join(os.tmpdir(), global.createGuid() + '.base64')
    let fileContent = null
    if (dataEndIdx < dataStartIdx + 2) { // empty content
      fileContent = null
    } else {
      fileContent = d.slice(dataStartIdx + 1, dataEndIdx - 1)
      fs.writeFileSync(bfn, fileContent, { encoding: 'bin' })
      console.debug('' + fileContent.byteLength, 'bytes extracted starts from', openedIdx, 'into', bfn)
    }
    fileContent = undefined // give GC a chance to free memory ASAP
    // replace <DocTransfer ...>base64content</DocTransfer> -> <DocTransfer ..>NAME_OF_TMP_FILE</DocTransfer>
    console.debug(`Add ${dataStartIdx - prevDtEnds + 1} bytes to result XML`)
    clearXml += d.slice(prevDtEnds, dataStartIdx + 1).toString('utf8') + 'file://' + bfn + `</${tag}>\n`
    prevDtEnds = dataEndIdx + TAG_CLOSE_PATTERN.byteLength
    openedIdx = d.indexOf(TAG_OPEN_PATTERN, openedIdx + 1)
  }
  console.debug('Add XML tail of', L - prevDtEnds, 'bytes')
  clearXml += d.slice(prevDtEnds).toString('utf8')
  return clearXml
}
const clearXML = extractFilesFormPackage('/tmp/ub.xml', 'DocTransfer')
//console.log(clearXML)
