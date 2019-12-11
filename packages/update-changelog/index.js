const fs = require('fs')
const path = require('path')

const filename = path.join(process.cwd(), 'CHANGELOG.md')
if (fs.existsSync(filename)) {
  const version = process.env.npm_package_version
  const unreleasedLine = '## [Unreleased]'
  const unreleasedSection = `${unreleasedLine}\n\n`
  const fileLines = fs.readFileSync(filename, 'utf-8').split('\n')
  const newFileLines = fileLines.map((line, index) => {
    if (line === unreleasedLine && fileLines[index + 1] !== '') {
      const currentDateInFormat = new Date().toISOString().slice(0, 10)
      const lineToReplace = `${unreleasedSection}## [${version}] - ${currentDateInFormat}`
      return lineToReplace
    }
    return line
  })
  fs.writeFileSync(filename, newFileLines.join('\n'))
}
