# gzip / gunzip / bunzip support for server-side UB with JSZip compatible API

On server side can be used as a direct (and much faster) replacement for `jszip`.

In addition:
 - support opening a zip FILE (from file system path) for create/read/write. In this case zipped content
is written directly into file without addition memory consumption.
 - `.file` method can accept base64 encoded content - will be decoded before adding to zip
 - `.file` method can accept `path/to/existed/file` - will add passed file to ZIP using chunks (no addition memory consumption)

> For memory buffer compression speed is ~ 50Mb/s, decompression ~ 70Mb/s.
>
>In real life file adding/extraction speed is limited by HDD\SSD speed.

Example:
```javascript
const compressors = require('@unitybase/compressors');
const UZip = compressors.UZip
const uZip = new UZip('/some/file.zip')
uZip
.remove('file1251.txt')
.remove('file866.txt')
.file('newFile.txt', 'String file content', { type: 'string' })
.file('folder/fromBuf.txt', Buffer.from('String file content').toString('base64'), { base64: true })
.file('os-release.txt', '/etc/os-release', {isFilename: true})
.generate({
type: 'file',
filename: '/tmp/newArch.zip'
})
const readZ = new UZip('/tmp/newArch.zip')
const osVersion = readZ.file('os-release.txt').asText()
```
