<?php

use App\Http\Controllers\Notifications\PreferencesController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:user'])->group(function () {
    Route::get('notification-preferences', [PreferencesController::class, 'index'])
        ->name('notification.preferences.index');

    Route::post('notification-preferences/store', [PreferencesController::class, 'store'])
        ->name('notification.preferences.store');
});




