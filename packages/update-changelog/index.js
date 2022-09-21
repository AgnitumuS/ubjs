const fs = require('fs')
const path = require('path')
const normalizeVersion = require('./normalize-version')

updateChangelog(process.env.npm_package_version)
renameFolderUnreleased(process.env.npm_package_version)

/**
 * Update [Unreleased] in CHANGELOG.md to current package version and add a new Unreleased section at the top
 *
 * @param {string} version
 */
function updateChangelog (version) {
  const filename = path.join(process.cwd(), 'CHANGELOG.md')
  if (!fs.existsSync(filename)) return

  const changedSectionRegex = /^## \[Unreleased\]\r?\n(.*\r?\n)+## \[[\d.]+\].*/gm
  const verifyEmptySectionsRegex = /###\s.*\r?\n[\t\s]*\r?\n/g
  const fileContent = fs.readFileSync(filename, 'utf-8')
  const matched = fileContent.match(changedSectionRegex)
  if (matched === null) return

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
  const currentDateInFormat = new Date().toISOString().slice(0, 10)
  const newUnreleasedSection = `${unreleasedSection}## [${version}] - ${currentDateInFormat}`
  const updatedUnreleasedSection = unreleasedSubstring
    .replace(verifyEmptySectionsRegex, '')
    .replace(unreleasedLine, newUnreleasedSection)
  const newFileContent = fileContent.replace(unreleasedSubstring, updatedUnreleasedSection)

  fs.writeFileSync(filename, newFileContent)
}

/**
 * Rename folder _migrate/unreleased to _migrate/[normalized version]
 *
 * @param {string} version
 */
function renameFolderUnreleased (version) {
  const folderName = path.join(process.cwd(), '_migrate', 'unreleased')
  const newFolder = path.join(process.cwd(), '_migrate', normalizeVersion(version))

  if (fs.existsSync(folderName) && !fs.existsSync(newFolder)) {
    try {
      fs.renameSync(folderName, newFolder)
    } catch (e) {
      throw new Error(`Unable to rename ${folderName} to ${newFolder}: ${e}`)
    }
  }
}
