<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LogApiRequest
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!defined('LARAVEL_START')) {
            define('LARAVEL_START', microtime(true));
        }
        return $next($request);
    }

    public function terminate(Request $request, Response $response): void
    {
        if (!$request->is('api/*')) {
            return;
        }

        $durationMs = defined('LARAVEL_START') ? (int) round((microtime(true) - LARAVEL_START) * 1000) : 0;
        $status = $response->getStatusCode();
        $method = $request->method();
        $route = $request->route();

        $context = [
            'method' => $method,
            'path' => $request->path(),
            'status' => $status,
            'duration_ms' => $durationMs,
            'controller' => $route?->getActionName(),
            'route_name' => $route?->getName(),
            'user_id' => $request->user()?->id,
            'ip' => $request->ip(),
        ];

        if ($status >= 500) {
            Log::error('[API] Request failed', $context);
        } elseif ($status >= 400) {
            Log::warning('[API] Request rejected', $context);
        } elseif ($method !== 'GET' || $durationMs >= 1000) {
            Log::info('[API] Request handled', $context);
        }
    }
}
