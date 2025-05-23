<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;
use Illuminate\Http\Response;
use Illuminate\Support\Arr;

class OceanExpertAuthService
{
    /**
     * Attempt to authenticate against the OceanExpert API.
     *
     * @param  string  $email
     * @param  string  $password
     * @return array  Returns ['token' => string, 'user' => array]
     *
     * @throws \Exception on network or auth failure
     */
    public function authenticate(string $email, string $password): array
    {
        $url = Config::get('services.oceanexpert.auth_url');
        if (! $url) {
            throw new \RuntimeException('OceanExpert auth URL not configured.');
        }

        $response = Http::asJson()->post($url, [
            'username'    => $email,
            'password' => $password,
        ]);
        Log::info('OceanExpert auth response', ['status' => $response->status(), 'body' => $response->body()]);

        if ($response->serverError()) {
            Log::error('OceanExpert auth server error', ['status' => $response->status(), 'body' => $response->body()]);
            throw new \Exception('Authentication service is currently unavailable. Please try again later.');
        }

        if ($response->failed()) {
            $message = Arr::get($response->json(), 'error.message', 'Invalid credentials provided.');
            throw new \Exception($message);
        }

        $data = $response->json();

        $token = Arr::get($data, 'token');
        $user  = [
            'password'  => $password,
            'email' => $email,
        ];

        if (! $token || ! is_string($token)) {
            throw new \Exception('Authentication service did not return a valid token.');
        }

        return ['token' => $token, 'user' => $user];
    }
}
