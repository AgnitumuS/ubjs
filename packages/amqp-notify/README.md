# @unitybase/amqp-notify

This package provides a server part of server-to-client notification implementation using stomp compatible message broker (verified with RabbitMQ only)
Look @unitybase/amqp-notifier-pub for client (browser) part

## Setup

```
npm install @unitybase/amqp-notify
```

## Configuration

There are some configuration options have to be turned in order to properly run the server-to-client notifier

  1. An `amqpNotificationUrl` option of `application/customSettings` section in application config (`ubConfig.json`) should be specified.
  This provides amqp compatible connection URL for server-side connection. It should look like ```amqp://user:pass@server/```
  A username and corresponding password here should be defined in primary auth backend in amqp compatible server (verified with RabbitMQ only)
  An 'ub-amqp-notify' topic exchange should be declared before use. The user provided in connection should be able to publish messages to the exchange
  2. This package provides an auth backend which is compatible with RabbitMQ rabbitmq_auth_backend_http plugin.
  It is implemented as a set of ednpoints to be regitered in your application.
  In order to use it you must place the next code in the initialization of some model inside your application

  ``` JavaScript
  require('@unitybase/amqp-notify')
  ```

  This is a special implementation to support secure message routing to specific users managed within UnityBase
  It is not intended to be used as stand-alone auth backend as it does not provide any auth configuration tools
  On the RebbitMQ side it is required to enable ```rabbitmq_auth_backend_http plugin``` and configure it according to the following example
  It is recommended to place HTTP auth backend at the beginning of the list, followed by some another backend

``` conf
# rabbitmq.conf
#
log.file.level = debug

## Authentication & authorization

# "http" is an alias for rabbit_auth_backend_http
# rabbitmq_auth_backend_http plugin must be enabled before use
auth_backends.1 = http
# "internal" is an alias for rabbit_auth_backend_internal
auth_backends.2 = internal

# See HTTP backend docs and @unitybase/amqp nodejs package docs for details
auth_http.http_method = post
auth_http.user_path = http://localhost:8881/amqp-auth-user
auth_http.vhost_path = http://localhost:8881/amqp-auth-vhost
auth_http.resource_path = http://localhost:8881/amqp-auth-resource
auth_http.topic_path = http://localhost:8881/amqp-auth-topic
```

This should be enough to send messages to specific users and broadcast messages with RabbitMQ server
Look at the apps/notify-example sample application for complete notification example

Plase don't forget to create 'ub-amqp-notify' topic exchange before use!

## Examples

Look at the apps/notify-example sample application for complete notification example