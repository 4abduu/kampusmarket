<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateFromCookie
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Ensure API requests negotiate JSON responses instead of web redirects.
        $acceptHeader = (string) $request->header('Accept', '');

        if ($request->is('api/*') && !str_contains(strtolower($acceptHeader), 'application/json')) {
            $request->headers->set('Accept', 'application/json');
        }

        // Debug: Log cookie presence
        \Illuminate\Support\Facades\Log::debug('[AuthenticateFromCookie] Checking for authToken cookie', [
            'cookies' => $request->cookies->keys(),
            'auth_header' => $request->header('Authorization') ? 'present' : 'missing',
        ]);

        // If authToken cookie exists and no Authorization header present, inject it
        if ($request->hasCookie('authToken') && !$request->header('Authorization')) {
            $token = $request->cookie('authToken');
            
            \Illuminate\Support\Facades\Log::debug('[AuthenticateFromCookie] Found authToken cookie, injecting to Authorization header', [
                'token_length' => strlen($token),
            ]);
            
            $request->headers->set('Authorization', "Bearer {$token}");
        }

        return $next($request);
    }
}
