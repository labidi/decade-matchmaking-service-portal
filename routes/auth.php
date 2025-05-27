<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\SessionController;

Route::middleware('guest')->group(function () {
    Route::get('signin', [SessionController::class, 'create'])
        ->name('sign.in');
    Route::post('signin', [SessionController::class, 'store'])->name('sign.in.post');
});

Route::middleware('auth')->group(function () {
    Route::post('signout', [SessionController::class, 'destroy'])
        ->name('sign.out');
});