const fs = require('fs')
const path = require('path')

const filename = path.join(process.cwd(), 'CHANGELOG.md')
if (!fs.existsSync(filename)) process.exit(0)

const changedSectionRegex = /^## \[Unreleased\]\n(.*\n)+## \[[\d.]+\].*/gm
const verifyEmptySectionsRegex = /###\s.*\n[\t\s]*\n/g
const fileContent = fs.readFileSync(filename, 'utf-8')
const matched = fileContent.match(changedSectionRegex)
if (matched === null) process.exit(0)

const unreleasedSubstring = matched[0]
const unreleasedLine = '## [Unreleased]'
const typesOfChanges = [
  '### Added',
  '### Changed',
  '### Deprecated',
  '### Removed',
  '### Fixed'
]
const unreleasedSection = unreleasedLine.concat('\n', typesOfChanges.join('\n\n'), '\n\n')
const version = process.env.npm_package_version
const currentDateInFormat = new Date().toISOString().slice(0, 10)
const newUnreleasedSection = `${unreleasedSection}## [${version}] - ${currentDateInFormat}`
const updatedUnreleasedSection = unreleasedSubstring
  .replace(verifyEmptySectionsRegex, '')
  .replace(unreleasedLine, newUnreleasedSection)
const newFileContent = fileContent.replace(unreleasedSubstring, updatedUnreleasedSection)

fs.writeFileSync(filename, newFileContent)
