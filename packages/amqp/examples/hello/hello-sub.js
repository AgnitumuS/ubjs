const ubamqp = require('../.')

let conn = ubamqp.connect('amqp://127.0.0.1/')
let ch = conn.createChannel()
ch.declareQueue('hello')
let msg = ch.get('hello') || {}
console.log(msg)
console.log('Content as string:', msg.content.toString())
