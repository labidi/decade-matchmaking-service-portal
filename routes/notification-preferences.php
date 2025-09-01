<?php

use App\Http\Controllers\Notifications\ListController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:user'])->group(function () {
    Route::get('notification-preferences', [ListController::class, 'list'])
        ->name('notification.preferences.index');

    Route::post('notification-preferences/store', [ListController::class, 'store'])
        ->name('notification.preferences.store');

    Route::patch('notification-preferences/{preference}', [ListController::class, 'update'])
        ->name('notification.preferences.update');

    Route::delete('notification-preferences', [ListController::class, 'destroy'])
        ->name('notification.preferences.destroy');

    Route::get('notification-preferences/available-options', [ListController::class, 'availableOptions'])
        ->name('notification.preferences.available-options');
});




