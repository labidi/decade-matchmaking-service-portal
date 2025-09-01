<?php

use App\Http\Controllers\Notifications\ListController;
use Illuminate\Support\Facades\Route;
use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;

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




Breadcrumbs::for('notification.preferences.index', function (BreadcrumbTrail $trail) {
    $trail->parent('user.home');
    $trail->push('Notifications preferences', route('notification.preferences.index'));
});



