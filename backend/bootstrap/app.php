<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * bootstrap/app.php [REVISI]
 * Perubahan: daftarkan UpdateLastSeen middleware di api stack
 */
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php', // [BARU] Pusher channels
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // AuthenticateFromCookie: ekstrak authToken dari cookie → Authorization header
        $middleware->api(prepend: [
            \App\Http\Middleware\AuthenticateFromCookie::class,
        ]);

        // [BARU] UpdateLastSeen: update last_seen setiap request user yang login
        $middleware->api(append: [
            \App\Http\Middleware\UpdateLastSeen::class,
            \App\Http\Middleware\LogApiRequest::class,
        ]);

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // [BARU] Register middleware aliases
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->report(function (\Throwable $exception) {
            Log::error('[Exception] Unhandled application error', [
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
            ]);
        });

        $exceptions->render(function (AuthenticationException $exception, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated',
                ], 401);
            }

            return null;
        });

        $exceptions->render(function (ValidationException $exception, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $exception->errors(),
                ], 422);
            }

            return null;
        });

        $exceptions->render(function (AuthorizationException $exception, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses untuk melakukan aksi ini',
                ], 403);
            }

            return null;
        });

        $exceptions->render(function (ModelNotFoundException|NotFoundHttpException $exception, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak ditemukan',
                ], 404);
            }

            return null;
        });

        $exceptions->render(function (QueryException $exception, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                Log::error('[Database] Query failed', [
                    'message' => $exception->getMessage(),
                    'sql_code' => $exception->getCode(),
                    'path' => $request->path(),
                    'user_id' => $request->user()?->id,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Terjadi kendala pada data. Silakan coba lagi atau hubungi admin.',
                ], 500);
            }

            return null;
        });

        $exceptions->render(function (\Throwable $exception, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                $status = $exception instanceof HttpExceptionInterface
                    ? $exception->getStatusCode()
                    : 500;

                $message = $status >= 500
                    ? 'Mohon maaf, terjadi kesalahan pada server. Silakan coba lagi.'
                    : ($exception->getMessage() ?: 'Permintaan tidak dapat diproses');

                return response()->json([
                    'success' => false,
                    'message' => $message,
                ], $status);
            }

            return null;
        });
    })->create();
