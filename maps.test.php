<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
function findPath($x1, $y1, $x2, $y2) {
    return sqrt(($x1-$x2)*($x1-$x2) + ($y1-$y2)*($y1-$y2));
}
// header('Content-Type: application/json');
$method = $_SERVER['REQUEST_METHOD'];
// $url = str_replace(']', '%5D', str_replace('[', '%5B', $_REQUEST['url']));
$baseUrl = 'https://partner.ostrovok.ru';
$keys = "2545:da7bdbcb-4179-4139-ace9-d63e66b345db";
$region_id = 6308908;
$data = json_encode(array(
    'last_id' => $region_id  - 1,
    'limit' => 1,
    // 'types' => 'city'
));
$curl = curl_init();

curl_setopt_array($curl, array(
    CURLOPT_URL => ($baseUrl."/api/affiliate/v2/region/list?data=".$data),
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
$cords = null;
$hotels = array();

if ($err) {
    echo json_encode(array('debug' => array('status' => 400), 'message' => "cURL Error #:" . $err));
    die();
} else {
    $response = json_decode($response, true);
    if($response['debug']['status'] == 200 && count($response['result']) > 0) {
        $cords = $response['result'][0]['center'];
        $data = json_encode(array(
            'region_id' => $region_id,
            'checkin' => '2020-01-18',
            'checkout' => '2020-01-19'
        ));
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
            die();
        } else {
            $response = json_decode($response, true);
            if($response['debug']['status'] == 200 && count($response['result']) > 0 && count($response['result']['hotels']) > 0) {
                $hotel_ids = array();
                foreach ($response['result']['hotels'] as $hotel) {
                    $hotel_ids[] = $hotel['id'];
                }
                $data = json_encode(array('ids' => $hotel_ids));
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
                    die();
                } else {
                    $response = json_decode($response, true);
                    if($response['debug']['status'] == 200 && count($response['result']) > 0) {
                        $hotels = $response['result'];
                    } else {
                        echo $response;
                        die();
                    }
                }
            } else {
                echo json_encode($response);
                die();
            }
        }
    } else {
        echo json_encode($response); die();
    }
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
        integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
        crossorigin=""/>
</head>
<body>
    <div id="map" style="height:100vh;width:100vw"></div>
    <script src="https://unpkg.com/leaflet@1.6.0/dist/leaflet.js"
        integrity="sha512-gZwIG9x3wUXg2hdXF6+rVkLF/0Vi9U8D2Ntg4Ga5I5BZpVkVxlJWbSQtXPSiUTtC0TjtGOmxa1AJPuV0CPthew=="
        crossorigin=""></script>
    <script>
        var mymap = L.map('map').setView([<?=$cords['latitude']?>, <?=$cords['longitude']?>], 13);
        // var mymap = L.map('map').setView([51.505, -0.09], 13);
        // Token: pk.eyJ1IjoibGVydGFtIiwiYSI6ImNrNWI1ZWQ5cTA5ZDUza281dGg0cWdydW4ifQ.Sy0XWK7MD_SR-MODgu61yQ
        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox/streets-v11',
            accessToken: 'pk.eyJ1IjoibGVydGFtIiwiYSI6ImNrNWI1ZWQ5cTA5ZDUza281dGg0cWdydW4ifQ.Sy0XWK7MD_SR-MODgu61yQ'
        }).addTo(mymap);
        let markers = {};

        <?php foreach($hotels as $hotel) : ?>
                markers['<?=$hotel['id']?>'] = L.marker([<?=$hotel['latitude']?>, <?=$hotel['longitude']?>]).addTo(mymap);
                markers['<?=$hotel['id']?>'].bindPopup("<b>Hello world!</b><br>I am a popup for <?=$hotel['name']?>.<br/>До центра - <?php echo 111 * findPath($cords['latitude'], $cords['longitude'],$hotel['latitude'], $hotel['longitude'])?> км.");//.openPopup();
        <?php endforeach; ?>

        // Popup without marker
        // var popup = L.popup()
        //     .setLatLng([51.5, -0.09])
        //     .setContent("I am a standalone popup.")
        //     .openOn(mymap);
    </script>
</body>
</html>
