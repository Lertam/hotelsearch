<?php 

class API {
    private $keys = null;
    function __construct($keys) {
        if(!isset($keys)) throw new Error('You must provide Ostrovok API keys for use this class.');
        $this->keys = $keys;
    }
    private function makeApiRequest ($url) {
        $method = $_SERVER['REQUEST_METHOD'];
        $baseUrl = 'https://partner.ostrovok.ru';
        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => ($baseUrl.$url),
            CURLOPT_USERPWD => $this->keys,
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
            return array('debug' => array('status' => 400), 'message' => "cURL Error #:" . $err);
        } else {
            return json_decode($response, true);
        }
    }

    public function getMulticomplete($query) {
        return $this->makeApiRequest("/api/affiliate/v2/multicomplete?query=". $query);
    }

    private function correctDate($dat) {
        $arr = explode('-', $dat);
        for($i=0;$i<count($arr);$i++) {
            if(strlen($arr[$i]) < 2) $arr[$i] = '0'.$arr[$i];
        }
        return implode('-', $arr);
    }

    public function getHotels($data) {
        $method = 'POST';
        $params = array();
        if($data['dest']['type'] === 'region') {
            $params['region_id'] = $data['dest']['id'];
        } else if (dest.type === 'hotel') {
            $params['ids'] = array($data['dest']['id']);
        }
        $params['checkin'] = $this->correctDate($data['dates']['in']);
        $params['checkout'] = $this->correctDate($data['dates']['out']);
        return $this->makeApiRequest("/api/affiliate/v2/hotel/rates?data=".json_encode($params),null);
    }

    public function getInfo($ids) {
        if(count($ids) == 0) return array();
        if(count($ids) <= 100) {
            return $this->makeApiRequest("/api/affiliate/v2/hotel/list?data=".json_encode(array('ids' => $ids)), null);
        } else {
            // Make multi requests
            $chunks = array();
            $index = 0;
            for($i = 0; $i < count($ids); $i++) {
                if(!isset($chunks[$index])) $chunks[$index] = array();
                $chunks[$index][] = $ids[$i];
                if(($i + 1) % 100 == 0) $index++;
            }
            $curls = array();
            $mh = curl_multi_init();
            foreach($chunks as $chunk) {
                $url = "https://partner.ostrovok.ru/api/affiliate/v2/hotel/list?data=".json_encode(array('ids' => $chunk));
                $curl = curl_init();
                curl_setopt_array($curl, array(
                    CURLOPT_URL => ($url),
                    CURLOPT_USERPWD => $this->keys,
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_ENCODING => "",
                    CURLOPT_MAXREDIRS => 10,
                    CURLOPT_TIMEOUT => 0,
                    CURLOPT_FOLLOWLOCATION => false,
                    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                    CURLOPT_CUSTOMREQUEST => $_SERVER['REQUEST_METHOD'],
                ));
                curl_multi_add_handle($mh, $curl);
                $curls[] = $curl;
            }
            // return $chunks;
            $running = null;
            do {
                curl_multi_exec($mh, $running);
                curl_multi_select($mh);
            } while ($running > 0);
            $res = array();
            foreach($curls as $curl) {
                $resp = json_decode(curl_multi_getcontent($curl), true);
                if($resp['debug']['status'] == 200) {
                    $res = array_merge($res, $resp['result']);

                } else {
                    throw new Error('Error', json_encode($resp));
                }
            }
            return $res;
        }
    }

    public static function getStaticFilename($id) {
        $path = HOTELSEARCH_CACHE_DIR.'/static/';
        if(!is_dir($path.$_SESSION['search']['dates']['in'])) mkdir($path.$_SESSION['search']['dates']['in']);
        $path .= ($_SESSION['search']['dates']['in'] . '/');
        $hash = $_SESSION['search']['dest']['type'].' '.$_SESSION['search']['dest']['id'];
        if(!is_dir($path . $hash)) mkdir($path . $hash);
        $path .= ($hash . '/');
        return $path.$id.'.json';
    }
}