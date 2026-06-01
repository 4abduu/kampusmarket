<?php

namespace App\Http\Controllers\Api\Concerns;

trait ManagesAuthCookies
{
    private function getAuthCookieConfig(): array
    {
        $isSecure = config('app.env') === 'production';
        $cookieDomain = config('app.env') === 'production' ? config('app.cookie_domain') : null;

        return [$cookieDomain, $isSecure];
    }

    private function attachAuthCookies($response, string $token, bool $needsFacultySelection, bool $isNewUser = false)
    {
        [$cookieDomain, $isSecure] = $this->getAuthCookieConfig();
        $sameSite = config('app.env') === 'production' ? 'None' : 'Lax';

        $response->cookie('authToken', $token, 60 * 24 * 7, '/', $cookieDomain, $isSecure, true, false, $sameSite);
        $response->cookie('requiresFacultySelection', $needsFacultySelection ? 'true' : 'false', 60 * 24 * 7, '/', $cookieDomain, $isSecure, true, false, $sameSite);
        $response->cookie('isNewUser', $isNewUser ? 'true' : 'false', 60 * 24 * 7, '/', $cookieDomain, $isSecure, true, false, $sameSite);

        return $response;
    }
}
