const ubamqp = require('../..')

let conn = ubamqp.connect('amqp://127.0.0.1:5672/')
let ch = conn.createChannel()
ch.declareQueue('hello')
ch.publish('', 'hello', 'Hello, World!')
