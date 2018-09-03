# Server-to-client notification sample

This is server-to-client notification sample application implemented using amqp/stomp compatible message broker, RabiitMQ in particular

## Prerequisites

RabbitMQ server must be up and running before running this example.
The following plugins must be enabled on the server:

- rabbitmq_auth_backend_http,
- rabbitmq_web_stomp

It is recommended to enable rabbitmq_management plugin also

Auth backends on the server must be configured according to @unitubase/amqp package README.md file

## Usage

- start ub
- open a web browser and point it to http://localhost:8881/ubadminui
- login with admin / admin or any other valid user
- open Notifier form from menu
- try to send and broadcast messages
