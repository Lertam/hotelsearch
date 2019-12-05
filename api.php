<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
// include('top-cache.php');
$method = $_SERVER['REQUEST_METHOD'];
// $url = str_replace(']', '%5D', str_replace('[', '%5B', $_REQUEST['url']));
$baseUrl = 'https://partner.ostrovok.ru';
$keys = "2545:da7bdbcb-4179-4139-ace9-d63e66b345db";

$action = $_REQUEST['action'];
switch($action) {
    case 'getMulticomplete':
        $query = $_REQUEST['query'];
        $curl = curl_init();
        // var_dump($query);
        // die();
        curl_setopt_array($curl, array(
            CURLOPT_URL => ($baseUrl."/api/affiliate/v2/multicomplete?query=". $query),//urlencode("{\"query\":\"".$query."do not\"}")),
            CURLOPT_USERPWD => $keys,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => $method,
        ));
        $response = curl_exec($curl);
        $err = curl_error($curl);
        
        curl_close($curl);
        
        if ($err) {
            echo "cURL Error #:" . $err;
        } else {
            echo $response;
        }
        break;    
    case 'getHotels':
        $data = $_REQUEST['data'];
        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => ($baseUrl."/api/affiliate/v2/hotel/rates?data=".$data),
            CURLOPT_USERPWD => $keys,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => $method,
        ));
        
        $response = curl_exec($curl);
        $err = curl_error($curl);
        
        curl_close($curl);
        
        if ($err) {
            echo "cURL Error #:" . $err;
        } else {
            echo $response;
        }
        break;
    case 'getInfo':
        $data = $_REQUEST['data'];
        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => ($baseUrl."/api/affiliate/v2/hotel/list?data=".$data),
            CURLOPT_USERPWD => $keys,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => $method,
        ));
        
        $response = curl_exec($curl);
        $err = curl_error($curl);
        
        curl_close($curl);
        
        if ($err) {
            echo "cURL Error #:" . $err;
        } else {
            echo $response;
        }
        break;
    case "actualize":
        $data = $_REQUEST['data'];
        $hotel_id = $_REQUEST['hotel_id'];
        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => ($baseUrl."/api/affiliate/v2/hotelpage/".$hotel_id."?data=".$data),
            CURLOPT_USERPWD => $keys,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => $method,
        ));
        
        $response = curl_exec($curl);
        $err = curl_error($curl);
        
        curl_close($curl);
        
        if ($err) {
            echo "cURL Error #:" . $err;
        } else {
            echo $response;
        }
        break;
    case 'serps':
        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => ($baseUrl."/api/affiliate/v2/serp_filters"),
            CURLOPT_USERPWD => $keys,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => $method,
        ));
        
        $response = curl_exec($curl);
        $err = curl_error($curl);
        
        curl_close($curl);
        
        if ($err) {
            echo "cURL Error #:" . $err;
        } else {
            echo $response;
        }
        break;
    case 'reserve':
        $data = file_get_contents('php://input');
        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => ($baseUrl."/api/affiliate/v2/order/reserve"),
            CURLOPT_POST => true,
            CURLINFO_HEADER_OUT => true,
            CURLOPT_POSTFIELDS => $data,
            CURLOPT_HTTPHEADER => array(                                                                          
                'Content-Type: application/json',                                                                                
                'Content-Length: ' . strlen($data)                                                                       
            ),
            CURLOPT_USERPWD => $keys,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1
        ));
        
        $response = curl_exec($curl);
        $err = curl_error($curl);
        
        curl_close($curl);
        
        if ($err) {
            echo "cURL Error #:" . $err;
        } else {
            echo $response;
        }
        break;
    case 'status':
        $data = $_REQUEST['data'];
        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => ($baseUrl."/api/affiliate/v2/order/status?data=".$data),
            CURLOPT_USERPWD => $keys,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => $method,
        ));
        
        $response = curl_exec($curl);
        $err = curl_error($curl);
        
        curl_close($curl);
        
        if ($err) {
            echo "cURL Error #:" . $err;
        } else {
            echo $response;
        }
        break;
    case "reserve-list":
        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => ($baseUrl."/api/affiliate/v2/order/list"),
            CURLOPT_USERPWD => $keys,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => $method,
        ));
        
        $response = curl_exec($curl);
        $err = curl_error($curl);
        
        curl_close($curl);
        
        if ($err) {
            echo "cURL Error #:" . $err;
        } else {
            echo $response;
        }
        break;
    case 'cancel':
        $id = $_REQUEST['partner_order_id'];
        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => ($baseUrl."/api/affiliate/v2/order/cancel?partner_order_id=".$id),
            CURLOPT_USERPWD => $keys,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => $method,
        ));
        
        $response = curl_exec($curl);
        $err = curl_error($curl);
        
        curl_close($curl);
        
        if ($err) {
            echo "cURL Error #:" . $err;
        } else {
            echo $response;
        }
        break;
    default:
        echo 'Unknown action';
        break;
}

// include('bottom-cache.php');