# @unitybase/amqp

A RabbitMQ client for UnityBase
As UnityBase has synchronous nature, it is hard to even impossible to use existing RebbitMQ clients for node.js like amqplib. @unitybase/amqp client mimics amqplib interface as close as possible keeping different programming model in mind. Internally UB-AMQP uses rabbitmq-c library to connect to RabbitMQ.
Besides the library, this package provides a server-side implementation of the server-to-client notifier - it is provided as UBServerNofifier class. Client part of the notifier is provided as @unitybase/amqp-notify package

## Project Status

As for the moment (July 2018) @unitybase/amqp is ready for experimental use
Please note that not all tests are currently passing, but these tests are for extended use cases.
The library interface is rather stable in terms of the list of methods and number of arguments passed. But default values for parameters and internal implementation could vary from build to build.
SSL is also is not implemented currently

## UBServerNotifier configuration

There are some configuration options have to be turned in order to properly run the server-to-client notifier

  1. An amqpNotificationUrl option of application/customSettings section in ubConfig.json should be specified.
  This provides amqp compatible connection URL for server-side connection. It should look like ```amqp://user:pass@server/```
  The username and corresponding password here should be defined in primary auth backend in amqp compatible server (verified with RabbitMQ only)
  The user should be able to declare topic exchange and configure it, as well as publish messages to the exchange
  2. This package provides an auth backend which is compatible with RabbitMQ rabbitmq_auth_backend_http plugin
  This is a special implementation to support secure message routing to specific users managed within UnityBase
  It is not intended to be used as stand-alone auth backend as it does not provide any auth configuration tools
  In order to function properly, it is required to enable ```rabbitmq_auth_backend_http plugin``` in RabbitMQ and configure it according to the following example
  HTTP auth backend must be placed at the beginning of the list, followed by some another backend

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

## Examples

There are two examples of how to use this library are bundled
Please consider also to look into tests to see how the library can be used

### "Hello, World" example

This example shows how to connect, declare a queue, send and receive simple message using @unitybase/amqp library
Just try to start hello-sub.js in one terminal window first, then run hello-pub.js in another terminal window. Upon successful run of hello-pub.js script, you should see the "Hello, World!" message displayed in the window where hello-sub.js script is running.

### In-browser notification example

One of the reasons to use RabbitMQ is to establish server-to-client communication with guaranteed delivery. It is possible with RabbitMQ [web-stomp plugin](https://www.rabbitmq.com/web-stomp.html) and stomp client library (file stomp.js is bundled). This uses WebSockets as a delivery channel under the hood.

![Screenshot of in-browser notification example running](lib/ub-amqp_inbrowser-notify.png)