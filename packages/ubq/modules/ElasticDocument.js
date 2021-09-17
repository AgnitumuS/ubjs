class ElasticDocument {
  constructor () {
    this.date = '01.01.2021'
    this.data = null
    this.rights = [111, 21, 321]
    this.documentName = 'Отчет'
    this.fileName = ''
    this.author = 'Иванов И.И,'
    this.entity = ''
    return this
  }
}
module.exports = ElasticDocument
