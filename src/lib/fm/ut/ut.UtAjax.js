/**
* Ajax class. 
*     var example_options = {
        url: 'http://...',
        method: 'GET',
        contentType: 'application/x-www-form-urlencoded',        
        params: [], // or: p1=v1&p2=v2 ...
        headers: {},
        auth: { // basic http auth
            username: '',
            password: ''
        },
        responseFormat: 'JSON',
        validResponseCodes: '200,201'        
    }
* 
* @class FM.UtAjax
* @extends FM.Object
* @param {object} config Options
*/    
FM.UtAjax = function() {    
    var me = this;        
    this._cb_onReadyStateChange = function() {        
        if(me.http.readyState == FM.UtAjax.AJAX_STATE_LOADEND) { // http ok                
            // timeout
            if(me.http.status == 0) {
                return me.fireEvent("onAjaxStateError",new FM.DmGenericError({
                    messageId: "1",
                    text: "Timeout or Access-Control-Allow-Origin is not allowed" 
                }));
            }   

            // deserijaliziraj rezultat ako je JSON
            var responseFormat = me.getAttr('responseFormat','TEXT');
            var responseObject = null;
            if(responseFormat == 'JSON') {
                responseObject = FM.unserialize(me.http.responseText,null);
                // neuspjela deserijalizacija
                if(responseObject == null) {
                    return me.fireEvent("onAjaxStateError",new FM.DmGenericError({
                        messageId: "1",
                        text: me.http.responseText != '' ? "Error: " + me.http.responseText : "Invalid response format"
                    }));
                }
            } else {
                responseObject = me.http.responseText;
            }
                
            // provjeri response status code (samo ako nema nikakvog povratnog teksta
            if(me.http.responseText == '') {
                var respCodesStr = FM.trim(me.getAttr('validResponseCodes',''));            
                var responseCodes = respCodesStr == '' ? [] : me.getAttr('validResponseCodes','').split(",");            
                var i;
                for(i=0;i < FM.sizeOf(responseCodes); i++) {
                    if(FM.trim(responseCodes[i]) == me.http.status) break;
                }
                if(i != 0 && i == FM.sizeOf(responseCodes)) {
                    return me.fireEvent("onAjaxStateError",new FM.DmGenericError({
                        messageId: "1",
                        text: "Invalid response code (found:" + me.http.status + ", expected:" + responseCodes + ")"
                    }));
                }
            }
            
            // ako sam stigsao do tu sve je ok
            return me.fireEvent(
                "onAjaxStateEnd",
                new FM.DmGenericValue({value: responseObject})
            );
        }
    }
   
    // pozovi konstruktor
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(FM.UtAjax,FM.Object); 

// properties
FM.UtAjax.prototype.objectSubClass = "";
FM.UtAjax.prototype.http = null;

// methods
FM.UtAjax.prototype._init = function(config) {            
    this._super("_init",config);
    this.objectSubClass = "UtAjax";

    this.http = null;
}

FM.UtAjax.prototype.send = function(args) {
    var url = this.getAttr('url','');
    var params = this.getAttr('params',{});
    var headers = this.getAttr('headers',{});

    
    var pline = "";
    /*
    if(FM.isObject(args)) {
        var val;
        for(var pname in params) {
            val = FM.getAttr(args,pname,'');
            pline = pline + (pline == "" ? "" : "&") + pname + "=" + encodeURIComponent(val);
        }
    }
    */
    if(FM.isObject(args)) {
        var val;
        for(var pname in args) {
            if(FM.isset(params[pname])) {
                val = FM.getAttr(args,pname,'');
                pline = pline + (pline == "" ? "" : "&") + pname + "=" + encodeURIComponent(val);
            }
        }
    }
    
    var callUrl = this.getAttr("method","POST") == 'POST' ? url : url + "?" + pline;
    this.http = FM.UtAjax.initHttpObject();
    if(this.http == null) {
        return this.fireEvent("onAjaxStateError",new FM.DmGenericError({
            messageId: "1",
            text: "Unable to init connection"
        }));
    }
    
    var auth = this.getAttr('auth',null);
    if(auth) {
        this.http.open(
            this.getAttr("method","POST"), 
            callUrl, true,
            this.getAttr('auth.username',''),this.getAttr('auth.password','')
        );
    } else {
        this.http.open(
            this.getAttr("method","POST"), 
            callUrl, true
        );                
    }
    
    if(this.getAttr("method","POST") == 'POST') {
        this.http.setRequestHeader(
            "Content-type", 
            this.getAttr('contentType',"application/x-www-form-urlencoded")
        );
        //this.http.setRequestHeader("Content-length", params.length);
        //this.http.setRequestHeader("Connection", "close");
    } else {
        this.http.setRequestHeader(
            "Content-type", 
            this.getAttr('contentType',"application/x-www-form-urlencoded")
        );        
    }
        
    if(FM.isset(headers) && headers) for(var hdr in headers) {
        this.http.setRequestHeader(hdr, headers[hdr]);
    }
    this.http.onreadystatechange = this._cb_onReadyStateChange;

    // posalji (ovo treba samo za POST, get ima parametre u url-u ali ne smeta)
    this.http.send(pline);

    // event
    return this.fireEvent("onAjaxStateStart",new FM.DmGenericValue({value: args}));
}     


// static
FM.UtAjax.className = "UtAjax";
FM.UtAjax.fullClassName = 'ut.UtAjax';

// mapiranje ajax resp
FM.UtAjax.AJAX_STATE_OPEN = 1;
FM.UtAjax.AJAX_STATE_SEND = 2;
FM.UtAjax.AJAX_STATE_LOADSTART = 3;
FM.UtAjax.AJAX_STATE_LOADEND = 4;

FM.UtAjax.initHttpObject = function() {
    var http = null;
    if(window.XMLHttpRequest && !(window.ActiveXObject)) {
        try {
            http = new XMLHttpRequest();
        } catch(e1) {
            http = null;
        }
    } else if(window.ActiveXObject) {
        try {
            http = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e2) {
            try {
                http = new ActiveXObject("MSXML2.XMLHTTP.3.0");
            } catch (e3) {
                try {
                    http = new ActiveXObject("Microsoft.XMLHTTP");

                } catch (e4) {
                    http = null;
                }
            }
        }
    }
    return(http);
}       


// == jobovi ===================================================================
/**
* Ayax class. 
* @class FM.UtAjaxJob
* @extends FM.Object
*/    
FM.UtAjaxJob = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(FM.UtAjaxJob,FM.Object); 

// properties
FM.UtAjaxJob.prototype.objectSubClass = "";
FM.UtAjaxJob.prototype.owner = null;
FM.UtAjaxJob.prototype.initParams = null;
FM.UtAjaxJob.prototype.callArguments = null;
FM.UtAjaxJob.prototype.ajaxConnector = null;
FM.UtAjaxJob.prototype.callTime = null;
FM.UtAjaxJob.prototype.runTime = 0;
FM.UtAjaxJob.prototype.endTime = 0;
FM.UtAjaxJob.prototype.finished = false;

FM.UtAjaxJob.prototype._init = function(oOwner,initParams,callArguments) {
    this._super("_init",callArguments);
    this.objectSubClass = "UtAjaxJob";            
    this.owner = oOwner;
    this.initParams = initParams;
    this.callArguments = callArguments;

    this.ajaxConnector = null;
    this.callTime = new Date().getTime();
    this.runTime = 0;
    this.endTime = 0;
    this.finished = false;
}

FM.UtAjaxJob.prototype.getThreadID = function() {
    return(this.owner.getID());
}

FM.UtAjaxJob.prototype.run = function() {
    this.finished = false;
    this.runTime = new Date().getTime();
    this.addListener(this.owner); // ??????
    this.ajaxConnector = new FM.UtAjax(this.initParams);
    this.ajaxConnector.addListener(this);
    this.ajaxConnector.send(this.callArguments);
    return(true);
}

FM.UtAjaxJob.prototype.stop = function() {
    this.finished = true;
    this.endTime = new Date().getTime();
}

FM.UtAjaxJob.prototype.discardJob = function(message) {
    this.stop();
    this.fireEvent("onAjaxStateError",message);
}

FM.UtAjaxJob.prototype.isJobOver = function() {
    return this.finished;
}

FM.UtAjaxJob.prototype.isJobTimeout = function() {
    return (this.callTime && new Date().getTime() - this.callTime > FM.UtAjaxJob.jobQueueTimeout);
}

FM.UtAjaxJob.prototype.isAjaxTimeout = function() {
    return (this.runTime && new Date().getTime() - this.runTime > FM.UtAjaxJob.jobTimeout);
}

FM.UtAjaxJob.prototype.isTimeout = function() {
    if(this.isJobOver()) return(false);
    return (this.isJobTimeout() || this.isAjaxTimeout());
}

FM.UtAjaxJob.prototype.onAjaxStateEnd = function(oAjax,response) {
    this.log("onAjaxStateEnd",response,FM.logLevels.info,this.getFullClassName());
    this.stop();
    this.fireEvent("onGetDataFromServer",{job: this, connection: oAjax, event: 'end', response: response});
    this.fireEvent("onAjaxStateEnd",response);
}

FM.UtAjaxJob.prototype.onAjaxStateError = function(oAjax,errmsg) {
    this.log("onAjaxStateError",errmsg,FM.logLevels.error,this.getFullClassName());
    this.fireEvent("onGetDataFromServer",{job: this, connection: oAjax, event: 'error', message: errmsg});
    this.discardJob(errmsg);
}

FM.UtAjaxJob.prototype.onAjaxStateStart = function(oAjax,data) {
    this.log("onAjaxStateStart",data,FM.logLevels.info,this.getFullClassName());
    this.fireEvent("onGetDataFromServer",{job: this, connection: oAjax, event: 'start', params: data});
    this.fireEvent("onAjaxStateStart",data);
}

// static
FM.UtAjaxJob.className = "UtAjaxJob";
FM.UtAjaxJob.fullClassName = 'ut.UtAjaxJob';
FM.UtAjaxJob.timer = null;
FM.UtAjaxJob.jobQueueTimeout = 60000; // 60 sec
FM.UtAjaxJob.jobTimeout = 20000; // 20 sec
FM.UtAjaxJob.jobMaxTrhreads = 3;
FM.UtAjaxJob.jobList = {}; // {id1: [j1,j2, ..], id2: [...], ...}
FM.UtAjaxJob.threadsList = []; // jobovi

// id je ovdje obj.getID() - to osigurava da jedna dmklasa vrti samo jedan
// job u neko vrijeme, i da istovremeno se vrte najvise x jobova        
FM.UtAjaxJob.addToQueue = function(job) {
    if(FM.UtAjaxJob.timer) {
        clearTimeout(FM.UtAjaxJob.timer);
        FM.UtAjaxJob.timer = null;
    }

    // dodaj job u listu
    if(!FM.isset(FM.UtAjaxJob.jobList[job.getThreadID()])) {
        FM.UtAjaxJob.jobList[job.getThreadID()] = [];
    }

    var jlist = FM.UtAjaxJob.jobList[job.getThreadID()];
    jlist.push(job);

    // odmah kreni u run
    FM.UtAjaxJob.__checklist__();

    // kraj
    return true;
}

FM.UtAjaxJob.__checklist__ = function() {
    // iskljuci tajmer ako radi da ne ulijecemou procesiranje tokom rada
    if(FM.UtAjaxJob.timer) {
        clearTimeout(FM.UtAjaxJob.timer);
        FM.UtAjaxJob.timer = null;
    }

    var i,job,idlist,id;

    // waiting list
    var njoblist = {};    
    for(id in FM.UtAjaxJob.jobList) {
        idlist = FM.UtAjaxJob.jobList[id];

        // iz svake liste samo jedan kandidat
        var nidlist = [];
        for(i=0; i < idlist.length; i++) {
            job = idlist[i];
            if(job.isTimeout()) {
                job.discardJob("Timeout.");
            } else if(!job.isJobOver()) {
                nidlist.push(job);
            }
        }
        if(nidlist.length > 0) {
            njoblist[id] = nidlist;
        }
    }
    FM.UtAjaxJob.jobList = njoblist;

    // running list
    var nlist = [];
    for(i=0; i < FM.UtAjaxJob.threadsList.length; i++) {
        job = FM.UtAjaxJob.threadsList[i];

        // provjeri timeoute
        if(job.isTimeout()) {
            job.discardJob("Timeout.");
        }
        if(!job.isJobOver()) {
            nlist.push(job);
        }
    }
    FM.UtAjaxJob.threadsList = nlist;

    // sad imamo listu osvjezenu
    // ako ima mjesta pokreni novi job
    if(FM.UtAjaxJob.threadsList.length <  FM.UtAjaxJob.jobMaxTrhreads) {
        var numnext = FM.UtAjaxJob.jobMaxTrhreads - FM.UtAjaxJob.threadsList.length;
        var nextJobs = [];
        for(id in FM.UtAjaxJob.jobList) {
            idlist = FM.UtAjaxJob.jobList[id];

            // iz svake liste samo jedan kandidat
            var njob = null;
            for(i=0; i < idlist.length; i++) {
                job = idlist[i];
                if(job.runTime == 0 && (njob == null || njob.callTime > job.callTime)) njob = job;
            }

            if(njob != null) {
                if(nextJobs.length < numnext) {
                    nextJobs.push(job);
                } else {
                    nextJobs.sort(function(j1,j2) {
                        return(j1.callTime - j2.callTime);
                    });
                    if(job.calltime < nextJobs[nextJobs.length-1].calltime) {
                        nextJobs[nextJobs.length-1] = job;
                    }
                }
            }
        }

        // dodaj nove jobove i pokreni ih
        for(i=0; i < nextJobs.length; i++) {
            job = nextJobs[i];
            FM.UtAjaxJob.threadsList.push(job);
            job.run();
        }
    }

    if(!FM.UtAjaxJob.timer && FM.UtAjaxJob.threadsList.length > 0) {
        setTimeout("FM.UtAjaxJob.__checklist__()",2000);
    }
}
