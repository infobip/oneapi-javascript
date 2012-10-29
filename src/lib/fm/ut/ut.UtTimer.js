/**
* Timer job class. 
* @class FM.UtTimerJob
* @extends FM.Object
* @param {String} event Event to send
* @param {any} evdata Data to send with event
* @param {number} period Period in secconds
* @param {number} executecount
*/    
FM.UtTimerJob = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(FM.UtTimerJob,FM.Object); 

// properties
FM.UtTimerJob.prototype.objectSubClass = "";
FM.UtTimerJob.prototype.event = '';
FM.UtTimerJob.prototype.evdata = null;
FM.UtTimerJob.prototype.period = -1;
FM.UtTimerJob.prototype.executecount = -1;
FM.UtTimerJob.prototype.suspended = false;
FM.UtTimerJob.prototype.started = false;
FM.UtTimerJob.prototype.lastRun = 0;

FM.UtTimerJob.prototype._init = function(event,evdata,period,executecount) {
    this.objectSubClass = "UtTimerJob";
    this.event = '';
    this.evdata = null;
    this.period = -1;
    this.executecount = -1;
    this.suspended = false;
    this.started = false;
    this.lastRun = 0;

    this._super("_init",evdata);

    this.event = event;
    this.evdata = evdata;
    this.period = period < FM.UtTimer.minPeriod ? FM.UtTimer.minPeriod : period;
    this.executecount = FM.isset(executecount) ? executecount : -1;
    this.suspended = false;
    this.started = false;
    this.lastRun = 0;
}

FM.UtTimerJob.prototype.start = function() {
    this.started = true;
    FM.UtTimer.jobsList.push(this);
    if(!FM.UtTimer.timeoutHandle) {
        FM.UtTimer.__checklist__();
    }
}

FM.UtTimerJob.prototype.isStarted = function() {
    return this.started;
}

FM.UtTimerJob.prototype.isSuspended = function() {
    return this.suspended;
}

FM.UtTimerJob.prototype.suspend = function() {
    this.suspended = true;
}

FM.UtTimerJob.prototype.resume = function() {
    if(!this.isStarted()) this.start();
    this.suspended = false;
}

FM.UtTimerJob.prototype.dispose = function() {    
    FM.UtTimer.suspended = true;
    
    this.suspended = true;
    this.started = false;
    
    var nlist = [];
    for(var i=0; i < FM.UtTimer.jobsList.length; i++) {
        if(FM.UtTimer.jobsList[i] != this) {
            nlist.push(FM.UtTimer.jobsList[i]);
        }
    }
    FM.UtTimer.jobsList = nlist;
    
    this.removeAllListeners();
    
}

// static
FM.UtTimerJob.className = "UtTimerJob";
FM.UtTimerJob.fullClassName = 'ut.UtTimerJob';


/**
* Timer class. <b>Ovo bi trebalo srediti da extend FM.object</b>
* @class FM.UtTimer
*/
FM.UtTimer = function() {
    //this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(FM.UtTimer,null); 

// properties
FM.UtTimer.prototype.objectSubClass = "UtTimer";

// static
FM.UtTimer.className = "UtTimer";
FM.UtTimer.fullClassName = 'ut.UtTimer';

FM.UtTimer.minPeriod = 1;
FM.UtTimer.timeoutHandle = null;
FM.UtTimer.jobsList = [];
FM.UtTimer.suspended = false;

FM.UtTimer.__checklist__ = function() {
    if(!FM.UtTimer.suspended) {
        var nlist = [];
        for(var i=0; i < FM.UtTimer.jobsList.length; i++) {
            var job = FM.UtTimer.jobsList[i];
            if(
                job.executecount != 0 && job.suspeded != false &&
                job.lastRun + job.period * 1000 < new Date().getTime()
            ) {
                job.lastRun = new Date().getTime();
                job.executecount--;
                if(job.executecount != 0) nlist.push(job);
                job.fireEvent(job.event, job.evdata);
            } else {
                if(job.executecount != 0) nlist.push(job);
            }
        }
        FM.UtTimer.jobsList = nlist;

        if(FM.UtTimer.jobsList.length > 0) {
            FM.UtTimer.timeoutHandle = setTimeout("FM.UtTimer.__checklist__()",FM.UtTimer.minPeriod * 1000);
        }else {
            FM.UtTimer.timeoutHandle = null;
        }
    } else { // za svaki slucaj
        FM.UtTimer.timeoutHandle = null;
    }
}

FM.UtTimer.suspendQueue = function() {
    FM.UtTimer.suspended = true;
}

FM.UtTimer.resumeQueue = function() {
    FM.UtTimer.suspended = false;
    FM.UtTimer.__checklist__();
}
