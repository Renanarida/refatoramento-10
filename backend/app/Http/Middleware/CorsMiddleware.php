<?php

// app/Http/Middleware/CorsMiddleware.php
namespace App\Http\Middleware;

use Closure;

class CorsMiddleware
{
    public function handle($request, Closure $next)
    {
        if ($request->getMethod() === "OPTIONS") {
            return response('', 204)
                ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization, X-Requested-With');
        }

        $response = $next($request);

        return $response->header('Access-Control-Allow-Origin', 'http://localhost:3000')
                        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                        ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization, X-Requested-With');
    }
}