<?php
return [
    'paths' => ['api/*'], // rotas que terão CORS
    'allowed_methods' => ['*'], // permite todos os métodos HTTP
    'allowed_origins' => ['http://localhost:3000', 'http://127.0.0.1:5173'], // sua origem React
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];



