isStr = false
const dateStr= '2020-01-01T00:00Z'
const d = new Date(dateStr)
console.log('date as Date', d)
const dateAsTime = d.getTime()
console.log('date as Time', d)

let v = isStr ? dateStr : dateAsTime
console.time('dconv')
for(let i=0; i < 1000000; i++) {
  let td = new Date(v)
}
console.timeEnd('dconv')

