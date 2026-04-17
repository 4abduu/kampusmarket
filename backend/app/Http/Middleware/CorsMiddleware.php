<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $origin = $request->header('Origin');
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

        $allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000',
            $frontendUrl,
        ];

        $isAllowedOrigin = $origin && (
            in_array($origin, $allowedOrigins, true)
            || preg_match('/^http:\/\/(localhost|127\.0\.0\.1):\d+$/', $origin) === 1
        );

        if ($request->getMethod() === 'OPTIONS') {
            $response = response('', 204);
        } else {
            $response = $next($request);
        }

        if ($isAllowedOrigin) {
            return $response
                ->header('Access-Control-Allow-Origin', $origin)
                ->header('Vary', 'Origin')
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')
                ->header('Access-Control-Max-Age', '3600');
        }

        return $response;
    }
}
