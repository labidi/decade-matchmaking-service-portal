<?php

declare(strict_types=1);

namespace App\Services;

use Exception;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Psr\Log\LoggerInterface;
use RuntimeException;

class OceanExpertAuthService
{
    /**
     * Attempt to authenticate against the OceanExpert API.
     *
     * @return array Returns ['token' => string, 'user' => array]
     *
     * @throws Exception on network or auth failure
     */
    public function authenticate(string $email, string $password): array
    {
        $url = Config::get('services.oceanexpert.auth_url');
        if (! $url) {
            throw new RuntimeException('OceanExpert auth URL not configured.');
        }

        $response = Http::asJson()->post($url, [
            'username' => $email,
            'password' => $password,
        ]);
        $this->getLogger()->info('OceanExpert auth response', ['status' => $response->status(), 'body' => $response->body()]);

        if ($response->serverError()) {
            $this->getLogger()->error('OceanExpert auth server error', ['status' => $response->status(), 'body' => $response->body()]);
            throw new Exception('Authentication service is currently unavailable. Please try again later.');
        }

        if ($response->failed()) {
            $message = Arr::get($response->json(), 'error.message', 'Invalid credentials provided.');
            throw new Exception($message);
        }

        $data = $response->json();
        if (isset($data['error'])) {
            throw new Exception(Arr::get($data, 'error.message', 'Invalid credentials provided.'));
        }
        $token = Arr::get($data, 'token');
        if (! $token || ! is_string($token)) {
            throw new Exception('Authentication service did not return a valid token.');
        }
        $user = [
            'password' => $password,
            'email' => $email,
        ];

        return ['token' => $token, 'user' => $user];
    }

    private function getLogger(): LoggerInterface
    {
        return Log::channel('auth');
    }
}
