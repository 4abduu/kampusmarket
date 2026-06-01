<?php

namespace App\Services;

use App\Models\User;

class GoogleAuthService
{
    public function findOrCreateGoogleUser(array $googleUser): array
    {
        $user = User::with('faculty')
            ->where('google_id', $googleUser['id'])
            ->orWhere('email', $googleUser['email'])
            ->first();

        $isNewUser = false;

        if (!$user) {
            $user = User::create([
                'name' => $googleUser['name'],
                'email' => $googleUser['email'],
                'google_id' => $googleUser['id'],
                'avatar' => $googleUser['picture'] ?? null,
                'is_verified' => true,
                'email_verified_at' => now(),
            ]);

            $isNewUser = true;
        } elseif (!$user->google_id) {
            $user->update([
                'google_id' => $googleUser['id'],
                'avatar' => $googleUser['picture'] ?? $user->avatar,
                'is_verified' => true,
            ]);
        }

        return [$user, $isNewUser];
    }
}
