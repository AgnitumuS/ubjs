const TRedisClient = process.binding('synode_redis').TSMRedisClient

initialize(aServer, aPort)
commands(...args: string| number)
rawCommand(rawCmd: string)
property ioError: integer read getLastIOError;
property ioErrorText: string read getIOErrorText;

module.exports =