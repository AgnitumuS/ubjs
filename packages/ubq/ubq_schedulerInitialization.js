var
	GLOBAL_CACHE_INITIALIZED_ENTRY = 'UBQ.schedulersInitialized',
    Worker = require('@unitybase/base/worker'),
	w;

if (App.globalCacheGet(GLOBAL_CACHE_INITIALIZED_ENTRY)) return

if (process.startupMode === "CmdLine") {
    console.debug('SCHEDULER: disabled for command line startup');
} else if (App.serverConfig.application.schedulers && (App.serverConfig.application.schedulers.enabled === false) ) {
    console.warn('SCHEDULER: disabled in config');
} else {
    App.once('domainIsLoaded', startSchedulers);
}

/**
 * Read a schedulers configuration, calculate a apiKeys for all users and
 * pass a config to worker thread for starting
 */
function startSchedulers(){
    var cfgForWorker = [],
        usersApiKeys = {},
        canSchedule,
        /** @type {ubq_scheduler_object} */ item,
        /** @type {Array<ubq_scheduler_object>} */ schedulers,
        store;

    if (App.globalCacheGet(GLOBAL_CACHE_INITIALIZED_ENTRY)) {
        console.debug('SCHEDULER: UBQ.initializeSchedulers already executed');
        return;
    }

    App.globalCachePut(GLOBAL_CACHE_INITIALIZED_ENTRY, 'yes');
    console.debug('SCHEDULER: executing UBQ.initializeSchedulers');

    store = new TubDataStore('uba_user');
    schedulers = UB.Repository('ubq_scheduler').attrs('*').selectAsObject();
    for(var i = 0, l = schedulers.length; i < l; i++){
        item = schedulers[i];
        if (item.schedulingCondition){
            canSchedule = false;
            try {
                canSchedule = eval(item.schedulingCondition);
            }catch(e){
                console.error('SCHEDULER: Invalid scheduleCondition for item', item.name, 'Item DISABLED');
            }
            if (!canSchedule) {
                console.info('SCHEDULER: scheduleCondition for item', item.name, 'evaluated to false. Item DISABLED');
                continue;
            }
        }
        if (!usersApiKeys.hasOwnProperty(item.runAs)){
            store.runSQL('select uPasswordHashHexa from uba_user where name = :user: AND disabled=0', {user: item.runAs});
            if (!store.eof) {
                usersApiKeys[item.runAs] = store.get(0);
            }
        }
        if (!usersApiKeys[item.runAs]) {
            console.error('SCHEDULER: Task owner', item.runAs, 'not found in uba_user or it\'s apiKey are empty. Item', item.name, 'DISABLED');
            continue;
        }
        cfgForWorker.push({
            name: item.name,
            cron: item.cron,
            command: item.command,
            singleton: item.singleton,
            runAs: item.runAs,
            apiKey: usersApiKeys[item.runAs],
            logSuccessful: item.logSuccessful
        });
    }

    w =  new Worker({
        name: 'Scheduler',
        onmessage: runSchedulersCircle,
        onerror: onWorkerError
    });

    //MPV: in case engine expire worked MUST remain alive,
    // so we can't terminate it here
    // TODO - think what to do	
    //process.on('exit', function(){
    //    w.terminate();
    //});

    w.postMessage({serverURL: App.serverURL, config: cfgForWorker});
    console.debug('SCHEDULER: leave queueWorkerInitialization');
}

function onWorkerError(message, exception){
    console.error('SCHEDULER: ', message, exception);
}

/**
 * The Worker function. Function body is evaluated in the worker thread, so
 * reference from this function to anything from a module is NOT ALLOWED
 */
function runSchedulersCircle(message){
    var UBConnection = require('UBConnection');
    var serverURL = message.serverURL;
    var config = message.config;
    var jobs = [], job;

    function safeSendAsyncRequest(cfgIdx){
        try {
            var conn = new UBConnection(serverURL);
            var cfg = config[cfgIdx];
            conn.onRequestAuthParams = function(){
                return {authSchema: 'UB', login: cfg.runAs, apiKey: cfg.apiKey};
            };
            console.log('SCHEDULER: Job', cfg.name, 'started at', new Date());
            console.debug('Job defined as:', cfg);
            conn.xhr({
                endpoint: 'rest/ubq_messages/executeSchedulerTask',
                method: 'POST',
                URLParams: {async: true},
                data: {schedulerName: cfg.name, command: cfg.command, singleton: cfg.singleton == 1, logSuccessful: cfg.logSuccessful == 1} // jshint ignore:line
            });
        } catch (e){
            console.error(e);
        }
    }

    function cronJobStopped(cfgIdx){
        console.log('SCHEDULER: Job', config[cfgIdx].name, 'stopped');
    }

	console.debug('SCHEDULER: start initializeSchedulers..');

	var CronJob = require('node-cron').CronJob;

	console.debug('SCHEDULER: Got a init config %j', config);
    for(var i = 0, l = config.length; i < l; i++){
        console.debug('SCHEDULER: add a job for', config[i].name, 'scheduled as', config[i].cron);
        job = new CronJob(
            config[i].cron,
            safeSendAsyncRequest.bind(null, i),
            cronJobStopped.bind(null, i),
            true, /* Start the job right now */
            '' /* local timezone */
        );
        jobs.push(job);
    }
    global._timerLoop.setTimeoutWithPriority(
        function() {
                console.log('SCHEDULER: end timer loop');
            terminate();
        },
        0,
        1000
    )
}

