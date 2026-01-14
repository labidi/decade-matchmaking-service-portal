<?php

declare(strict_types=1);

namespace App\Services\Auth\Strategies;

use App\Contracts\Auth\AuthenticationStrategyInterface;
use App\DTOs\Auth\AuthenticationResult;
use App\Exceptions\Auth\OceanExpertAuthenticationException;
use App\Models\User;
use App\Services\OceanExpertAuthService;
use App\Services\OceanExpertSearchService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Throwable;

class OceanExpertAuthStrategy implements AuthenticationStrategyInterface
{
    public function __construct(
        private readonly OceanExpertAuthService $authService,
        private readonly OceanExpertSearchService $searchService
    ) {}

    /**
     * Authenticate user against Ocean Expert API
     *
     * @param array{email: string, password: string} $credentials
     *
     * @throws OceanExpertAuthenticationException
     */
    public function authenticate(array $credentials): AuthenticationResult
    {
        // Validate required credentials
        if (! isset($credentials['email'], $credentials['password'])) {
            throw OceanExpertAuthenticationException::invalidCredentials();
        }

        $email = $credentials['email'];
        $password = $credentials['password'];

        try {
            // Authenticate with Ocean Expert API
            ['token' => $token, 'user' => $userPayload] = $this->authService->authenticate(
                $email,
                $password
            );

            // Fetch user profile from Ocean Expert Search API
            $profile = $this->searchService->searchUserByEmail($email);

            // Create or update local user in database transaction
            $user = $this->syncLocalUser($email, $password, $profile);

            return new AuthenticationResult(
                user: $user,
                authMethod: 'ocean_expert',
                externalToken: $token,
            );
        } catch (OceanExpertAuthenticationException $e) {
            // Re-throw our custom exceptions
            throw $e;
        } catch (Throwable $e) {
            Log::channel('auth')->error('Ocean Expert authentication failed', [
                'email' => $email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Determine appropriate exception based on error message
            if (str_contains($e->getMessage(), 'unavailable')) {
                throw OceanExpertAuthenticationException::serviceUnavailable();
            }

            if (str_contains($e->getMessage(), 'Invalid credentials')) {
                throw OceanExpertAuthenticationException::invalidCredentials();
            }

            throw OceanExpertAuthenticationException::apiError($e->getMessage());
        }
    }

    /**
     * Check if this strategy supports the given credentials
     */
    public function supports(array $credentials): bool
    {
        return isset($credentials['email'], $credentials['password'])
            && ! isset($credentials['socialite_user']);
    }

    /**
     * Synchronize local user with Ocean Expert profile data
     *
     * @param string $email User email
     * @param string $password User password
     * @param array<string, mixed> $profile Ocean Expert profile data
     *
     * @throws Throwable
     */
    private function syncLocalUser(string $email, string $password, array $profile): User
    {
        return DB::transaction(function () use ($email, $password, $profile) {
            $userData = [
                'name' => $profile['name'] ?? ($profile['first_name'] . ' ' . $profile['last_name']),
                'password' => Hash::make($password),
                'first_name' => $profile['first_name'] ?? null,
                'last_name' => $profile['last_name'] ?? null,
                'country' => $profile['country'] ?? null,
                'city' => $profile['city'] ?? null,
            ];

            return User::updateOrCreate(
                ['email' => $email],
                $userData
            );
        });
    }
}
