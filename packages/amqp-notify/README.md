# @unitybase/amqp-notify

This package provides a client part of server-to-client notification implementation using stomp compatible message broker (verified with RabbitMQ only)

## Configuration

An amqpNotificationUrl option of uiSettings/adminUI section should be specified
This provides a URL compatible with web-stomp RabbitMQ plugin and should look like ```ws://127.0.0.1:15674/ws```
The implementation uses UnityBase users to connect to server, so it requires the server part to be configured as described in @unitybase/amqp package

Plase don't forget to create 'ub-amqp-notify' topic exchange before use!

## Examples

Look at the apps/notify-example sample application for complete notification example