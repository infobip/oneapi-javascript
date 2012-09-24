if(typeof(OA) == 'undefined') {
    /**
    * @namespace OneAPI SDK namespace
    */
    OA = function() {};    
}

/* =============================================================================
 * Dm Class declaration
 * ========================================================================== */
    
// -- error --------------------------------------------------------------------
OA.DmApiError = function() {
    this._init.apply(this, arguments);
}
FM.extendClass(OA.DmApiError, FM.DmGenericError);

// properties
OA.DmApiError.prototype.objectSubClass = "";

OA.DmApiError.prototype._init = function(attrs) {
    this._super("_init",attrs, {        
        clientCorrelator: '',        
        serviceException: {},
        policyException: {},
        messageId: '',
        text: ''
    });    
    this.objectSubClass = "ApiErrors";
    
    var messageId = this.getAttr('serviceException.messageId',this.getAttr('policyException.messageId',''));
    var text = this.getAttr('serviceException.text', this.getAttr('policyException.text',''));
    var variables = this.getAttr('serviceException.variables', this.getAttr('policyException.variables',''));
    if(FM.isArray(variables)) {
        for(var i=variables.length-1; i > -1; i--) {
            text = text.replace('%' + (i+1),variables[i]);
        }
    }
    
    this.setAttr('messageId',messageId);
    this.setAttr('text',text);
}

OA.DmApiError.className = "DmApiError";
OA.DmApiError.fullClassName = 'dm.DmApiError';

FM.DmObject.addSubClassType('DmApiErrors',OA.DmApiError);


// -- user credentials ---------------------------------------------------------
OA.DmUserCredentials = function() {
    this._init.apply(this, arguments); 
}

FM.extendClass(OA.DmUserCredentials, FM.DmObject); 

// properties
OA.DmUserCredentials.prototype.objectSubClass = "";

// methods
OA.DmUserCredentials.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        username: "",
        ibAuthCookie: "",
        verified: false
    });
    this.objectSubClass = "UserCredentials";
}
        
OA.DmUserCredentials.prototype.getDataID = function() {
    return this.getAttr('ibAuthCookie','');
}

OA.DmUserCredentials.prototype.isAuthenticated = function() {
    return this.getAttr('ibAuthCookie','') != '';
}

OA.DmUserCredentials.prototype.isVerified = function() {
    return this.getAttr('ibAuthCookie','') != '' && this.getAttr('verified',false);
}

OA.DmUserCredentials.className = "DmUserCredentials";
OA.DmUserCredentials.fullClassName = 'dm.DmUserCredentials';

FM.DmObject.addSubClassType('UserCredentials',OA.DmUserCredentials);

// -- user login data ----------------------------------------------------------
OA.DmUserLoginData = function() {
    this._init.apply(this, arguments); 
}

FM.extendClass(OA.DmUserLoginData, FM.DmObject); 

// properties
OA.DmUserLoginData.prototype.objectSubClass = "";

// methods
OA.DmUserLoginData.prototype._init = function(attrs) {
    this._super("_init",attrs, {
            username: '',
            password: ''
    });
    this.objectSubClass = "DmUserLoginData";
}
        
OA.DmUserLoginData.prototype.getDataID = function() {
    return this.getAttr('username','');
}


OA.DmUserLoginData.className = "DmUserLoginData";
OA.DmUserLoginData.fullClassName = 'dm.DmUserLoginData';

FM.DmObject.addSubClassType('UserLoginData',OA.DmUserLoginData);

// -- user signup data ---------------------------------------------------------
OA.DmUserSignupData = function() {
    this._init.apply(this, arguments); 
}

FM.extendClass(OA.DmUserSignupData, FM.DmObject); 

// properties
OA.DmUserSignupData.prototype.objectSubClass = "";

// methods
OA.DmUserSignupData.prototype._init = function(attrs) {
    this._super("_init",attrs, {
            username: '',
            forename: '',
            surname: '',
            email: '',
            gsm: '',
            countryCode: '',
            timezoneId: '',
            password: '',
            password2: '', // dummy 
            captchaId: '',
            captchaAnswer: ''
    });
    this.objectSubClass = "DmUserSignupData";
}
        
OA.DmUserSignupData.prototype.getDataID = function() {
    return this.getAttr('username','');
}


OA.DmUserSignupData.className = "DmUserSignupData";
OA.DmUserSignupData.fullClassName = 'dm.DmUserSignupData';

FM.DmObject.addSubClassType('UserSignupData',OA.DmUserSignupData);

// -- countries ----------------------------------------------------------------
OA.DmCountry = function() {
    this._init.apply(this, arguments); 
}

FM.extendClass(OA.DmCountry, FM.DmObject); 

// properties
OA.DmCountry.prototype.objectSubClass = "";

// methods
OA.DmCountry.prototype._init = function(attrs) {
    this._super("_init",attrs, {
            id: '',
            code: '',
            prefix: '',
            name: '',
            locale: ''
    });
    this.objectSubClass = "DmCountry";
}
        
OA.DmCountry.prototype.getDataID = function() {
    return this.getAttr('code','');
}


OA.DmCountry.className = "DmCountry";
OA.DmCountry.fullClassName = 'dm.DmCountry';

FM.DmObject.addSubClassType('Country',OA.DmCountry);

// -- timezones ----------------------------------------------------------------
OA.DmTimezone = function() {
    this._init.apply(this, arguments); 
}

FM.extendClass(OA.DmTimezone, FM.DmObject); 

// properties
OA.DmTimezone.prototype.objectSubClass = "";

// methods
OA.DmTimezone.prototype._init = function(attrs) {            
    this._super("_init",attrs, {
            id: '',
            name: '',
            standardUtcOffset: '',
            dstOffset: '',
            dstStartTime: '',
            dstEndTime: '',
            countryId: '',
            title: ''
    });
    this.objectSubClass = "DmTimezone";

    var utcOff = parseInt(this.getAttr('standardUtcOffset',0));
    var utcH = utcOff / 60.0;
    var offH = Math.floor(Math.abs(utcH)) * (utcH < 0 ? -1 : 1);
    var offM = Math.floor(Math.abs(utcH - offH) * 60);
    var offStr = '(UTC ' + (offH < 0 ? '-' : '+');
    
    offStr += (offH < 10 && offH > -10 ?
        '0' + '' + Math.abs(offH) :
        '' + Math.abs(offH)) +
        ':' +
        (offM < 10 && offM > -10 ?
        '0' + '' + offM :
        '' + offM) +
        ') '
    ;
    
    this.setAttr('title',offStr + this.getAttr('name',''));
}
        
OA.DmTimezone.prototype.getDataID = function() {
    return this.getAttr('id','');
}


OA.DmTimezone.className = "DmTimezone";
OA.DmTimezone.fullClassName = 'dm.DmTimezone';

FM.DmObject.addSubClassType('Timezone',OA.DmTimezone);

// -- languages ----------------------------------------------------------------
OA.DmLanguage = function() {
    this._init.apply(this, arguments); 
}

FM.extendClass(OA.DmLanguage, FM.DmObject); 

// properties
OA.DmLanguage.prototype.objectSubClass = "";

// methods
OA.DmLanguage.prototype._init = function(attrs) {
    this._super("_init",attrs, {
            id: '',
            languageCode: '',
            languageName: '',
            languageNameLocal: ''
    });
    this.objectSubClass = "DmLanguage";
}
        
OA.DmLanguage.prototype.getDataID = function() {
    return this.getAttr('languageCode','');
}


OA.DmLanguage.className = "DmLanguage";
OA.DmLanguage.fullClassName = 'dm.DmLanguage';

FM.DmObject.addSubClassType('Language',OA.DmLanguage);

// -- captcha ------------------------------------------------------------------
OA.DmCaptcha = function() {
    this._init.apply(this, arguments); 
}

FM.extendClass(OA.DmCaptcha, FM.DmObject); 

// properties
OA.DmCaptcha.prototype.objectSubClass = "";

// methods
OA.DmCaptcha.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        id: '',
        width: 0,
        height: 0,
        imageFormat: 'png',
        image: ''
    });
    this.objectSubClass = "Captcha";
}
        
OA.DmCaptcha.prototype.getDataID = function() {
    return this.getAttr('id','');
}

OA.DmCaptcha.prototype.getImageUrl = function() {
    return "data:image/" + this.getAttr('imageFormat','png') + 
        ";base64," +  this.getAttr('image','')
    ;
}

OA.DmCaptcha.className = "DmCaptcha";
OA.DmCaptcha.fullClassName = 'dm.DmCaptcha';

FM.DmObject.addSubClassType('Captcha',OA.DmCaptcha);


// -- customer profile ---------------------------------------------------------
OA.DmCustomerProfile = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(OA.DmCustomerProfile, FM.DmObject); // extends FM.Object

// properties
OA.DmCustomerProfile.prototype.objectSubClass = "";

// methods
OA.DmCustomerProfile.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        id: '',
        city: '',
        countryId:  '',
        email:  '',
        enabled:  false,
        fax:  '',
        forename:  '',
        gsm:  '',            
        msn:  '',
        primaryLanguageId:  '',
        secondaryLanguageId:  '',
        skype:  '',
        street:  '',
        surname:  '',
        telephone:  '',
        timezoneId:  '',
        username:  '',
        zipCode:  ''
    });
    this.objectSubClass = "CustomerProfile";
}
        
OA.DmCustomerProfile.prototype.getDataID = function() {
    return this.getAttr('id','');
}
OA.DmCustomerProfile.className = "DmCustomerProfile";
OA.DmCustomerProfile.fullClassName = 'dm.DmCustomerProfile';
FM.DmObject.addSubClassType('CustomerProfile',OA.DmCustomerProfile);

// -- SMS message --------------------------------------------------------------
OA.DmSMSMessage = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(OA.DmSMSMessage, FM.DmObject); // extends FM.Object

// properties
OA.DmSMSMessage.prototype.objectSubClass = "";

// methods
OA.DmSMSMessage.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        senderAddress: '',
        senderName: '',
        message: '',
        address: '',
        notifyURL: '',
        callbackData: '',
        dataCoding: '',
        clientCorrelator: this.getID()
    });
    this.objectSubClass = "SMSMessage";
}
        
OA.DmSMSMessage.prototype.getDataID = function() {
    return this.getAttr('clientCorrelator','');
}
OA.DmSMSMessage.className = "DmSMSMessage";
OA.DmSMSMessage.fullClassName = 'dm.DmSMSMessage';
FM.DmObject.addSubClassType('SMSMessage',OA.DmSMSMessage);

// -- SMS message --------------------------------------------------------------
OA.DmResourceReference = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(OA.DmResourceReference, FM.DmObject); // extends FM.Object

// properties
OA.DmResourceReference.prototype.objectSubClass = "";

// methods
OA.DmResourceReference.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        resourceURL: ''
    });
    this.objectSubClass = "ResourceReference";
}
        
OA.DmResourceReference.prototype.getDataID = function() {
    return this.getAttr('resourceURL','');
}
OA.DmSMSMessage.className = "DmResourceReference";
OA.DmSMSMessage.fullClassName = 'dm.DmResourceReference';
FM.DmObject.addSubClassType('ResourceReference',OA.DmResourceReference);


// -- resource reference -------------------------------------------------------
OA.DmResourceReference = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(OA.DmResourceReference, FM.DmObject); // extends FM.Object

// properties
OA.DmResourceReference.prototype.objectSubClass = "";

// methods
OA.DmResourceReference.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        resourceURL: ''
    });
    this.objectSubClass = "ResourceReference";
}
        
OA.DmResourceReference.prototype.getDataID = function() {
    return this.getAttr('resourceURL','');
}
OA.DmResourceReference.className = "DmResourceReference";
OA.DmResourceReference.fullClassName = 'dm.DmResourceReference';
FM.DmObject.addSubClassType('ResourceReference',OA.DmResourceReference);

// -- Hlr request status -------------------------------------------------------
OA.DmTerminalRoamingStatus = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(OA.DmTerminalRoamingStatus, FM.DmObject); // extends FM.Object

// properties
OA.DmTerminalRoamingStatus.prototype.objectSubClass = "";

// methods
OA.DmTerminalRoamingStatus.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        address: '',
        currentRoaming: '',
        servingMccMnc: {
            mcc: '',
            mnc: ''
        },
        resourceURL: '',
        retrievalStatus: '',
        extendedData: '',
        callbackData: ''
    });
    this.objectSubClass = "TerminalRoamingStatus";
}
        
OA.DmTerminalRoamingStatus.prototype.getDataID = function() {
    return this.getAttr('resourceURL','');
}
OA.DmTerminalRoamingStatus.className = "DmTerminalRoamingStatus";
OA.DmTerminalRoamingStatus.fullClassName = 'dm.DmTerminalRoamingStatus';
FM.DmObject.addSubClassType('TerminalRoamingStatus',OA.DmTerminalRoamingStatus);

// -- Account balance ----------------------------------------------------------
OA.DmAccountBalance = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(OA.DmAccountBalance, FM.DmObject); // extends FM.Object

// properties
OA.DmAccountBalance.prototype.objectSubClass = "";

// methods
OA.DmAccountBalance.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        currency: {
            id: '',
            currencyName: '',
            symbol: ''
        },
        balance: ''
    });
    this.objectSubClass = "AccountBalance";
}
        
OA.DmAccountBalance.prototype.getDataID = function() {
    return this.getID();
}
OA.DmAccountBalance.className = "DmAccountBalance";
OA.DmAccountBalance.fullClassName = 'dm.DmAccountBalance';
FM.DmObject.addSubClassType('AccountBalance',OA.DmAccountBalance);

// -- Inbound message ----------------------------------------------------------
OA.DmMoSubscription = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(OA.DmMoSubscription, FM.DmObject); // extends FM.Object

// properties
OA.DmMoSubscription.prototype.objectSubClass = "";

// methods
OA.DmMoSubscription.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        subscriptionId: '',
        notifyURL: '',
        callbackData: '',
        criteria:"",
        destinationAddress: '',
        notificationFormat: ''        
    });
    this.objectSubClass = "MoSubscription";
}
        
OA.DmMoSubscription.prototype.getDataID = function() {
    return this.getAttr('subscriptionId','');
}
OA.DmMoSubscription.className = "DmMoSubscription";
OA.DmMoSubscription.fullClassName = 'dm.DmMoSubscription';
FM.DmObject.addSubClassType('MoSubscription',OA.DmMoSubscription);


// -- Delivery info notification -----------------------------------------------
OA.DmDeliveryInfoNotification = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(OA.DmDeliveryInfoNotification, FM.DmObject); // extends FM.Object

// properties
OA.DmDeliveryInfoNotification.prototype.objectSubClass = "";

// methods
OA.DmDeliveryInfoNotification.prototype._init = function(attrs) {
//{"deliveryInfoNotification": { "callbackData": "12345", "deliveryInfo": { "address": "tel:+1350000001", "deliveryStatus": "DeliveredToNetwork"}, }}    
    this._super("_init",attrs, {
        deliveryInfo: {
            address: '',
            deliveryStatus: ''
        },
        callbackData: ''
    });
    this.objectSubClass = "DeliveryInfoNotification";
}
        
OA.DmDeliveryInfoNotification.prototype.getDataID = function() {
    return this.getID();
}

OA.DmDeliveryInfoNotification.className = "DmDeliveryInfoNotification";
OA.DmDeliveryInfoNotification.fullClassName = 'dm.DmDeliveryInfoNotification';
FM.DmObject.addSubClassType('DeliveryInfoNotification',OA.DmDeliveryInfoNotification);


// -- Inbound sms message ------------------------------------------------------
OA.DmInboundSmsMessage = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(OA.DmInboundSmsMessage, FM.DmObject); // extends FM.Object

// properties
OA.DmInboundSmsMessage.prototype.objectSubClass = "";

// methods
OA.DmInboundSmsMessage.prototype._init = function(attrs) {
    this._super("_init",attrs, {
    messageId: '',
    dateTime: '',
    destinationAddress: '',    
    message: '',
    resourceURL: '',
    senderAddress: ''
    });
    this.objectSubClass = "InboundSmsMessage";
}
        
OA.DmInboundSmsMessage.prototype.getDataID = function() {
    return this.getAttr('messageId','');
}

OA.DmInboundSmsMessage.className = "DmInboundSmsMessage";
OA.DmInboundSmsMessage.fullClassName = 'dm.DmInboundSmsMessage';
FM.DmObject.addSubClassType('InboundSmsMessage',OA.DmInboundSmsMessage);

// -- Delivery info ------------------------------------------------------------
OA.DmDeliveryInfo = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(OA.DmDeliveryInfo, FM.DmObject); // extends FM.Object

// properties
OA.DmDeliveryInfo.prototype.objectSubClass = "";

// methods
OA.DmDeliveryInfo.prototype._init = function(attrs) {
    this._super("_init",attrs, {
    address: '',
    deliveryStatus: ''
    });
    this.objectSubClass = "DeliveryInfo";
}
        
OA.DmDeliveryInfo.prototype.getDataID = function() {
    return this.getID();
}

OA.DmDeliveryInfo.className = "DmDeliveryInfo";
OA.DmDeliveryInfo.fullClassName = 'dm.DmDeliveryInfo';
FM.DmObject.addSubClassType('DeliveryInfo',OA.DmDeliveryInfo);


// -- Mo Available Numbers -----------------------------------------------------
OA.DmMoAvailableNumber = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(OA.DmMoAvailableNumber, FM.DmObject); // extends FM.Object

// properties
OA.DmMoAvailableNumber.prototype.objectSubClass = "";

// methods
OA.DmMoAvailableNumber.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        id: '',
        number: '',
        free: '',
        moNoTypeId: '',
        gSMModemId: '',
        networkId: ''        
    });
    this.objectSubClass = "MoAvailableNumber";
}
        
OA.DmMoAvailableNumber.prototype.getDataID = function() {
    return this.getID();
}

OA.DmMoAvailableNumber.className = "DmMoAvailableNumber";
OA.DmMoAvailableNumber.fullClassName = 'dm.DmMoAvailableNumber';
FM.DmObject.addSubClassType('MoAvailableNumber',OA.DmMoAvailableNumber);






