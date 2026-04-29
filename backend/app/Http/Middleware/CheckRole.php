<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Get authenticated user
        $user = $request->user();

        // Check if user has the required role
        if (!$user || $user->role->value !== $role) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - insufficient permissions',
            ], 403);
        }

        return $next($request);
    }
}
