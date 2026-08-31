<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Public API for store (perfu.me/store) - read-only.
    | Allowed: GET/HEAD/OPTIONS on api/* from any origin (store is public).
    | No credentials. Throttled at route level. Tighten allowed_origins
    | to env STORE_URL if you want origin restriction.
    |
    */

    'paths' => ['api/*'],

    'allowed_methods' => ['GET', 'HEAD', 'OPTIONS'],

    'allowed_origins' => ['*'],

    // If you want to restrict to store origins only, set:
    // 'allowed_origins' => array_filter(array_map('trim', explode(',', env('STORE_CORS_ORIGINS', '*')))),
    // and set STORE_CORS_ORIGINS=http://localhost:5173,https://perfu.me in .env

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'X-Requested-With', 'Accept', 'Origin', 'Authorization'],

    'exposed_headers' => ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],

    'max_age' => 3600,

    'supports_credentials' => false,

];
