OneApi javascript client
============================

Basic messaging example
-----------------------

First initialize the messaging client using your username and password:

    // Set proxy script URL
    OA.setProxy("/proxy/cdproxy.php");
    
    // Call init method
    if(!oneapi.init()) {
        // Handle errors
        // ...
    } else {
        // Init sucessfull
    }


Then login with the client:

    oneapi.login(sUserName,sUserPassword,function(isOk,oResponse) {                    
        if(!isOk) { // oResponse is DmApiError
            // Handle error
            // alert('Unable to login:' + oResponse.getErrorText());
        } else { // oResponse is DmUserCredentials
            // Check user credentials or call other API methods
            if(!oResponse.isVerified()) { // Check if user is verified
                // alert("Please verify your account."); 
            } 
        }
    });


An exception will be thrown if your username and/or password are incorrect.

Prepare the message:

    // Message will be sent to GSM number from CustomerProfile 
    var oMessage = FM.DmObject.newObject("SMSMessage", {
        senderAddress: oProfile.getAttr("gsm"),
        senderName: oProfile.getAttr("username"),
        message: 'Welcome to Parseco',
        address: oProfile.getAttr("gsm")
    });


Send the message:

    oneapi.sendSMS(oMessage,function(isOk,oResourceRef) {
        if(!isOk) { // oResourceRef is DmApiError
            // Handle error    
            // alert('Unable to send SMS:' + oResponse.getErrorText());
        } else { // oResourceRef DmResourceReference
            // Handle response
            // alert("Message sent. Resource URL is " + oResourceRef.getDataID()); 
        }
    });


Later you can query for the delivery status of the message:

    oneapi.queryDeliveryStatus(address,clientCorrelatorOrResourceReference,function(isOk,oResponse) {
        if(!isOk) { // oResponse is DmApiError
            // Handle error    
            // alert('Unable to query deivery status:' + oResponse.getErrorText());            
        } else { // oResponse is array of DmDeliveryInfo objects
            for(var i=0; i < oResponse.length; i++) {
                // ...
            }
        }        
    });


Possible statuses are: **DeliveredToTerminal**, **DeliveryUncertain**, **DeliveryImpossible**, **MessageWaiting** and **DeliveredToNetwork**.

Messaging with notification push example
-----------------------

Same as with the standard messaging example, but when preparing your message:

    // Message will be sent to GSM number from CustomerProfile 
    var oMessage = FM.DmObject.newObject("SMSMessage", {
        senderAddress: oProfile.getAttr("gsm"),
        senderName: oProfile.getAttr("username"),
        message: 'Welcome to Parseco',
        address: oProfile.getAttr("gsm"),
        notifyURL: notifyURL
    });


When the delivery notification is pushed to your server as a HTTP POST request, you must process the body of the message with the following code:

    var oNotification = FM.DmObject.newObject(
        "DeliveryInfoNotification", 
        FM.unserialize(jsonString)
    );


HLR example
-----------------------

Retrieve the roaming status (HLR):

    // Query roaming status of GSM number from CustomerProfile 
    oneapi.retrieveRoamingStatus(
        oProfile.getAttr("gsm"),null,null, null, null,
        function(isOk,oResponse) {
            if(!isOk) { // oResponse is DmApiError
                // Handle error
                // alert('Unable to query roaming status: ' + oResponse.getErrorText());                
            } else { // oResponse DmTerminalRoamingStatus
                // Handle response
                // alert("Status is " + oResponse.getAttr('retrievalStatus','unknown'));
            }
        }
    );


HLR with notification push example
-----------------------

Similar to the previous example, but this time you must set the notification url where the result will be pushed:

    // Query roaming status of GSM number from CustomerProfile 
    oneapi.retrieveRoamingStatus(
        oProfile.getAttr("gsm"),notifyURL,null, null, null,
        function(isOk,oResponse) {
            if(!isOk) { // oResponse is DmApiError
                // Handle error
            } else { // oResponse DmTerminalRoamingStatus
                // Continue and wait for notification to be pushed
            }
        }
    );


When the roaming status notification is pushed to your server as a HTTP POST request, you must process the body of the message with the following code:

    var oRoomingStatus = FM.DmObject.newObject(
        "TerminalRoamingStatus", 
        FM.unserialize(jsonString)
    );


Retrieve inbound messages example
-----------------------

With the existing sms client (see the basic messaging example to see how to start it):

    oneapi.retrieveInboundMessages(1,99,function(isOk,oResponse) { 
        if(!isOk) { // oResponse is DmApiError
            // Handle error
            // alert('Unable to retrieve inbound messages: ' + oResponse.getErrorText());                            
        } else { // oResponse is array of DmInboundMessage objects
            for(var i=0; i < oResponse.length; i++) {
                // ...
            }
        }
    });


Inbound message push example
-----------------------

The subscription to recive inbound messages can be set up on our site.
When the inbound message notification is pushed to your server as a HTTP POST request, you must process the body of the message with the following code:

    var oInboundSmsMessage = FM.DmObject.newObject(
        "InboundSmsMessage", 
        FM.unserialize(jsonString)
    );


License
-------

This library is licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)
