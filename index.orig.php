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
            <!-- <div style="width:20vw;margin:auto;"><div class="lertgalery"></div>
            </div>
            <p>Some text for test.</p> -->
            <script async src="https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.1.2/lazysizes.min.js" integrity="sha256-Md1qLToewPeKjfAHU1zyPwOutccPAm5tahnaw7Osw0A=" crossorigin="anonymous"></script>
            <script defer src="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.js" integrity="sha256-NXRS8qVcmZ3dOv3LziwznUHPegFhPZ1F/4inU7uC8h0=" crossorigin="anonymous"></script>
            <script defer src="./build/bundle.js"></script>
            <script defer src="./build/1.bundle.js"></script>
            <script>
                // let sources = ["https://cdn.ostrovok.ru/t/x220/ext/d3/e3/d3e3fde70ad0c9e8f57a9eac26078cba6fa421a7.jpeg", "https://cdn.ostrovok.ru/t/x220/second/8e/a5/8ea5b72efcc78c9d10a635b9dd9e94534555aa02.jpeg", "https://cdn.ostrovok.ru/t/x220/second/f7/73/f773dcea0567f28cd99367d971af12f140db0c48.jpeg", "https://cdn.ostrovok.ru/t/x220/ext/7b/89/7b8907e687e840de0f7da2ea20c3a4cdb4085438.jpeg", "https://cdn.ostrovok.ru/t/x220/second/8c/75/8c75c6eb1e05d4f5a3227998d78e88856605bfbd.jpeg", "https://cdn.ostrovok.ru/t/x220/ext/30/e2/30e221516ada54812a01b3e54d1994bbb9c03e87.jpeg", "https://cdn.ostrovok.ru/t/x220/second/d3/91/d3912b57213e6fc74c0c81b922ba51441edc1596.jpeg", "https://cdn.ostrovok.ru/t/x220/second/29/c5/29c52244aaa64a3edd821dbe8c6ab88773ad2bf9.jpeg", "https://cdn.ostrovok.ru/t/x220/second/d2/23/d223b3a1a5e06e1a7f7252a4ade45b5716c70e9c.jpeg", "https://cdn.ostrovok.ru/t/x220/ext/b6/84/b6843dd783bab89a8d8d6e6de5fa099aa20d4e09.jpeg", "https://cdn.ostrovok.ru/t/x220/second/07/44/07448cc56ba5435825efa6ebcda1e6cfbcd7abdc.jpeg", "https://cdn.ostrovok.ru/t/x220/ext/a1/74/a174615cceb2f4545913076b6f5bc738497d9c9e.jpeg", "https://cdn.ostrovok.ru/t/x220/second/c6/fc/c6fc30cf6326d29fa992ecd2999291b9f85d59f5.jpeg", "https://cdn.ostrovok.ru/t/x220/second/33/85/3385d97b7cf669fd04119eba25537bda90e32bd5.jpeg", "https://cdn.ostrovok.ru/t/x220/second/31/c3/31c305858ff94b6c50ab12e95dd78e9ddee84877.jpeg", "https://cdn.ostrovok.ru/t/x220/content/de/92/de922e805b2e2bb7d83d4cfb41f7089a6e3f046b.jpeg", "https://cdn.ostrovok.ru/t/x220/content/68/72/6872253b0f4dde725f85debeaa57a9834d2addfc.jpeg", "https://cdn.ostrovok.ru/t/x220/second/c8/90/c890a7fb038776401580121ecafc363b63a7b85b.jpeg", "https://cdn.ostrovok.ru/t/x220/ext/9a/33/9a332bdccf1a560c49ad1d67470be3c760cc96e7.jpeg", "https://cdn.ostrovok.ru/t/x220/ext/f7/b0/f7b00ee9f9b59176e1236c4fec72e13c67be4926.jpeg", "https://cdn.ostrovok.ru/t/x220/ext/ff/a4/ffa4484cafa8a9aee7254cbb5e8291e32d58dcf9.jpeg", "https://cdn.ostrovok.ru/t/x220/ext/28/a1/28a1e76e8f6b05c742af850778cba50ffd89aba8.jpeg", "https://cdn.ostrovok.ru/t/x220/ext/17/39/17394e580280ad05d9306c00fce331cdd34e433d.jpeg", "https://cdn.ostrovok.ru/t/x220/ext/48/75/4875d6e96cba4ff9f54640f5696f92572f3e57d5.jpeg", "https://cdn.ostrovok.ru/t/x220/ext/75/04/75044717e222c509d5698330ef402e5c5bb7a2a2.jpeg", "https://cdn.ostrovok.ru/t/x220/ext/8b/a4/8ba44e05e99e8059806571f2179a4ec4b4486451.jpeg", "https://cdn.ostrovok.ru/t/x220/second/bd/de/bddecf36d0a35344dd33428fd2799ffe7ff4f2ae.jpeg", "https://cdn.ostrovok.ru/t/x220/second/30/2e/302ee5dd0ea2febf05731fb5ffbbaed2bff19dad.jpeg", "https://cdn.ostrovok.ru/t/x220/second/cf/82/cf828d979dc903de4ed061ceca1575a21400e093.jpeg", "https://cdn.ostrovok.ru/t/x220/second/42/aa/42aa1ea4ea8b6b81c8a29e12de24bbf8207b5b83.jpeg", "https://cdn.ostrovok.ru/t/x220/ext/88/5f/885f807b42c7aa419bb59fd6ad19d97e7a364862.jpeg", "https://cdn.ostrovok.ru/t/x220/ext/80/30/80309fb6bacbcf6ffb5f2ab7089458f15fbc8b10.jpeg", "https://cdn.ostrovok.ru/t/x220/content/69/0e/690e6d007226d1c75502a3dd177c0dcbcbdb60f0.jpeg", "https://cdn.ostrovok.ru/t/x220/ext/13/c7/13c7855163aa47f25ae0a67890a58ecafd608b52.jpeg", "https://cdn.ostrovok.ru/t/x220/ext/57/c0/57c09e13850d67c19a2bede16ad78530bb14442b.jpeg", "https://cdn.ostrovok.ru/t/x220/ext/b6/57/b657a5f73fca706143cc3d6e617bc148f0aa51c2.jpeg", "https://cdn.ostrovok.ru/t/x220/ext/7e/f3/7ef31634f8cf6e6cc7eeb64cc330227648563999.jpeg", "https://cdn.ostrovok.ru/t/x220/second/46/5e/465e83b0817ff47eb85721f1467feb8de43a532c.jpeg", "https://cdn.ostrovok.ru/t/x220/content/6d/f9/6df95704ae0a3a9eb4ea3a733690f8c5e767cd75.jpeg"];
                // $(document).ready(function(){
                //     sources.forEach(src => {
                //         $('.lertgalery').append(`<img src="${src}" />`);
                //     });
                //     $('.lertgalery').slick({
                //         adaptiveHeight: true,
                //         // variableWidth: true
                //         appendArrows: '.lertgalery'
                //     });
                // });
            </script>
        </body>
    </html>
    <?php
}