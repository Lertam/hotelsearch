<?php
// Директория для кэша. Пир изменении обратить внимание на достпность директории.
define('HOTELSEARCH_CACHE_DIR', './hotelsearch_cache');

// ID и ключ для API Островка
define('API_ID', '2545');
define('API_KEY', 'da7bdbcb-4179-4139-ace9-d63e66b345db');

// Количество отелей на странице ("в порции")
define('HOTELS_PER_PAGE', 15);

require('./index.inc.php');