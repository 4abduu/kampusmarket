<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ManagesAuthCookies;
use App\Http\Controllers\Controller;
use App\Http\Requests\CompleteGoogleFacultyRequest;
use App\Http\Requests\GoogleLoginRequest;
use App\Http\Resources\UserResource;
use App\Models\Faculty;
use App\Services\GoogleAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoogleAuthController extends Controller
{
    use ManagesAuthCookies;

    public function __construct(private readonly GoogleAuthService $googleAuthService)
    {
    }

    public function googleLogin(GoogleLoginRequest $request): JsonResponse
    {
        try {
            Log::info('Auth Google login attempt', [
                'email' => $request->email,
                'googleId' => $request->googleId,
            ]);

            [$user, $isNewUser] = $this->googleAuthService->findOrCreateGoogleUser([
                'id' => $request->googleId,
                'name' => $request->name,
                'email' => $request->email,
                'picture' => $request->avatar,
            ]);

            if ($user->is_banned) {
                Log::warning('Auth Google login blocked: banned user', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'ban_reason' => $user->ban_reason,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Akun Anda telah dibanned: ' . $user->ban_reason,
                ], 403);
            }

            $needsFacultySelection = !$user->faculty_id;
            $token = $user->createToken('auth_token')->plainTextToken;

            Log::info('Auth Google login success', [
                'user_id' => $user->id,
                'email' => $user->email,
                'is_new_user' => $isNewUser,
                'needs_faculty_selection' => $needsFacultySelection,
            ]);

            $response = response()->json([
                'success' => true,
                'message' => $needsFacultySelection
                    ? 'Pilih fakultas untuk menyelesaikan pendaftaran'
                    : 'Login berhasil',
                'data' => [
                    'user' => new UserResource($user->load('faculty')),
                    'token' => $token,
                    'tokenType' => 'Bearer',
                    'requiresFacultySelection' => $needsFacultySelection,
                    'nextStep' => $needsFacultySelection ? 'faculty-selection' : 'home',
                    'isNewUser' => $isNewUser,
                ],
            ], $needsFacultySelection ? 202 : 200);

            return $this->attachAuthCookies($response, $token, $needsFacultySelection, $isNewUser);
        } catch (\Throwable $e) {
            Log::error('Auth Google login failed with exception', [
                'email' => $request->email,
                'googleId' => $request->googleId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function googleRedirect()
    {
        Log::info('Auth Google redirect started');

        $query = http_build_query([
            'client_id' => config('services.google.client_id'),
            'redirect_uri' => config('services.google.redirect_uri'),
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'access_type' => 'offline',
            'prompt' => 'select_account',
        ]);

        return redirect()->away('https://accounts.google.com/o/oauth2/v2/auth?' . $query);
    }

    public function googleCallback(Request $request)
    {
        $code = $request->query('code');
        $state = $request->query('state');
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');

        if (!$code) {
            Log::warning('Auth Google callback called without code', [
                'state' => $state,
            ]);

            return redirect($frontendUrl . '/login?error=no_code');
        }

        try {
            Log::info('Auth Google callback received code', [
                'state' => $state,
            ]);

            $tokenResponse = Http::post('https://oauth2.googleapis.com/token', [
                'client_id' => config('services.google.client_id'),
                'client_secret' => config('services.google.client_secret'),
                'code' => $code,
                'grant_type' => 'authorization_code',
                'redirect_uri' => config('services.google.redirect_uri'),
            ]);

            $tokenData = $tokenResponse->json();

            if (!isset($tokenData['access_token'])) {
                Log::error('Auth Google callback failed to obtain access token', [
                    'state' => $state,
                    'response' => $tokenData,
                ]);

                return redirect($frontendUrl . '/login?error=invalid_token');
            }

            $userResponse = Http::withToken($tokenData['access_token'])
                ->get('https://www.googleapis.com/oauth2/v2/userinfo');

            if (!$userResponse->successful()) {
                Log::error('Auth Google callback failed to get user info', [
                    'state' => $state,
                    'status' => $userResponse->status(),
                ]);

                return redirect($frontendUrl . '/login?error=failed_to_get_user');
            }

            $googleUser = $userResponse->json();
            [$user, $isNewUser] = $this->googleAuthService->findOrCreateGoogleUser($googleUser);

            if ($user->is_banned) {
                Log::warning('Auth Google callback blocked: banned user', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'ban_reason' => $user->ban_reason,
                ]);

                return redirect($frontendUrl . '/login?error=banned&reason=' . urlencode($user->ban_reason));
            }

            $token = $user->createToken('auth_token')->plainTextToken;
            $needsFacultySelection = !$user->faculty_id;

            Log::info('Auth Google callback success', [
                'user_id' => $user->id,
                'email' => $user->email,
                'is_new_user' => $isNewUser,
                'needs_faculty_selection' => $needsFacultySelection,
                'has_faculty_id' => $user->faculty_id ? 'yes' : 'no',
            ]);

            $redirectPath = $needsFacultySelection ? '/faculty-selection' : '/';
            $query = http_build_query([
                'requiresFacultySelection' => $needsFacultySelection ? 'true' : 'false',
                'isNewUser' => $isNewUser ? 'true' : 'false',
                'userName' => $user->name,
                'userEmail' => $user->email,
            ]);

            $redirectUrl = $frontendUrl . $redirectPath;
            if ($needsFacultySelection) {
                $redirectUrl .= '?' . $query;
            }

            Log::info('Auth Google callback redirect', [
                'user_id' => $user->id,
                'redirect_url' => $redirectUrl,
                'needs_faculty' => $needsFacultySelection,
            ]);

            $response = redirect($redirectUrl);

            return $this->attachAuthCookies($response, $token, $needsFacultySelection, $isNewUser);
        } catch (\Exception $e) {
            Log::error('Auth Google callback failed with exception', [
                'state' => $state,
                'error' => $e->getMessage(),
            ]);

            return redirect($frontendUrl . '/login?error=' . urlencode($e->getMessage()));
        }
    }

    public function completeGoogleFaculty(CompleteGoogleFacultyRequest $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user) {
                Log::warning('Auth Google faculty completion rejected: unauthenticated');

                return response()->json([
                    'success' => false,
                    'message' => 'Autentikasi diperlukan',
                ], 401);
            }

            if ($user->faculty_id) {
                Log::info('Auth Google faculty completion skipped: already linked', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Fakultas sudah terhubung pada akun ini',
                    'data' => new UserResource($user->load('faculty')),
                ]);
            }

            $faculty = Faculty::visible()->where('code', $request->facultyId)->firstOrFail();

            $user->update([
                'faculty_id' => $faculty->id,
            ]);

            Log::info('Auth Google faculty completion success', [
                'user_id' => $user->id,
                'email' => $user->email,
                'faculty_id' => $faculty->code,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Fakultas berhasil disimpan',
                'data' => new UserResource($user->fresh(['faculty'])),
            ]);
        } catch (\Throwable $e) {
            Log::error('Auth Google faculty completion failed', [
                'user_id' => $request->user()?->id,
                'facultyId' => $request->facultyId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
