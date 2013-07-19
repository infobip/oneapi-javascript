<?php ob_start(); ?>
<?php

// PHP Proxy for ONeAPI REST web service

$DEBUG = true;
if ($DEBUG) {
    error_log("--------------------------------------------------------------------------");
    error_log("SERVER:" . print_r($_SERVER, true));
}

function _getallheaders() {
    $headers = array();
    foreach ($_SERVER as $key => $value) {
        if (substr($key, 0, 5) <> 'HTTP_') {
            continue;
        }
        $header = str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($key, 5)))));
        $headers[$header] = $value;
    }
    return $headers;
}

function executeRequest(
    $httpMethod, $url, $queryParams = null, $requestHeaders = null, 
    $contentType = "application/x-www-form-urlencoded; charset=utf-8"
) {
    global $DEBUG;

    if ($queryParams == null)
        $queryParams = Array();
    if ($requestHeaders == null)
        $requestHeaders = Array();

    $sendHeaders = Array(
        'Content-Type: ' . $contentType
    );
    foreach ($requestHeaders as $key => $value) {
        $sendHeaders[] = $key . ': ' . $value;
    }

    $opts = array(
        CURLOPT_HEADER => true,
        CURLOPT_FRESH_CONNECT => 1,
        CURLOPT_CONNECTTIMEOUT => 60,
        CURLOPT_TIMEOUT => 120,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 3,
        CURLOPT_USERAGENT => 'oneapi-js',
        CURLOPT_CUSTOMREQUEST => $httpMethod,
        CURLOPT_URL => (
        $httpMethod === 'GET' ?
            $url . (
                sizeof($queryParams) > 0 ?
                ('?' . http_build_query($queryParams, null, '&')) : ''
            ) : $url
        ),
    );
    
    if (sizeof($queryParams) > 0 && ($httpMethod == 'POST' || $httpMethod == 'PUT')) {
        $opts[CURLOPT_POSTFIELDS] = http_build_query($queryParams, null, '&');
    }
    $opts[CURLOPT_HTTPHEADER] = $sendHeaders;

    $ch = curl_init();
    curl_setopt_array($ch, $opts);
    $rslt = curl_exec($ch);

    if ($DEBUG) {
        error_log("CURL RESULT:" . $rslt);        
    }

    list( $headerText, $result) = preg_split('/([\r\n][\r\n])\\1/', $rslt, 2);
    $headerArr = preg_split('/[\r\n]+/', $headerText);
    $code = sizeof($headerArr) > 0 ? $headerArr[0] : 'HTTP/1.1 200 OK';
    curl_close($ch);

    return array($code, $result);
}

// get rest service from header
$headers = _getallheaders();
$restService = isset($headers['P-Rest-Service']) ? $headers['P-Rest-Service'] : '';

$destUrl = 'http://oneapi.infobip.com/1' . $restService;

if (substr($destUrl, strlen($destUrl) - 1) == '/') {
    $destUrl = substr($destUrl, 0, strlen($destUrl) - 1);
}

// get http method 
$restMethod = isset($headers['P-Http-Method']) ? $headers['P-Http-Method'] : $_SERVER['REQUEST_METHOD'];

// get list of headers to tranfer
$transferHeaders = isset($headers['P-Http-Headers']) ? $headers['P-Http-Headers'] : 'Authorization';
$tharr = explode(',', $transferHeaders);
$requestHeaders = Array();
foreach ($tharr as $hname) {
    if (isset($headers['P-' . $hname])) {
        $requestHeaders[$hname] = $headers['P-' . $hname];
    }
}


// content type 
$contentType = isset($_SERVER["CONTENT_TYPE"]) ?
    $_SERVER["CONTENT_TYPE"] :
    "application/x-www-form-urlencoded; charset=utf-8"
;

// cal rest endpoint
if ($DEBUG) {
    error_log("proxy (" . $restMethod . "):" . $destUrl);
    error_log("proxy args:" . print_r($_REQUEST, true));
    error_log("proxy headers:" . print_r($requestHeaders, true));
}
list($code, $response) = executeRequest($restMethod, $destUrl, $_REQUEST, $requestHeaders, $contentType);

// return
header($code);
ob_end_clean();
echo $response;
?>
