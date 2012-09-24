/* =============================================================================
 * List helper functions 
 * ========================================================================== */

// -- urls & proxy -------------------------------------------------------------
OA.apiURL = 'http://api.parseco.com/1';
OA.proxyURL= '';
OA.setProxy = function(url) {  
    OA.proxyURL = FM.isset(url) && url ? url : '';
}

OA.setAPIurl = function(url) {  
    OA.apiURL = FM.isset(url) && url ? url : '';
}


//options = {dmList: this, arguments: args};
OA.getApiUrl = function(options) {
    var dmList = FM.getAttr(options,'dmList',null);
    
    var url = OA.proxyURL != '' ? 
    OA.proxyURL :
    OA.apiURL + (
        dmList && FM.isset(dmList['getAttr']) ? 
        dmList.getProperty('config.resourcePath','') : 
        ''
        )
    ;
    
    if(url.substr(url.length-1) == "/") {
        url = url.substr(0,url.length-1);
    }
    return url;
}


// -- ajax call headers --------------------------------------------------------
OA.getApiHeaders = function(options) {
    var dmList = FM.getAttr(options,'dmList',null);
    var hdrs = {};
    if(OA.proxyURL != '') {
        if(OA.apiAuth.getAttr("ibAuthCookie",'') != '') {
            hdrs['P-Authorization'] = 'IBSSO ' + OA.apiAuth.getAttr("ibAuthCookie",'');
        }
        hdrs['P-Rest-Service'] = dmList ? dmList.getProperty('config.resourcePath','') : '';
        hdrs['P-Http-Headers'] = 'Authorization';
        hdrs['P-Http-Method']  = dmList ? dmList.getProperty('config.resourceMethod','POST') : 'POST';
    } else {
        if(OA.apiAuth.getAttr("ibAuthCookie",'') != '') {
            hdrs['Authorization'] = 'IBSSO ' + OA.apiAuth.getAttr("ibAuthCookie",'');
        }
    }
    
    return hdrs;
}

// -- ajax call method ---------------------------------------------------------
OA.getApiMethod = function(dmList) {
    if(OA.proxyURL != '') {
        return 'POST';
    } else {
        return dmList ? dmList.getProperty('config.resourceMethod','POST') : 'POST';
    }
}

// -- ajax response parsing ----------------------------------------------------
// {dmList: this, utAjax: oAjax, response: response.getAttr('value',null)}
OA.isErrorResponse = function(options) {  
    var oData = FM.getAttr(options,'response',{});
    
    if(!FM.isObject(oData)) {
        oData = FM.unserialize(oData,{});
    }
    var response = FM.isset(oData) && oData ? oData : null;
    return response && FM.isset(response['requestError']);
}

OA.errorParser = function(options) {
    var response = FM.getAttr(options,'response',{});
    if(!FM.isObject(response)) {
        response = FM.unserialize(response,{});
    }
    return new OA.DmApiError(FM.getAttr(response,'requestError',{}));
}

OA.responseParser = function(options) {
    var oData = FM.getAttr(options,'response',{});
    var oList = FM.getAttr(options,'dmList',null);
    
    if(!oList || !FM.isset(oList.getProperty)) {
        return new FM.DmGenericValue({
            value: oData
        });
    }
    
    var cls = oList.getProperty('config._responseClass',null);
    if(!cls) return new FM.DmGenericValue({
        value: oData
    });
    
    
    if(FM.isString(cls)) {
        cls = FM.stringPtrToObject(cls);
        if(!cls) return null;
    }
    
    if(!FM.isFunction(cls)) return null;
    return new cls(oData); 
}


/* =============================================================================
 * List configurations
 * ========================================================================== */
// == cache ====================================================================
// -- customer profiles cache --------------------------------------------------
FM.DmList.addConfiguration('cache', {});

// == user managment ===========================================================
// -- user login ---------------------------------------------------------------
FM.DmList.addConfiguration('USER_login', {
    resourcePath: '/customerProfile/login',
    url: OA.getApiUrl,
    method: OA.getApiMethod,
    resourceMethod: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        username: true,
        password: true
    },
    headers: OA.getApiHeaders,
    auth: null,        
    responseFormat: 'JSON',
    validResponseCodes: '200',
    listType: 'single',
    dataProperty: 'login',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    // custom
    _responseClass: OA.DmUserCredentials
});

// -- user logout --------------------------------------------------------------
FM.DmList.addConfiguration('USER_logout', {
    resourcePath: '/customerProfile/logout',
    url: OA.getApiUrl,
    
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    params: {},
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'TEXT',
    validResponseCodes: '204', // nocontent
    listType: 'single',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser    
});

// -- captcha ------------------------------------------------------------------
FM.DmList.addConfiguration('UTIL_captcha', {  
    resourcePath: '/captcha/generate',
    url: OA.getApiUrl,
    method: OA.getApiMethod,
    resourceMethod: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        width: true,
        height: true,
        imageFormat: true
    },
    headers: OA.getApiHeaders,
    auth: null,        
    responseFormat: 'JSON',
    validResponseCodes: '200',
    listType: 'single',
    dataProperty: '',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    // custom
    _responseClass: OA.DmCaptcha
});

// -- user signup --------------------------------------------------------------
FM.DmList.addConfiguration('USER_signup', {
    resourcePath: '/customerProfile/signup',
    url: OA.getApiUrl,
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        username: true,
        password: true,
        forename: true,
        surname: true,
        email: true,
        gsm: true,
        countryCode: true,
        timezoneId: true,
        // captcha
        captchaId: true,
        captchaAnswer: true        
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '201', // created            
    listType: 'single',
    dataProperty: 'signup',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    // custom
    _responseClass: OA.DmUserCredentials    
});

// -- list of countries --------------------------------------------------------
FM.DmList.addConfiguration('UTIL_countries', {
    resourcePath: '/countries/[:id]',
    url: OA.getApiUrl,
    method: OA.getApiMethod,
    resourceMethod: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        id: true
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '200',    
    listType: 'collection',
    dataProperty: 'countries',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    // custom
    _responseClass: OA.DmCountry
});

// -- list of timezones --------------------------------------------------------
FM.DmList.addConfiguration('UTIL_timezones', {
    resourcePath: '/timezones/[:id]',
    url: OA.getApiUrl,
    method: OA.getApiMethod,
    resourceMethod: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        id: true
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '200',    
    listType: 'collection',
    dataProperty: 'timeZones',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    // custom
    _responseClass: OA.DmTimezone
});

// -- list of languages --------------------------------------------------------
FM.DmList.addConfiguration('UTIL_languages', {
    resourcePath: '/languages/[:id]',
    method: OA.getApiMethod,
    url: OA.getApiUrl,
    resourceMethod: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        id: true
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '200',    
    listType: 'collection',
    dataProperty: 'languages',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    // custom
    _responseClass: OA.DmLanguage
});

// -- user verify --------------------------------------------------------------
FM.DmList.addConfiguration('USER_verify', {
    resourcePath: '/customerProfile/verify',
    url: OA.getApiUrl,
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        verificationCode: true
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '200',
    listType: 'single',
    dataProperty: '',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser
});

// -- user password check ------------------------------------------------------
FM.DmList.addConfiguration('USER_password_check', {
    resourcePath: '/customerProfile/password/check',
    url: OA.getApiUrl,
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        password: true
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '200',
    listType: 'single'
});

// -- user password generate ---------------------------------------------------
FM.DmList.addConfiguration('USER_password_generate', {
    resourcePath: '/customerProfile/password/generate',
    url: OA.getApiUrl,
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    params: {},
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '201',
    listType: 'single'
});

// -- user username check for avialibility -------------------------------------
FM.DmList.addConfiguration('USER_username_check', {
    resourcePath: '/customerProfile/username/check',
    url: OA.getApiUrl,
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        username: true
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '200',
    listType: 'single'
});


// -- user password change -----------------------------------------------------
FM.DmList.addConfiguration('USER_password_change', {
    resourcePath: '/customerProfile/changePassword',
    url: OA.getApiUrl,
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        oldPassword: true,
        newPassword: true,
        newPassword2: true
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '200',
    listType: 'single'
});


// == profile managment ========================================================
// -- customer profile ---------------------------------------------------------
// ovo bi trebalo odraditi poziv sa i bez id-a
FM.DmList.addConfiguration('CUSTOMER_profile_get', {
    resourcePath: '/customerProfile/[:userId]',
    url: OA.getApiUrl,
    
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        userId: true
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '200',    
    listType: 'single',
    dataProperty: '',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    // custom
    _responseClass: OA.DmCustomerProfile    
});

// -- customer profile update --------------------------------------------------
FM.DmList.addConfiguration('CUSTOMER_profile_update', {
    resourcePath: '/customerProfile',
    url: OA.getApiUrl,
    
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'PUT',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        id: true,
        username: true,
        forename: true,
        surname: true,
        street: true,
        city: true,
        zipCode: true,
        telephone: true,
        gsm: true,
        fax: true,
        email: true,
        msn: true,
        skype: true,
        countryId: true,
        //countryCode: true,
        timezoneId: true,
        primaryLanguageId: true,
        secondaryLanguageId: true,
        enabled: true
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '201', // ??   
    listType: 'single',    
    dataProperty: '',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    // custom
    _responseClass: OA.DmCustomerProfile
});

// == SMS ======================================================================
FM.DmList.addConfiguration('SMS_inbound_sub_get', {
    resourcePath: '/smsmessaging/inbound/subscriptions',
    url: OA.getApiUrl,
    
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        page: '',
        pageSize: ''
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '200',
    listType: 'collection',
    dataProperty: 'subscriptions',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    // custom
    _responseClass: OA.DmMoSubscription
});

FM.DmList.addConfiguration('SMS_inbound_sub_add', {
    resourcePath: '/smsmessaging/inbound/subscriptions',
    url: OA.getApiUrl,
    
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        destinationAddress: '',
        notifyURL: '',
        criteria: '',
        notificationFormat: '',
        callbackData: '',
        clientCorrelator: ''        
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'TEXT',
    validResponseCodes: '201',
    listType: 'single',
    dataProperty: '',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    // custom
    _responseClass: FM.DmGenericValue
});



FM.DmList.addConfiguration('SMS_inbound_available', {
    resourcePath: '/smsmessaging/inbound/available',
    url: OA.getApiUrl,
    
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        countryId: true,
        dateFrom: true,
        dateTo: true,
        criteria: true,
        free: true,
        page: true,
        pageSize: true
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '200',
    listType: 'collection',
    dataProperty: 'availableNumbers',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    // custom
    _responseClass: OA.DmMoAvailableNumber
});

FM.DmList.addConfiguration('SMS_inbound_trial', {
    resourcePath: '/smsmessaging/inbound/freeTrial',
    url: OA.getApiUrl,
    
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        notifyURL: true
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '200',
    listType: 'collection',
    dataProperty: 'numbers',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    // custom
    _responseClass: OA.DmMoAvailableNumber
});


FM.DmList.addConfiguration('SMS_send', {
    resourcePath: '/smsmessaging/outbound/[:senderAddress]/requests',
    url: OA.getApiUrl,
    
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        senderAddress: true,
        senderName: true,
        message: true,
        address: true,
        notifyURL: true,
        callbackData: true,
        dataCoding: true,
        clientCorrelator: true
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '201',
    listType: 'single',
    dataProperty: 'resourceReference',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    // custom
    _responseClass: OA.DmResourceReference
});

// == HLR ======================================================================
FM.DmList.addConfiguration('HLR_send', {
    resourcePath: '/terminalstatus/queries/roamingStatus',
    url: OA.getApiUrl,
    
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    params: {        
        address: true,
        notifyURL: true,
        includeExtendedData: true,
        clientCorrelator: true,
        callbackData: true
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '200',
    listType: 'single',
    dataProperty: 'roaming',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    
    // custom
    _responseClass: OA.DmTerminalRoamingStatus
});

// == Account balance ==========================================================
FM.DmList.addConfiguration('CUSTOMER_balance_get', {
    resourcePath: '/customerProfile/balance',
    url: OA.getApiUrl,
    
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    params: {},
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '200',
    listType: 'single',
    dataProperty: '',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    
    // custom
    _responseClass: OA.DmAccountBalance
});
    
// == Delivery infos ===========================================================
FM.DmList.addConfiguration('DELIVERY_INFOS_get', {
    resourcePath: '/smsmessaging/outbound/[:senderAddress]/requests/[:requestID]/deliveryInfos',
    url: OA.getApiUrl,
    
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        senderAddress: true,
        requestID: true
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '200',
    listType: 'collection',
    dataProperty: 'deliveryInfoList',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    
    // custom
    _responseClass: OA.DmDeliveryInfo
});
