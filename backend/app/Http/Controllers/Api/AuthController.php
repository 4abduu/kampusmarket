<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ManagesAuthCookies;
use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\Faculty;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    use ManagesAuthCookies;

    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            Log::info('Auth register attempt', [
                'email' => $request->email,
                'facultyId' => $request->facultyId,
            ]);

            $faculty = Faculty::visible()->where('code', $request->facultyId)->firstOrFail();

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'faculty_id' => $faculty->id,
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            Log::info('Auth register success', [
                'user_id' => $user->id,
                'email' => $user->email,
                'has_faculty' => $user->faculty_id ? 'yes' : 'no',
                'faculty_id' => $user->faculty_id,
            ]);

            \App\Helpers\NotificationHelper::adminNewUser($user);

            $response = response()->json([
                'success' => true,
                'message' => 'Registrasi berhasil',
                'data' => [
                    'user' => new UserResource($user->load('faculty')),
                    'token' => $token,
                    'tokenType' => 'Bearer',
                ],
            ], 201);

            return $this->attachAuthCookies($response, $token, false, false);
        } catch (\Throwable $e) {
            Log::error('Auth register failed', [
                'email' => $request->email,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            Log::info('Auth login attempt', ['email' => $request->email]);

            $user = User::where('email', $request->email)->first();

            if ($user && $user->google_id && !$user->password) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email ini terdaftar melalui Google. Silakan klik "Lanjutkan dengan Google" untuk masuk.',
                ], 401);
            }

            if (!$user || !Hash::check($request->password, $user->password)) {
                Log::warning('Auth login failed: invalid credentials', ['email' => $request->email]);

                return response()->json([
                    'success' => false,
                    'message' => 'Email atau password salah',
                ], 401);
            }

            if ($user->is_banned) {
                Log::warning('Auth login blocked: banned user', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'ban_reason' => $user->ban_reason,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Akun Anda telah dibanned: ' . $user->ban_reason,
                ], 403);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            Log::info('Auth login success', [
                'user_id' => $user->id,
                'email' => $user->email,
                'has_faculty' => $user->faculty_id ? 'yes' : 'no',
                'faculty_id' => $user->faculty_id,
            ]);

            $response = response()->json([
                'success' => true,
                'message' => 'Login berhasil',
                'data' => [
                    'user' => new UserResource($user->load('faculty')),
                    'token' => $token,
                    'tokenType' => 'Bearer',
                ],
            ]);

            return $this->attachAuthCookies($response, $token, false, false);
        } catch (\Throwable $e) {
            Log::error('Auth login failed with exception', [
                'email' => $request->email,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function logout(Request $request): JsonResponse
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        [$cookieDomain, $isSecure] = $this->getAuthCookieConfig();
        $sameSite = config('app.env') === 'production' ? 'None' : 'Lax';

        $response = response()->json([
            'success' => true,
            'message' => 'Logout berhasil',
        ]);

        $response->cookie('authToken', '', -1, '/', $cookieDomain, $isSecure, true, false, $sameSite);
        $response->cookie('requiresFacultySelection', '', -1, '/', $cookieDomain, $isSecure, true, false, $sameSite);
        $response->cookie('isNewUser', '', -1, '/', $cookieDomain, $isSecure, true, false, $sameSite);

        return $response;
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            Log::debug('Auth /me endpoint called without authenticated user', [
                'has_auth_header' => $request->header('Authorization') ? 'yes' : 'no',
                'has_cookie' => $request->hasCookie('authToken') ? 'yes' : 'no',
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
                'data' => null,
            ], 401);
        }

        if ($user->is_banned) {
            $user->currentAccessToken()->delete();

            return response()->json([
                'success' => false,
                'message' => 'Akun Anda telah dibanned: ' . $user->ban_reason,
            ], 403);
        }

        Log::debug('Auth /me endpoint success', [
            'user_id' => $user->id,
            'email' => $user->email,
            'has_faculty' => $user->faculty_id ? 'yes' : 'no',
            'faculty_id' => $user->faculty_id,
        ]);

        return response()->json([
            'success' => true,
            'data' => new UserResource($user->load(['faculty', 'addresses'])),
        ]);
    }

    public function checkCompletion(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
                'data' => null,
            ], 401);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'userId' => $user->uuid,
                'email' => $user->email,
                'isEmailVerified' => (bool) $user->is_verified,
                'emailVerifiedAt' => $user->email_verified_at,
                'hasFaculty' => (bool) $user->faculty_id,
                'facultyId' => $user->faculty_id,
                'requiresEmailVerification' => !$user->is_verified && !$user->google_id,
                'requiresFacultySelection' => !$user->faculty_id,
                'isComplete' => $user->is_verified && $user->faculty_id,
            ],
        ]);
    }
}
