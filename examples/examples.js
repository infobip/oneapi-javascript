function getArgs() {
    return decodeURIComponent(window.location.search.slice(1))
    .split('&')
    .reduce(function _reduce (a,b) {
        b = b.split('=');
        a[b[0]] = b[1];
        return a;
    }, {});    
}

// log messages and results 
function log(msg) {
    var chnode = document.createElement('div');
    
    chnode.innerHTML = msg;
    document.getElementById('log').appendChild(chnode);
}


function initApi() {
    // init API library                
    log("Initializing the OneAPI library ...")
    
    // example: initialize-sms-client
    // Set proxy script URL
    OA.setProxy("/proxy/cdproxy.php");
    
    // Call init method
    if(!oneapi.init()) {
        // Handle errors
        // ...
        log("Error: Unable to init OneAPI library"); // example-ignore
        return false; // example-ignore
    } else {
        // Init sucessfull
        log("Init successful.");  // example-ignore
    }
    // -- end of example initialize-sms-client
    return true;
}

function initApi_dataClientExample() {
    // init API library                
    log("Initializing the OneAPI library ...")
    
    // example: data-connection-client
    // Set proxy script URL
    OA.setProxy("/proxy/cdproxy.php");
    
    // Call init method
    if(!oneapi.init()) {
        // Handle errors
        // ...
        log("Error: Unable to init OneAPI library"); // example-ignore
        return false; // example-ignore
    } else {
        // Init sucessfull
        log("Init successful.");  // example-ignore
    }
    // -- end of example data-connection-client
    return true;
}

function loginExample(sUserName,sUserPassword) {
    // example: login-sms-client    
    oneapi.login(sUserName,sUserPassword,function(isOk,oResponse) {                    
        if(!isOk) { // oResponse is DmApiError
            // Handle error
            // alert('Unable to login:' + oResponse.getErrorText());
            log("Error: Unable to login:" + oResponse.getErrorText()); // example-ignore
        } else { // oResponse is DmUserCredentials
            log("Login successful."); // example-ignore
            // Check user credentials or call other API methods
            if(!oResponse.isVerified()) { // Check if user is verified
                // alert("Please verify your account."); 
                log("Warning: Please verify your account."); // example-ignore
            } 
        }
    });
    // -- end of example login-sms-client    
}

// get and display customer profile of current user
function getCustomerProfileExample() {
    oneapi.getCustomerProfile('me',function(isOk,oResponse) {
        if(!isOk) { // oResponse is DmApiError
            log("Error: Unable to get Customer profile:" + oResponse.getErrorText());            
        } else { // oResponse is DmCustomerProfile
            log("Customer profile for <b>" + oResponse.getAttr("username","") + '</b> :');                        
            oResponse.forEachAttr(function(name,value) { // display all attributes of customer profile
                log(name + " = " + value);
                return true;
            });                        
            log("Done.");
        }
    });
}

// get and display account balance of current user
function getAccountBalanceExample() {
    oneapi.getAccountBalance(function(isOk,oResponse) {
        if(!isOk) { // oResponse is DmApiError
            log("Error: Unable to get account balance:" + oResponse.getErrorText());
        } else { // oResponse is DmAccountBalance
            log("Customer balance is <b>" + oResponse.getAttr("balance","") + '</b> (<b>' + oResponse.getAttr("currency.symbol","?") + "</b>)");
            log("Done.");
        }
    });
}

// setup MO trial 
function moFreeTrial() {
    if(notifyURL == 'REPLACE_WITH_NOTIFY_URL') {
        notifyURL = prompt("Your notification URL is unspecified.\nEnter URL or change config.js and run example again",'');
    }
    log("Notifications will be pushed to <b>" + notifyURL + "<b>");
    
    // example: mo-free-trial
    oneapi.getFreeTrialNumber(notifyURL,function(isOk,oResponse) { 
        if(!isOk) { // oResponse is DmApiError
            // Handle error
            // alert('Unable to setup free trial: ' + oResponse.getErrorText());                            
            log("Error: Unable to setup free trial:" + oResponse.getErrorText()); // example-ignore
        } else { // oResponse is array of DmInboundMessage objects
            log("list:"); // example-ignore
            for(var i=0; i < oResponse.length; i++) {
                // ...
                log('' + i + ')'); // example-ignore
                oResponse[i].forEachAttr(function(name,value) { // example-ignore
                    log(" " + name + ":" + value); // example-ignore
                    return true; // example-ignore
                }); // example-ignore
            }
            log("Done."); // example-ignore
        }
    });
    // -- end of example mo-free-trial
}


// list of free MO numbers
function getAvailableNumbersToBuy() {
    if(countryId == 'REPLACE_WITH_COUNTRY_ID') {
        countryId = prompt("Your country Id is unspecified.\nEnter country Id or change config.js and run example again",'');
    }
    if(moKeyword == 'REPLACE_WITH_MO_CRITERIA') {
        moKeyword = prompt("Your MO criteria is unspecified.\nEnter MO criteria or change config.js and run example again",'');
    }
    log("Search  av. numbers for criteria = <b>" + moKeyword + "</b> and countryId = <b>" + countryId + "</b>");
    
    
    // example: mo-buy-mo-number
    oneapi.getAvailableNumbersToBuy(countryId,
        null,null,moKeyword,null,null,null,    
        function(isOk,oResponse) { 
        if(!isOk) { // oResponse is DmApiError
            // Handle error
            // alert('Unable to get list of MO numbers: ' + oResponse.getErrorText());                            
            log("Error: Unable to get list of MO numbers:" + oResponse.getErrorText()); // example-ignore
        } else { // oResponse is array of DmInboundMessage objects
            log("list:"); // example-ignore
            for(var i=0; i < oResponse.length; i++) {
                // ...
                log('' + i + ')'); // example-ignore
                oResponse[i].forEachAttr(function(name,value) { // example-ignore
                    log(" " + name + ":" + value); // example-ignore
                    return true; // example-ignore
                }); // example-ignore
            }
            log("Done."); // example-ignore
        }
    });
    // -- end of example mo-buy-mo-number
}


// get list of MO subscriptions
function retrieveInboundMessagesExample() {
    // example: retrieve-inbound-messages    
    oneapi.retrieveInboundMessages(1,99,function(isOk,oResponse) { 
        if(!isOk) { // oResponse is DmApiError
            // Handle error
            // alert('Unable to retrieve inbound messages: ' + oResponse.getErrorText());                            
            log("Error: Unable to retrieve inbound messages:" + oResponse.getErrorText()); // example-ignore
        } else { // oResponse is array of DmInboundMessage objects
            log("Inbound messages list:"); // example-ignore
            for(var i=0; i < oResponse.length; i++) {
                // ...
                log('' + i + ')'); // example-ignore
                oResponse[i].forEachAttr(function(name,value) { // example-ignore
                    log(" " + name + ":" + value); // example-ignore
                    return true; // example-ignore
                }); // example-ignore
            }
            log("Done."); // example-ignore
        }
    });
    // -- end of example retrieve-inbound-messages
}

// send hlr for gsm number of current user
function sendHlrExample(oProfile) {
    if(oProfile.getAttr('gsm','') == '') {
        oProfile.setAttr('gsm',
            prompt("Your profile GSM number is unspecified.\nEnter GSM number",oProfile.getAttr('gsm',''))
        );                    
    }
    log("Check roaming status of GSM number <b>" + oProfile.getAttr("gsm","") + '</b>');
    // example: retrieve-roaming-status
    // Query roaming status of GSM number from CustomerProfile 
    oneapi.retrieveRoamingStatus(
        oProfile.getAttr("gsm"),null,null, null, null,
        function(isOk,oResponse) {
            if(!isOk) { // oResponse is DmApiError
                // Handle error
                // alert('Unable to query roaming status: ' + oResponse.getErrorText());                
                log("Error: Unable to check roaming status of your GSM:" + oResponse.getErrorText()); // example-ignore
            } else { // oResponse DmTerminalRoamingStatus
                // Handle response
                // alert("Status is " + oResponse.getAttr('retrievalStatus','unknown'));
                log( "Done. retrievalStatus is <b>" + oResponse.getAttr('retrievalStatus','unknown') +  // example-ignore
                    "</b>, resource URL is <b>" + oResponse.getDataID() + "<b>" // example-ignore
                );// example-ignore
            }
        }
    );
    // -- end of example retrieve-roaming-status
}

// send hlr for gsm number of current user
function sendHlr_notifyExample(oProfile,notifyURL) {
    if(oProfile.getAttr('gsm','') == '') {
        oProfile.setAttr('gsm',
            prompt("Your profile GSM number is unspecified.\nEnter GSM number",oProfile.getAttr('gsm',''))
        );                    
    }
    log("Check roaming status of GSM number <b>" + oProfile.getAttr("gsm","") + '</b>');
    // example: retrieve-roaming-status-with-notify-url
    // Query roaming status of GSM number from CustomerProfile 
    oneapi.retrieveRoamingStatus(
        oProfile.getAttr("gsm"),notifyURL,null, null, null,
        function(isOk,oResponse) {
            if(!isOk) { // oResponse is DmApiError
                // Handle error
                log("Error: Unable to check roaming status of your GSM:" + oResponse.getErrorText()); // example-ignore
            } else { // oResponse DmTerminalRoamingStatus
                // Continue and wait for notification to be pushed
                log( "Done. retrievalStatus is <b>" + oResponse.getAttr('retrievalStatus','unknown') +  // example-ignore
                    "</b>, resource URL is <b>" + oResponse.getDataID() + "<b>" // example-ignore
                );// example-ignore
            }
        }
    );
    // -- end of example retrieve-roaming-status-with-notify-url    
}

function queryDeliveryStatusExample(address,clientCorrelatorOrResourceReference) {
    // example: query-for-delivery-status
    oneapi.queryDeliveryStatus(address,clientCorrelatorOrResourceReference,function(isOk,oResponse) {
        if(!isOk) { // oResponse is DmApiError
            // Handle error    
            // alert('Unable to query deivery status:' + oResponse.getErrorText());            
            log("Error: Unable to query deivery status:" + oResponse.getErrorText()); // example-ignore
        } else { // oResponse is array of DmDeliveryInfo objects
            log("Delivery statuses list:"); // example-ignore
            for(var i=0; i < oResponse.length; i++) {
                // ...
                log('' + i + ')'); // example-ignore
                oResponse[i].forEachAttr(function(name,value) { // example-ignore
                    log(" " + name + ":" + value); // example-ignore
                    return true; // example-ignore
                }); // example-ignore
            }
            log("Done."); // example-ignore
        }        
    });
    // -- end of example query-for-delivery-status
}

// send sms to gsm number of current user
function sendSMSExample(oProfile) {
    // example: prepare-message-without-notify-url
    // Message will be sent to GSM number from CustomerProfile 
    var oMessage = FM.DmObject.newObject("SMSMessage", {
        senderAddress: oProfile.getAttr("gsm"),
        senderName: oProfile.getAttr("username"),
        message: 'Welcome to Parseco',
        address: oProfile.getAttr("gsm")
    });
    // -- end of example prepare-message-without-notify-url
    
    if(oMessage.getAttr('address','') == '') {
        var addr = prompt("Your profile GSM number is unspecified.\nEnter destination GSM number",oMessage.getAttr('address',''));
        oMessage.setAttr('address',addr);                    
        oMessage.setAttr('senderAddress',addr);                    
    }
    log("SMS will be send to GSM number <b>" + oMessage.getAttr("address","") + '</b>');

    // example: send-message
    oneapi.sendSMS(oMessage,function(isOk,oResourceRef) {
        if(!isOk) { // oResourceRef is DmApiError
            // Handle error    
            // alert('Unable to send SMS:' + oResponse.getErrorText());
            log("Error: Unable to send SMS message:" + oResourceRef.getErrorText()); // example-ignore
        } else { // oResourceRef DmResourceReference
            // Handle response
            // alert("Message sent. Resource URL is " + oResourceRef.getDataID()); 
            log("Message sent. Resource URL is <b>" + oResourceRef.getDataID() + "<b>"); // example-ignore
        }
    });
    // -- end of example send-message
}


// send sms to gsm number of current user
function sendSMS_notifyExample(oProfile) {                
    // example: prepare-message-with-notify-url
    // Message will be sent to GSM number from CustomerProfile 
    var oMessage = FM.DmObject.newObject("SMSMessage", {
        senderAddress: oProfile.getAttr("gsm"),
        senderName: oProfile.getAttr("username"),
        message: 'Welcome to Parseco',
        address: oProfile.getAttr("gsm"),
        notifyURL: notifyURL
    });
    // -- end of example prepare-message-with-notify-url    
    if(oMessage.getAttr('address','') == '') {
        var addr = prompt("Your profile GSM number is unspecified.\nEnter destination GSM number",oMessage.getAttr('address',''));
        oMessage.setAttr('address',addr);                    
        oMessage.setAttr('senderAddress',addr);                    
    }
    log("SMS will be send to GSM number <b>" + oMessage.getAttr("address","") + '</b>');

    if(oMessage.getAttr('notifyURL','REPLACE_WITH_NOTIFY_URL') == 'REPLACE_WITH_NOTIFY_URL') {
        oMessage.setAttr(
            'notifyURL',
            prompt("Your notification URL is unspecified.\nEnter URL",oMessage.getAttr('notifyURL',''))
        );
    }
    log("Notifications will be pushed to <b>" + oMessage.getAttr('notifyURL','') + "<b>");

    oneapi.sendSMS(oMessage,function(isOk,oResourceRef) {
        if(!isOk) { // oResourceRef is DmApiError
            log("Error: Unable to send SMS message:" + oResourceRef.getErrorText());
            
        } else { // oResourceRef DmResourceReference
            log("Message sent.");
        }
    });
}

// parse inbound message
function processInboundNotificationExample(jsonString) {         
    // example: on-mo
    var oInboundSmsMessage = FM.DmObject.newObject(
        "InboundSmsMessage", 
        FM.unserialize(jsonString)
    );    
    // -- end of example on-mo
    return oInboundSmsMessage;
}

// parse delivery notification
function processDeliveryNotificationExample(jsonString) {         
    // example: on-delivery-notification
    var oNotification = FM.DmObject.newObject(
        "DeliveryInfoNotification", 
        FM.unserialize(jsonString)
    );    
    // -- end of example on-delivery-notification
    return oNotification;
}

// parse roaming status
function processTerminalRoamingStatus(jsonString) {                
    // example: on-roaming-status
    var oRoomingStatus = FM.DmObject.newObject(
        "TerminalRoamingStatus", 
        FM.unserialize(jsonString)
    );    
    // -- end of example on-roaming-status
    return oRoomingStatus;
}


// subscribe to MO notifications
function subscribeToMONotificationsExample() {
    log("Subscribing to MO notifications ...");                
    oneapi.subscribeToInboundMessagesNotifications(
        moNumber,'http://example.com/mo_notifications.php',
        moKeyword,'JSON',
        'moSubscribeExample_' + FM.generateNewID(),
        'moSubscribeExample_' + FM.generateNewID(),
        function(isOk,oResponse) {
            if(!isOk) { // oResponse is DmApiError
                log("Error: Unable to subscribe to MO notifications:" + oResponse.getErrorText());
            } else { // 
                log("Subscription successfull.");
                log("Run <i>get_inbound_messages.html</i> example to view all MO subscriptions.");
                log("Done.");
            }
        }
    );
}




// -- INIT ---------------------------------------------------------------------
CALL_ARGS = getArgs();