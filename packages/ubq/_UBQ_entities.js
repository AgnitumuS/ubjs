/* eslint-disable camelcase,no-unused-vars,new-cap,no-undef,comma-dangle */
// This file is generated automatically and contain definition for code insight.
// It ignored by UnityBase server because name start from "_".
// Do not modify this file directly. Run `ucli createCodeInsightHelper --help` for details

/**
 * Task queue persisted into database
 * @version 5.0.6
 * @module @unitybase/ubq
 */

/**
 * Message queue
 * @extends EntityNamespace
 * @mixes mStorage
 */
class ubq_messages_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
ubq_messages_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Receivers determinate handler by this code. For each queCode must be receiver which handle it
  * @type {String}
  */
  queueCode: '',
 /**
  * Command for receiver. Contain JSON serialized object with command parameters. Command must contain attributes receiver understand
  * @type {String}
  */
  msgCmd: null,
 /**
  * Additional data for message. May contain Base64 encoded binary data
  * @type {String}
  */
  msgData: null,
 /**
  * Priority of messages. 1&#x3D;High, 0&#x3D;Low, default 1
  * @type {Number}
  */
  msgPriority: 0,
 /**
  * @type {Date}
  */
  completeDate: null,
 /**
  * Row owner -> uba_user
  * @type {Number}
  */
  mi_owner: 0,
 /**
  * Creation date
  * @type {Date}
  */
  mi_createDate: new Date(),
 /**
  * User who create row -> uba_user
  * @type {Number}
  */
  mi_createUser: 0,
 /**
  * Modification date
  * @type {Date}
  */
  mi_modifyDate: new Date(),
 /**
  * User who modify row -> uba_user
  * @type {Number}
  */
  mi_modifyUser: 0,
}
/**
* Message queue
* @type {ubq_messages_ns}
*/
const ubq_messages = new ubq_messages_ns()
/**
 * Scheduler run statistic
 * @extends EntityNamespace
 * @mixes mStorage
 */
class ubq_runstat_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
ubq_runstat_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {String}
  */
  appName: '',
 /**
  * @type {String}
  */
  schedulerName: '',
 /**
  * Time of start scheduler item
  * @type {Date}
  */
  startTime: new Date(),
 /**
  * Time of end scheduler item
  * @type {Date}
  */
  endTime: null,
 /**
  * Log from runned script about all actions
  * @type {String}
  */
  logText: null,
 /**
  * @type {Number}
  */
  resultError: null,
 /**
  * @type {String}
  */
  resultErrorMsg: null,
}
/**
* Scheduler run statistic
* @type {ubq_runstat_ns}
*/
const ubq_runstat = new ubq_runstat_ns()
/**
 * Schedulers
 * @extends EntityNamespace
 */
class ubq_scheduler_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
ubq_scheduler_ns.attrs = {
 /**
  * crc32(name)
  * @type {Number}
  */
  ID: 0,
 /**
  * Unique job name. Models will override a jobs with the same name in order models are listen in server configuration
  * @type {String}
  */
  name: '',
 /**
  * Expression to be evaluated during server startup. In case result is empty or evaluated to &#x60;true&#x60; job will be scheduled
  * @type {String}
  */
  schedulingCondition: null,
 /**
  * A cron for job as in unix systems. Format: &#39;Seconds(0-59) Minutes(0-59) Hours(0-23) DayOfMonth(1-31) Months(0-11) DayOfWeek(0-6)&#39;
  * @type {String}
  */
  cron: '',
 /**
  * Job description
  * @type {String}
  */
  description: null,
 /**
  * Name of function to be executed in a server context
  * @type {String}
  */
  command: null,
 /**
  * Name of module to require with scheduler job function as a default export
  * @type {String}
  */
  module: null,
 /**
  * If &#x60;1&#x60; - only single instance of a running job is allowed
  * @type {Boolean}
  */
  singleton: undefined,
 /**
  * A user name for a job execution
  * @type {String}
  */
  runAs: null,
 /**
  * If 1 (default) then successful job execution result will be logged into &#x60;ubq_runstat&#x60;, otherwise - only errors
  * @type {Boolean}
  */
  logSuccessful: undefined,
 /**
  * Indicate original job is overridden by other models
  * @type {Boolean}
  */
  overridden: undefined,
 /**
  * A model name where original job definition file is stored
  * @type {String}
  */
  originalModel: '',
 /**
  * A name of model where actual job definition file is stored. Can de not equal to &#x60;originalModel&#x60; if someone overrides the job
  * @type {String}
  */
  actualModel: '',
}
/**
* Schedulers
* @type {ubq_scheduler_ns}
*/
const ubq_scheduler = new ubq_scheduler_ns()
