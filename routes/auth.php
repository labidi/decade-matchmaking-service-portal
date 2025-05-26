<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\SessionController;

Route::middleware('guest')->group(function () {
    Route::get('login', [SessionController::class, 'create'])
        ->name('login');
    Route::post('login', [SessionController::class, 'store'])->name('login.post');
});

Route::middleware('auth')->group(function () {
    Route::get('logout', [SessionController::class, 'destroy'])
        ->name('logout');
});