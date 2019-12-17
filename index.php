<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$mode = 'default';
if(isset($_REQUEST['mode'])) $mode = $_REQUEST['mode'];
if($mode == 'api') {
    header('Content-Type: application/json');
    $method = $_SERVER['REQUEST_METHOD'];
    // $url = str_replace(']', '%5D', str_replace('[', '%5B', $_REQUEST['url']));
    $baseUrl = 'https://partner.ostrovok.ru';
    $keys = "2545:da7bdbcb-4179-4139-ace9-d63e66b345db";

    $action = $_REQUEST['action'];
    switch($action) {
        case 'getMulticomplete':
            $query = $_REQUEST['query'];
            $curl = curl_init();
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
                echo json_encode(array('debug' => array('status' => 400), 'message' => "cURL Error #:" . $err));
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
                echo json_encode(array('debug' => array('status' => 400), 'message' => "cURL Error #:" . $err));
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
                echo json_encode(array('debug' => array('status' => 400), 'message' => "cURL Error #:" . $err));
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
                echo json_encode(array('debug' => array('status' => 400), 'message' => "cURL Error #:" . $err));
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
                echo json_encode(array('debug' => array('status' => 400), 'message' => "cURL Error #:" . $err));
            } else {
                echo $response;
            }
            break;
        case 'reserve':
            $data = file_get_contents('php://input');
            $data = json_decode($data, true);
            $data['user_ip'] = $_SERVER['REMOTE_ADDR'];
            $data = json_encode($data);
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
                echo json_encode(array('debug' => array('status' => 400), 'message' => "cURL Error #:" . $err));
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
                echo json_encode(array('debug' => array('status' => 400), 'message' => "cURL Error #:" . $err));
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
                echo json_encode(array('debug' => array('status' => 400), 'message' => "cURL Error #:" . $err));
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
                echo json_encode(array('debug' => array('status' => 400), 'message' => "cURL Error #:" . $err));
            } else {
                echo $response;
            }
            break;
        case 'reserve-info':
            $poid = $_REQUEST['partner_order_id'];
            $curl = curl_init();

            curl_setopt_array($curl, array(
                CURLOPT_URL => ($baseUrl."/api/affiliate/v2/order/info?partner_order_id=$poid"),
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
                echo json_encode(array('debug' => array('status' => 400), 'message' => "cURL Error #:" . $err));
            } else {
                echo $response;
            }
            break;
        default:
            echo 'Unknown action';
            break;
    }
} else { ?>
    <!DOCTYPE html>
    <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>Поиск и бронирование отелей</title>
            <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
            <script src="https://code.jquery.com/jquery-1.12.4.js"></script>
            <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
            <script src="./dist/js/datepicker-ru.js"></script>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
            <!-- <link rel="stylesheet" href="./dist/css/index.css" /> -->
            <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>

        </head>
        <body>

            <?php if($mode == 'finish' && isset($_REQUEST['partner_order_id']) && is_string($_REQUEST['partner_order_id'])) { ?><script type="text/javascript">window.partner_order_id = '<?php echo $_REQUEST['partner_order_id']; ?>';</script><?php } ?>
            <script src="./build/bundle.js"></script>
        </body>
    </html>
    <?php
}