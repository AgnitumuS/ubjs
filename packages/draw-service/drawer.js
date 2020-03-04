const PImage = require('pureimage')
const PNG = require('pngjs').PNG
const uint32 = require('pureimage/src/uint32')
const opentype = require('opentype.js')

module.exports.drawPicture = drawPicture
let fontPath = process.env.FONT || './fonts/times.ttf'
let fnt = PImage.registerFont(fontPath, 'Times New Roman')
// dirty hack to load font synchronously
let opFont = opentype.loadSync(fontPath)
fnt.loaded = true
fnt.font = opFont

/**
 * @typedef {object} DrawTextCommand
 * @property {string} [type='text'] Command type. Can be 'text' or 'png'
 * @property {number} [fontSize] Optional font size (in pt)
 * @property {string} [fillStyle] Optional fillStyle (as in CSS)
 * @property {number} [x=0] Optional X coordinate (upper left based)
 * @property {number} [y] Optional Y coordinate. If omitted - will be
 *  calculated as relative to previous command end Y. For a first command will be
 *  - 0 for 'png' command
 *  - fontSize for 'text' command
 * @property {string} value For 'text' command - text to draw, for 'png' - base64 encoded png to draw
 */

/**
 * @typedef {object} DrawImgCommand
 * @property {string} type Command type. Can be 'png' or 'rect'
 * @property {string} [fillStyle] Optional fillStyle (as in CSS). If passed for `rect` command - rect will be filled
 * @property {number} [x=0] Optional X coordinate (upper left based)
 * @property {number} [y] Optional Y coordinate. If omitted - will be
 *  calculated as relative to previous command end Y. For a first command will be
 *  - 0 for 'png' command
 *  - fontSize for 'text' command
 * @property {number} [maxWidth] In case original image width is bigger when maxWidth stretch it to maxWidth.
 *   For `rect` - rect width
 * @property {number} [maxHeight] In case original image height is bigger when maxHeight stretch it to maxHeight.
 *   For `rect` - rect height
 * @property {string} [value] For 'png' - base64 encoded png to draw. For `rect` - ignored
 */

/**
 * @typedef {object} DrawProgram
 * @property {number} imgWidth Resulting image width
 * @property {number} imgHeight Resulting image height
 * @property {string} [fillStyle='#000000'] Text color as in CSS
 *  - either RGB '#AABBCC'
 *  - or mnemonic 'red'
 *  - or rgb(0, 255, 0)
 * @property {number} [fontSize=22] Default font size (in pt)
 * @property {array<DrawTextCommand|DrawImgCommand>} commands Commands to execute
 */
/**
 * Execute a serious of draw commands. Return PNG picture
 * @param {DrawProgram} prog
 * @return {Buffer}
 */
function drawPicture (prog) {
  let img = PImage.make(prog.imgWidth, prog.imgHeight, null)
  let ctx = img.getContext()
  let defaultFillStyle = prog.fillStyle || '#000000'
  ctx.fillStyle = defaultFillStyle
  let defaultFontSize = prog.fontSize || 22

  if (prog.commands.length) {
    let lineHeight = prog.fontSize || defaultFontSize
    let currentY = (prog.commands[0].y ||
      // text coordinate starts from upper left
      (prog.commands[0].type === 'text' ? lineHeight : 0))
    prog.commands.forEach(cmd => {
      if (cmd.y) currentY = cmd.y
      ctx.fillStyle = cmd.fillStyle || defaultFillStyle
      if (!cmd.type || (cmd.type === 'text')) {
        lineHeight = cmd.fontSize || defaultFontSize
        ctx.font = `${lineHeight}pt 'Times New Roman'`
        const textMaxWidth = cmd.maxWidth && cmd.maxWidth < prog.imgWidth ? cmd.maxWidth : prog.imgWidth
        currentY = wrapText(ctx, cmd.value, cmd.x || 0, currentY, textMaxWidth, lineHeight + 5)
      } else if (cmd.type === 'png') {
        let imgBinary = Buffer.from(cmd.value, 'base64')
        let png = PNG.sync.read(imgBinary)
        let signImg = bitmapFromPNG(png)
        let dWidth = cmd.maxWidth && signImg.width > cmd.maxWidth ? cmd.maxWidth : signImg.width
        let dHeight = cmd.maxHeight && signImg.height > cmd.maxHeight ? cmd.maxHeight : signImg.height
        ctx.drawImage(signImg,
          0, 0, signImg.width, signImg.height, // source dimensions
          cmd.x || 0, currentY, dWidth, dHeight // destination dimensions
        )
        currentY += signImg.height
      } else if (cmd.type === 'rect') {
        if (cmd.fillStyle) {
          ctx.fillRect(cmd.x || 0, currentY, cmd.maxWidth, cmd.maxHeight)
        } else {
          ctx.rect(cmd.x || 0, currentY, cmd.maxWidth, cmd.maxHeight)
        }

        currentY += cmd.maxHeight
      } else {
        throw new Error(`Unknown command type ${cmd.type}`)
      }
    })
  }
  return pngFromBitmap(img)
}

function bitmapFromPNG (png) {
  let bitmap = PImage.make(png.width, png.height, null)
  for (let i = 0, L = bitmap.data.length; i < L; i++) {
    bitmap.data[i] = png.data[i]
  }
  return bitmap
}

function pngFromBitmap (bmp) {
  let png = new PNG({
    width: bmp.width,
    height: bmp.height
  })

  for (let i = 0, W = bmp.width; i < W; i++) {
    for (let j = 0, H = bmp.height; j < H; j++) {
      let rgba = bmp.getPixelRGBA(i, j)
      let n = (j * bmp.width + i) * 4
      let bytes = uint32.getBytesBigEndian(rgba)
      for (var k = 0; k < 4; k++) {
        png.data[n + k] = bytes[k]
      }
    }
  }
  return PNG.sync.write(png)
}

/**
 *
 * @param {Context} ctx Cnavas2d context
 * @param {string} text Text to output. Cna contains \n as line delimiter
 * @param {number} x Horizontal position to output (upper left based)
 * @param {number} y Vertical position to output (upper left based)
 * @param {number} maxWidth Max width
 * @param {number} lineHeight
 * @return {number} TExt end vertical position
 */
function wrapText (ctx, text, x, y, maxWidth, lineHeight) {
  let lines = text.split('\n')
  lines.forEach((line) => {
    y = printLine(line, y)
  })
  function printLine (lineText, yP) {
    let words = lineText.split(' ')
    let line = ''

    for (let n = 0, L = words.length; n < L; n++) {
      let testLine = line + words[n] + ' '
      let metrics = ctx.measureText(testLine)
      let testWidth = metrics.width
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, yP)
        line = words[n] + ' '
        yP += lineHeight
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, x, yP)
    return yP + lineHeight
  }
  return y
}
