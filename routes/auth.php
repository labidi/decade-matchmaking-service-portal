<?php

use App\Http\Controllers\Auth\SessionController;
use App\Http\Controllers\Auth\SocialController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('signin', [SessionController::class, 'create'])
        ->name('sign.in');
    Route::post('signin', [SessionController::class, 'store'])->name('sign.in.post');

    // LinkedIn OAuth Routes
    Route::get('auth/linkedin', [SocialController::class, 'linkedinRedirect'])
        ->name('auth.linkedin');
    Route::get('auth/linkedin/callback', [SocialController::class, 'linkedinCallback'])
        ->name('auth.linkedin.callback');

    // Google OAuth Routes
    Route::get('auth/google', [SocialController::class, 'googleRedirect'])
        ->name('auth.google');
    Route::get('auth/google/callback', [SocialController::class, 'googleCallback'])
        ->name('auth.google.callback');
});

Route::middleware('auth')->group(function () {
    Route::post('signout', [SessionController::class, 'destroy'])
        ->name('sign.out');
});
