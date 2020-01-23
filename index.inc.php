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
if(!is_dir(HOTELSEARCH_CACHE_DIR.'/regions')) mkdir(HOTELSEARCH_CACHE_DIR.'/regions');

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
            // if($response['debug']['status'] == 200) {
            //     file_put_contents($file, $json_response);
            // }
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
                    $min_rate = $hotel['rates'][0];
                    foreach($hotel['rates'] as $rate) {
                        if(is_numeric($rate['rate_price']) && is_numeric($min_rate['rate_price'])) {
                            if((int)$rate['rate_price'] < (int)$min_rate['rate_price']) $min_rate = $rate;
                        }
                    }
                    $modified = array_replace(array(), $hotel);
                    $modified['min_rate'] = $min_rate;
                    if(isset($modified['bar_price_data']) || $modified['bar_price_data'] == null) unset($modified['bar_price_data']);
                    if(isset($modified['available_rates']) || $modified['available_rates'] == null) unset($modified['available_rates']);
                    if(isset($modified['rate_name_min']) || $modified['rate_name_min'] == null) unset($modified['rate_name_min']);
                    if(isset($modified['rate_price_min']) || $modified['rate_price_min'] == null) unset($modified['rate_price_min']);
                    $hotels[] = $modified;
                }
                // echo json_encode($hotels); die();
                $ids = array();
                // foreach($hotels as $ind => $hotel) {
                for($i = 0; $i < count($hotels); $i++) { //count($hotels)
                    $file = API::getStaticFilename($hotels[$i]['id']);
                    $ids[$hotels[$i]['id']] = array('ind' => $i, 'id' => $hotels[$i]['id']);
                    // if(!file_exists($file)) $ids[$hotels[$i]['id']] = array('ind' => $i, 'id' => $hotels[$i]['id']);
                    // else if (filectime($file) + $expire < time()) {
                    //     unlink($file);
                    //     $ids[$hotels[$i]['id']] = array('ind' => $i, 'id' => $hotels[$i]['id']);
                    // } else { //if (file_exists($file)) {
                    //     $hotels[$i] = array_merge($hotels[$i], json_decode(file_get_contents($file), true));
                    // }
                }
                $info = $api->getInfo(array_column($ids, 'id'));
                if(count($ids) > 0 && count($ids) <= 100 && $info['debug']['status'] == 200) {
                    foreach($info['result'] as $id => $hotelInfo) {
                        $modified = array_merge($hotelInfo, $hotels[$ids[$hotelInfo['id']]['ind']]);
                        $modified['stars'] = round($hotelInfo['star_rating'] / 10);
                        $modified['has_other_rates'] = false;
                        $modified['has_rates_with_meal'] = false;
                        $modified['has_free_cancellation'] = false;
                        $modified['meals'] = array();
                        $modified['payments'] = array();
                        $needToBreak = 3;
                        if(!array_key_exists('sort_score', $modified)) $modified['sort_score'] = 0;
                        foreach($modified['rates'] as $rate) {
                            $modified['meals'][] = $rate['meal'];
                            if($rate['availability_hash'] != $modified['min_rate']['availability_hash']) {
                                $modified['has_other_rates'] = true;
                                // $needToBreak--;
                            }
                            if($rate['meal'] !== 'nomeal') {
                                $modified['has_rates_with_meal'] = true;
                                // $needToBreak--;
                            }
                            if($rate['cancellation_info']['free_cancellation_before'] !== null) {
                                $modified['has_free_cancellation'] = true;
                                $modified['payments'][] = 'has_free_cancellation';
                                $needToBreak--;
                            }
                            if($rate['payment_options']['payment_types'][0]['is_need_credit_card_data'] == false) {
                                $modified['payments'][] = 'no_card';
                            }
                            if($rate['payment_options']['payment_types'][0]['type'] == 'hotel') {
                                $modified['payments'][] = 'payment_hotel';
                            }
                            if($rate['payment_options']['payment_types'][0]['type'] == 'now') {
                                $modified['payments'][] = 'payment_now';
                            }
                        }
                        $modified['meals'] = array_unique($modified['meals']);
                        $modified['payments'] = array_unique($modified['payments']);
                        $modified['min_rate']['name_struct'] = null;
                        foreach($modified['room_groups'] as $group) {
                            if($group['room_group_id'] == $modified['min_rate']['room_group_id']) $modified['min_rate']['name_struct'] = $group['name_struct'];
                        }
                        // unset($modified['room_groups']);
                        // unset($modified['rates']);
                        if(array_key_exists('region_category', $modified)) unset($modified['region_category']);
                        if(array_key_exists('description_short', $modified)) unset($modified['description_short']);
                        if(array_key_exists('matching', $modified)) unset($modified['matching']);
                        if(array_key_exists('country_code', $modified)) unset($modified['country_code']);
                        if(array_key_exists('low_rate', $modified)) unset($modified['low_rate']);
                        if(array_key_exists('rating', $modified)) {
                            if(array_key_exists('detailed', $modified['rating'])) unset($modified['rating']['detailed']);
                            if(array_key_exists('review_best', $modified['rating'])) unset($modified['rating']['review_best']);
                            if(array_key_exists('reviews_count', $modified['rating'])) unset($modified['rating']['reviews_count']);
                        }
                        $file = API::getStaticFilename($hotelInfo['id']);
                        $hotels[$ids[$hotelInfo['id']]['ind']] = $modified;
                        // file_put_contents($file, json_encode($hotels[$ids[$hotelInfo['id']]['ind']]));
                    }
                } else if(count($ids) > 100) {
                    foreach($info as $hotelInfo) {
                        $modified = array_merge($hotelInfo, $hotels[$ids[$hotelInfo['id']]['ind']]);
                        $modified['stars'] = round($hotelInfo['star_rating'] / 10);
                        $modified['has_other_rates'] = false;
                        $modified['has_rates_with_meal'] = false;
                        $modified['has_free_cancellation'] = false;
                        $modified['payments'] = array();
                        $modified['meals'] = array();
                        $needToBreak = 3;
                        if(!array_key_exists('sort_score', $modified)) $modified['sort_score'] = 0;
                        foreach($modified['rates'] as $rate) {
                            $modified['meals'][] = $rate['meal'];
                            if($rate['availability_hash'] != $modified['min_rate']['availability_hash']) {
                                $modified['has_other_rates'] = true;
                                $needToBreak--;
                            }
                            if($rate['meal'] !== 'nomeal') {
                                $modified['has_rates_with_meal'] = true;
                                $needToBreak--;
                            }
                            if($rate['cancellation_info']['free_cancellation_before'] !== null) {
                                $modified['has_free_cancellation'] = true;
                                $modified['payments'][] = 'has_free_cancellation';
                                $needToBreak--;
                            }
                            if($rate['payment_options']['payment_types'][0]['is_need_credit_card_data'] == false) {
                                $modified['payments'][] = 'no_card';
                            }
                            if($rate['payment_options']['payment_types'][0]['type'] == 'hotel') {
                                $modified['payments'][] = 'payment_hotel';
                            }
                            if($rate['payment_options']['payment_types'][0]['type'] == 'now') {
                                $modified['payments'][] = 'payment_now';
                            }
                        }
                        $modified['meals'] = array_unique($modified['meals']);
                        $modified['payments'] = array_unique($modified['payments']);
                        $modified['min_rate']['name_struct'] = null;
                        foreach($modified['room_groups'] as $group) {
                            if($group['room_group_id'] == $modified['min_rate']['room_group_id']) $modified['min_rate']['name_struct'] = $group['name_struct'];
                        }
                        // unset($modified['room_groups']);
                        // unset($modified['rates']);
                        if(array_key_exists('region_category', $modified)) unset($modified['region_category']);
                        if(array_key_exists('description_short', $modified)) unset($modified['description_short']);
                        if(array_key_exists('matching', $modified)) unset($modified['matching']);
                        if(array_key_exists('country_code', $modified)) unset($modified['country_code']);
                        if(array_key_exists('low_rate', $modified)) unset($modified['low_rate']);
                        if(array_key_exists('rating', $modified)) {
                            if(array_key_exists('detailed', $modified['rating'])) unset($modified['rating']['detailed']);
                            if(array_key_exists('review_best', $modified['rating'])) unset($modified['rating']['review_best']);
                            if(array_key_exists('reviews_count', $modified['rating'])) unset($modified['rating']['reviews_count']);
                        }
                        $file = API::getStaticFilename($hotelInfo['id']);
                        $hotels[$ids[$hotelInfo['id']]['ind']] = $modified;
                        // file_put_contents($file, json_encode($hotels[$ids[$hotelInfo['id']]['ind']]));
                    }
                }
                // echo json_encode(array_slice($hotels,0,10));die();
                usort($hotels, function($a, $b) {
                    if ($a['sort_score'] == $b['sort_score']) {
                        return 0;
                    }
                    return ($a['sort_score'] > $b['sort_score']) ? -1 : 1;
                });
                $_SESSION['hotels'] = $hotels;
            }
            $hotels = $_SESSION['hotels'];
            $region_info = null;
            if(isset($session_data['dest']['type']) && $session_data['dest']['type'] == 'region' && isset($session_data['dest']['id'])) {
                $region_id = (int)$session_data['dest']['id'];
                $filename = HOTELSEARCH_CACHE_DIR.'/regions/'.$region_id.'.json';
                if(file_exists($filename)) {
                    $region_info = json_decode(file_get_contents($filename), true);
                } else {
                    $response = $api->getRegionInfo($region_id);
                    if($response['debug']['status'] == 200 && count($response['result']) > 0) {
                        $region_info = $response['result'][0];
                        file_put_contents($filename, json_encode($region_info));
                    }
                }
            }
            if((isset($_SESSION['region_info']) && $_SESSION['region_info']['id'] == $hotels[0]['region_id']) || $region_info != null && isset($region_info['center'])) {
                $_SESSION['region_info'] = $region_info;
                $lat = (float)$region_info['center']['latitude'];
                $lng = (float)$region_info['center']['longitude'];

                foreach($hotels as $i => $hotel) {
                    $hotels[$i]['distance_from_center'] = API::findDistance(
                        $lat, $lng, // City cords
                        $hotel['latitude'], $hotel['longitude']
                    );
                }
            }
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
            if(isset($_REQUEST['payment'])) {
                $filter['payment'] = json_decode($_REQUEST['payment'], true);
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
            if(isset($_REQUEST['distance'])) {
                $filter['distance'] = $_REQUEST['distance'];
            }
            if(count($filter) > 0) {
                // Need filtering
                $res = array();
                foreach($hotels as $hotel) {
                    $filters_passed = 0;
                    $totalFilters = 0;
                    if(isset($filter['stars']) && count($filter['stars']) > 0) {
                        $totalFilters++;
                        if(in_array($hotel['stars'], $filter['stars']) || ($hotel['stars'] == 0 && in_array(1, $filter['stars']))) $filters_passed++;
                        // if(stars.indexOf(source.stars) !== -1 || (source.stars == 0 && stars.indexOf(1) !== -1)) filters_passed += 1;
                    }
                    if(isset($filter['ratings']) && count($filter['ratings']) > 0) {
                        $totalFilters++;
                        if(array_key_exists('total', $hotel['rating']) && in_array(floor($hotel['rating']['total']), $filter['ratings'])) $filters_passed++;
                    }
                    if(isset($filter['payment']) && count($filter['payment']) > 0) {
                        $totalFilters++;
                        if(in_array($hotel['payments'], $filter['payments'])) $filters_passed++;
                    }
                    if(isset($filter['serps']) && count($filter['serps']) > 0) {
                        $totalFilters++;
                        $passed = 0;
                        foreach($filter['serps'] as $serp) {
                            if(in_array($serp, $hotel['serp_filters'])) $passed++;
                        }
                        if($passed == count($filter['serps'])) $filters_passed++;
                    }
                    if(isset($filter['meals']) && count($filter['meals']) > 0) {
                        $totalFilters++;
                        $passed = 0;
                        $hotel_meals = $hotel['meals'];//array();
                        // foreach($hotel['rates'] as $rate) {
                        //     $hotel_meals = array_merge($hotel_meals, $rate['meal']);
                        // }
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
                    if(isset($filter['distance']) && is_numeric($filter['distance']) && (int)$filter['distance'] > 0) {
                        $totalFilters++;
                        $distance = (int)$filter['distance'];
                        if($hotel['distance_from_center'] <= $distance) $filters_passed++;
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
            <!-- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"> -->
            <script defer src="https://kit.fontawesome.com/4287d8aada.js" crossorigin="anonymous"></script>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
            <script defer src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>
            <!-- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.css" integrity="sha256-UK1EiopXIL+KVhfbFa8xrmAWPeBjMVdvYMYkTAEv/HI=" crossorigin="anonymous" />
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick-theme.min.css" integrity="sha256-4hqlsNP9KM6+2eA8VUT0kk4RsMRTeS7QGHIM+MZ5sLY=" crossorigin="anonymous" /> -->
            <link rel="stylesheet" href="/node_modules/owl.carousel/dist/assets/owl.carousel.min.css" />
            <link rel="stylesheet" href="/node_modules/owl.carousel/dist/assets/owl.theme.default.css" />
        </head>
        <body>
            <div id="app"></div>
            <?php if($mode == 'finish' && isset($_REQUEST['partner_order_id']) && is_string($_REQUEST['partner_order_id'])) { ?><script type="text/javascript">window.partner_order_id = '<?php echo $_REQUEST['partner_order_id']; ?>';</script><?php } ?>
            <script async src="https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.1.2/lazysizes.min.js" integrity="sha256-Md1qLToewPeKjfAHU1zyPwOutccPAm5tahnaw7Osw0A=" crossorigin="anonymous"></script>
            <!-- <script src="/node_modules/jquery/dist/jquery.js"></script> -->
            <script src="/node_modules/owl.carousel/dist/owl.carousel.min.js"></script>
            <script defer src="./build/bundle.js"></script>
        </body>
    </html>
    <?php
}