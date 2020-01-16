<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$expire = 24 * 30 * 3600;
session_start();
if(isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] > 1800)) {
    session_unset();
    session_destroy();
}
$_SESSION['LAST_ACTIVITY'] = time();
// Prepare caching dirs

if(!is_dir(HOTELSEARCH_CACHE_DIR)) mkdir(HOTELSEARCH_CACHE_DIR);
if(!is_dir(HOTELSEARCH_CACHE_DIR.'/multicomplete')) mkdir(HOTELSEARCH_CACHE_DIR.'/multicomplete');
if(!is_dir(HOTELSEARCH_CACHE_DIR.'/static')) mkdir(HOTELSEARCH_CACHE_DIR.'/static');

// if(isset($_SESSION['search'])) {
//     var_dump($_SESSION['search']);
// }

$mode = 'default';
if(isset($_REQUEST['mode'])) $mode = $_REQUEST['mode'];
if($mode == 'api') {
    $hotelsPerPage = HOTELS_PER_PAGE;
    header('Content-Type: application/json');
    require('api.php');
    $api = new API(API_ID.':'.API_KEY);
    

    $action = $_REQUEST['action'];
    switch($action) {
        case 'getMulticomplete':
            $query = $_REQUEST['query'];
            $file = HOTELSEARCH_CACHE_DIR.'/multicomplete/'.$query.'.json';
            if (file_exists($file) && filectime($file) + $expire < time()) {
                unlink($file);
            } else if (file_exists($file)) {
                echo file_get_contents($file);
                break;
            }
            $response = $api->getMulticomplete($query);
            $json_response = json_encode($response);
            if($response['debug']['status'] == 200) {
                file_put_contents($file, $json_response);
            }
            echo $json_response;
            break;    
        case 'getHotels':
            $json_data = $_REQUEST['data'];
            $data = json_decode($json_data, true);
            $session_data = array(
                'dest' => $data['dest'],
                'dates' => $data['dates'],
                'rooms' => $data['rooms']
            );
            if(!isset($_SESSION['search']) || (isset($_SESSION['search']) && $session_data != $_SESSION['search']) || !isset($_SESSION['hotels'])) {
                $response = $api->getHotels($data);
                $_SESSION['search'] = $session_data;
                if($response['debug']['status'] != 200) {
                    echo json_encode($response);
                    break;
                }
                $hotels = array();
                foreach($response['result']['hotels'] as $hotel) {
                    $min_price = 99999999;
                    foreach($hotel['rates'] as $rate) {
                        if(is_numeric($rate['rate_price'])) {
                            if((int)$rate['rate_price'] < $min_price) $min_price = (int)$rate['rate_price'];
                        }
                    }
                    $modified = $hotel;
                    $modified['min_rate'] = $min_price;
                    $hotels[$hotel['id']] = $modified;
                }
                $ids = array();
                foreach($hotels as $id => $hotel) {
                    $file = API::getStaticFilename($id);
                    if(!file_exists($file)) $ids[] = $id;
                    else if (filectime($file) + $expire < time()) {
                        unlink($file);
                        $ids[] = $id;
                    } else { //if (file_exists($file)) {
                        $hotels[$id] = array_merge($hotels[$id], json_decode(file_get_contents($file), true));
                    }
                }
                $info = $api->getInfo($ids);
                if(count($ids) > 0 && count($ids) <= 100 && $info['debug']['status'] == 200) {
                    foreach($info['result'] as $hotelInfo) {
                        $modified = $hotelInfo;
                        $modified['stars'] = round($hotelInfo['star_rating'] / 10);
                        $file = API::getStaticFilename($hotelInfo['id']);
                        file_put_contents($file, json_encode($modified));
                        $hotels[$hotelInfo['id']] = array_merge($hotels[$hotelInfo['id']], $modified);
                    }
                } else if(count($ids) > 100 && $info['debug']['status'] == 200) {
                    foreach($info as $hotelInfo) {
                        $modified = $hotelInfo;
                        $modified['stars'] = round($hotelInfo['star_rating'] / 10);
                        $file = API::getStaticFilename($hotelInfo['id']);
                        file_put_contents($file, json_encode($modified));
                        $hotels[$hotelInfo['id']] = array_merge($hotels[$hotelInfo['id']], $modified);
                    }
                }
                $_SESSION['hotels'] = $hotels;
            }
            $hotels = $_SESSION['hotels'];
            $hasLastPage = false;
            if(isset($_SESSION['last_page'])) {
                $hasLastPage = true;
            }
            $page = (isset($_REQUEST['page']) && is_numeric($_REQUEST['page'])) ? (int)$_REQUEST['page'] : 1;
            $_SESSION['last_page'] = $page;
            $filter = array();
            if(isset($_REQUEST['stars'])) {
                $filter['stars'] = json_decode($_REQUEST['stars'], true);
            }
            if(isset($_REQUEST['ratings'])) {
                $filter['ratings'] = json_decode($_REQUEST['ratings'], true);
            }
            if(isset($_REQUEST['serps'])) {
                $filter['serps'] = json_decode($_REQUEST['serps'], true);
            }
            if(isset($_REQUEST['meals'])) {
                $filter['meals'] = json_decode($_REQUEST['meals'], true);
            }
            if(isset($_REQUEST['prices'])) {
                $filter['prices'] = json_decode($_REQUEST['prices'], true);
            }
            if(isset($_REQUEST['hotel_name'])) {
                $filter['hotel_name'] = $_REQUEST['hotel_name'];
            }
            if(count($filter) > 0) {
                // Need filtering
                $res = array();
                foreach($hotels as $hotel) {
                    $filters_passed = 0;
                    $totalFilters = 0;
                    // var_dump($hotel);die();
                    if(isset($filter['stars']) && count($filter['stars']) > 0) {
                        $totalFilters++;
                        if(in_array($hotel['stars'], $filter['stars']) || ($hotel['stars'] == 0 && in_array(1, $filter['stars']))) $filters_passed++;
                        // if(stars.indexOf(source.stars) !== -1 || (source.stars == 0 && stars.indexOf(1) !== -1)) filters_passed += 1;
                    }
                    if(isset($filter['ratings']) && count($filter['ratings']) > 0) {
                        $totalFilters++;
                        if(in_array($hotel['ratings'], $filter['ratings'])) $filters_passed++;
                        // if(stars.indexOf(source.stars) !== -1 || (source.stars == 0 && stars.indexOf(1) !== -1)) filters_passed += 1;
                    }
                    if(isset($filter['serps']) && count($filter['serps']) > 0) {
                        $totalFilters++;
                        $passed = 0;
                        foreach($filter['serps'] as $serp) {
                            if(in_array($serp, $hotel['serp_filters'])) $passed++;
                        }
                        // serps.map(serp => { if(source.serps.indexOf(serp) !== -1) passed += 1;});
                        if($passed == count($filter['serps'])) $filters_passed++;
                    }
                    if(isset($filter['meals']) && count($filter['meals']) > 0) {
                        $totalFilters++;
                        $passed = 0;
                        $hotel_meals = array();
                        foreach($hotel['rates'] as $rate) {
                            $hotel_meals = array_merge($hotel_meals, $rate['meal']);
                        }
                        foreach($filter['meals'] as $meal) {
                            if(in_array($meal, $hotel_meals)) $passed++;
                        }
                        // serps.map(serp => { if(source.serps.indexOf(serp) !== -1) passed += 1;});
                        if($passed == count($filter['meals'])) $filters_passed++;
                    }
                    if(isset($filter['prices']) && count($filter['prices']) > 0) {
                        $totalFilters++;
                        $passed = 0;
                        if(isset($filter['prices']['min']) && is_numeric($filter['prices']['min']) && (int)$hotel['min_rate'] >= $filter['prices']['min']) $passed++;
                        if(isset($filter['prices']['max']) && is_numeric($filter['prices']['max']) && (int)$hotel['min_rate'] <= $filter['prices']['max']) $passed++;
                        if($passed == count($filter['prices'])) $filters_passed++;
                    }
                    if(isset($filter['hotel_name']) && strlen($filter['hotel_name']) > 0) {
                        $totalFilters++;
                        $name = $filter['hotel_name'];
                        if(preg_match("/.*$name.*/", $hotel['name'])) $filters_passed++;
                    }
                    if($filters_passed === $totalFilters) $res[] = $hotel;
                }
                $hotels = $res;
            }
            $response = array(
                'status' => 'ok',
                'total_hotels' => count($hotels)
            );
            if($hasLastPage) {
                $response['hotels'] = array_slice($hotels, $hotelsPerPage * ($page - 1), $hotelsPerPage);
            } else {
                $response['hotels'] = array_slice($hotels, 0, $hotelsPerPage * $page);
            }
            echo json_encode($response);
            break;
        
        case "actualize":
            $data = $_REQUEST['data'];
            $hotel_id = $_REQUEST['hotel_id'];
            $response = $api->actualize($hotel_id, $data);
            echo json_encode($response);
            break;
        case 'reserve':
            $data = file_get_contents('php://input');
            $data = json_decode($data, true);
            $data['user_ip'] = $_SERVER['REMOTE_ADDR'];
            $data = json_encode($data);
            $response = $api->reserve($data);
            echo json_encode($response);
            break;
        case 'status':
            $data = $_REQUEST['data'];
            $response = $api->getStatus($data);
            echo json_encode($response);
            break;
        case "reserve-list":
            $response = $api->getReserveList();
            echo json_encode($response);
            break;
        case 'cancel':
            $id = $_REQUEST['partner_order_id'];
            $response = $api->cancellReserve($id);
            echo json_encode($response);
            break;
        case 'reserve-info':
            $poid = $_REQUEST['partner_order_id'];
            $response = $api->getReserveInfo($poid);
            echo json_encode($response);
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
            <script defer src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
            <script defer src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.css" integrity="sha256-UK1EiopXIL+KVhfbFa8xrmAWPeBjMVdvYMYkTAEv/HI=" crossorigin="anonymous" />
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick-theme.min.css" integrity="sha256-4hqlsNP9KM6+2eA8VUT0kk4RsMRTeS7QGHIM+MZ5sLY=" crossorigin="anonymous" />
        </head>
        <body>
            <div id="app"></div>
            <?php if($mode == 'finish' && isset($_REQUEST['partner_order_id']) && is_string($_REQUEST['partner_order_id'])) { ?><script type="text/javascript">window.partner_order_id = '<?php echo $_REQUEST['partner_order_id']; ?>';</script><?php } ?>
            <script async src="https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.1.2/lazysizes.min.js" integrity="sha256-Md1qLToewPeKjfAHU1zyPwOutccPAm5tahnaw7Osw0A=" crossorigin="anonymous"></script>
            <script defer src="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.js" integrity="sha256-NXRS8qVcmZ3dOv3LziwznUHPegFhPZ1F/4inU7uC8h0=" crossorigin="anonymous"></script>
            <script defer src="./build/bundle.js"></script>
        </body>
    </html>
    <?php
}