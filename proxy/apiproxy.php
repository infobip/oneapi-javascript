<?php ob_start(); ?>
<?php
// == PHP Proxy for ONeAPI REST web service ====================================
// Usage:
// http://myapi.com/<path_to_this.script>/apiproy.php?_api_service=<service>&arg1=<v1>&arg2=<v2>...
// 
// -- config -------------------------------------------------------------------
$DEBUG = true;
if($DEBUG) {
    error_log("== Proy request ==========================================================");
    error_log(print_r($_REQUEST,true));
    
}

function _getallheaders() {
    $headers = array();
    foreach($_SERVER as $key => $value) {
        if (substr($key, 0, 5) <> 'HTTP_') {
            continue;
        }
        $header = str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($key, 5)))));
        $headers[$header] = $value;
    }
    return $headers;
}

// execute API request
function executeRequest(
    $httpMethod, $url, 
    $queryParams = null, $requestHeaders = null, 
    $contentType = "application/x-www-form-urlencoded; charset=utf-8",
    $username=null,$password=null
) {
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
    
    if($username) $opts[CURLOPT_USERPWD] =  $username . ":" . ($password ? $password : '');
    
    if (sizeof($queryParams) > 0 && ($httpMethod == 'POST' || $httpMethod == 'PUT')) {
        $opts[CURLOPT_POSTFIELDS] = http_build_query($queryParams, null, '&');
    }
    $opts[CURLOPT_HTTPHEADER] = $sendHeaders;


    $ch = curl_init();
    curl_setopt_array($ch, $opts);    
    list( $headerText, $result) = preg_split( '/([\r\n][\r\n])\\1/', curl_exec( $ch ), 2 );
    $headerArr = preg_split( '/[\r\n]+/', $headerText);
    $code = sizeof($headerArr) > 0 ? $headerArr[0] : 'HTTP/1.1 200 OK';
    curl_close($ch);

    return array($code, $result);
}

// -- start of processing ------------------------------------------------------
// url & args
$apiservice=isset($_REQUEST['_api_service']) && $_REQUEST['_api_service'] !== '' ? 
    $_REQUEST['_api_service'] : ""
;
if(strpos($apiservice,"/") !== 0) {
    $apiservice = '/' . $apiservice;
}
if(substr($apiservice,  0,3) !== '/1/') {
    $apiservice = '/1' . $apiservice;
}

if(substr($apiservice,  strlen($apiservice)-1) == '/') {
    $apiservice = substr($apiservice,0,strlen($apiservice)-1);
}

$destUrl = 'http://oneapi.infobip.com' . $apiservice;

$args = Array();
foreach ($_REQUEST as $param => $value) {
    if($param != '_api_service') $args[$param] = $value;
}

// get all headers
$requestHeaders = Array();
$headers = getallheaders();
if($DEBUG) {
    error_log("-- Proy headers ----------------------------------------------------------");
    error_log(print_r($headers,true));    
}


$headersToTransfer = Array(
    'Authorization' => false        
);

foreach ($headersToTransfer as $key => $value) {
    if($value || (!$value && isset($headers[$key]))) {
        $requestHeaders[$key] = isset($headers[$key]) ? $headers[$key] : '';
    }
}

// get http method 
$restMethod = isset($_REQUEST['_api_method']) && $_REQUEST['_api_method'] !== '' ? 
    $_REQUEST['_api_method'] : $_SERVER['REQUEST_METHOD']
;

// content type 
$contentType = isset($_SERVER["CONTENT_TYPE"]) ? 
    $_SERVER["CONTENT_TYPE"] : 
    "application/x-www-form-urlencoded; charset=utf-8"
;

// args
$sendArgs = Array();
foreach ($_REQUEST as $key => $value) {
    if(strpos($key, '_api_') !== 0) {
        $sendArgs[$key] = $value;
    }
}

// auth
$username = isset($_SERVER['PHP_AUTH_USER']) ? $_SERVER['PHP_AUTH_USER'] : null;
$password = isset($_SERVER['PHP_AUTH_PW']) ? $_SERVER['PHP_AUTH_PW'] : null;

// cal rest endpoint
if($DEBUG) {
    error_log("proxy (" . $restMethod . "):" . $destUrl);
    error_log("proxy args:" . print_r($sendArgs,true));
    error_log("proxy headers:" . print_r($requestHeaders,true));
    error_log("proxy auth:" . $username . '/' . ($password === null ? '' : '*'));        
}

list($code,$response) = executeRequest(
    $restMethod,$destUrl,$sendArgs,$requestHeaders,$contentType,
    $username,$password
);

if($DEBUG) {
    error_log("-- Proy results ----------------------------------------------------------");
    error_log($code);
    error_log($response);
}

// return
header($code);
ob_end_clean();
echo $response;
?>
