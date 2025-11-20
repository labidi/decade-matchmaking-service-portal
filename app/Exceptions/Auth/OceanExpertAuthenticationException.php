<?php

declare(strict_types=1);

namespace App\Exceptions\Auth;

use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OceanExpertAuthenticationException extends Exception
{
    public function __construct(
        string $message,
        private readonly ?string $context = null
    ) {
        parent::__construct($message);
    }

    /**
     * Report the exception with context
     */
    public function report(): void
    {
        Log::channel('auth')->warning('Ocean Expert authentication failed', [
            'message' => $this->getMessage(),
            'context' => $this->context,
            'ip' => request()->ip(),
        ]);
    }

    /**
     * Render the exception as an HTTP response
     */
    public function render(Request $request): RedirectResponse
    {
        return redirect()
            ->route('sign.in')
            ->with('error', $this->getMessage())
            ->withInput($request->only('email'));
    }

    /**
     * Invalid credentials provided
     */
    public static function invalidCredentials(): self
    {
        return new self(
            'Invalid credentials provided',
            'credentials_invalid'
        );
    }

    /**
     * Ocean Expert service is unavailable
     */
    public static function serviceUnavailable(): self
    {
        return new self(
            'Ocean Expert authentication service is currently unavailable',
            'service_unavailable'
        );
    }

    /**
     * Ocean Expert API error
     */
    public static function apiError(string $message): self
    {
        return new self(
            "Ocean Expert API error: {$message}",
            'api_error'
        );
    }

    /**
     * User not found in Ocean Expert
     */
    public static function userNotFound(string $email): self
    {
        return new self(
            "User with email {$email} not found in Ocean Expert",
            'user_not_found'
        );
    }
}
