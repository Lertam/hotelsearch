<?php
$arr = array(
    'method' => $_SERVER['REQUEST_METHOD'],
    'action' => $_REQUEST['action']
);

switch($arr['action']) {
    case 'getMulticomplete':
        $arr['query'] = $_REQUEST['query'];
        break;    
    case 'getHotels':
        $arr['data'] = $_REQUEST['data'];
        break;
    case 'getInfo':
        $arr['data'] = $_REQUEST['data'];
        break;
    case "actualize":
        $arr['data'] = $_REQUEST['data'];
        $arr['hotel_id'] = $_REQUEST['hotel_id'];
        break;
    default:
        $arr['action'] = 'Unknown action';
        break;
}
$file = md5(json_encode($arr));
$cachefile = './cached/'.$file.'.json';
$cachetime = 18000;

// Serve from the cache if it is younger than $cachetime
if (file_exists($cachefile) && time() - $cachetime < filemtime($cachefile)) {
    readfile($cachefile);
    exit;
}
ob_start(); // Start the output buffer
?>