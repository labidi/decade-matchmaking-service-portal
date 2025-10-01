<?php

use App\Http\Controllers\Notifications\DestroyController;
use App\Http\Controllers\Notifications\ListController;
use App\Http\Controllers\Notifications\StoreController;
use App\Http\Controllers\Notifications\UpdateController;
use Illuminate\Support\Facades\Route;
use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;

Route::middleware(['auth'])->group(function () {
    Route::get('notification-preferences', [ListController::class, 'list'])
        ->name('notification.preferences.index');

    Route::post('notification-preferences/store', StoreController::class)
        ->name('notification.preferences.store');

    Route::put('notification-preferences/{preference}', UpdateController::class)
        ->name('notification.preferences.update');

    Route::delete('notification-preferences/{preference}', DestroyController::class)
        ->name('notification.preferences.destroy');

    Route::get('notification-preferences/available-options', [ListController::class, 'availableOptions'])
        ->name('notification.preferences.available-options');
});


Breadcrumbs::for('notification.preferences.index', function (BreadcrumbTrail $trail) {
    $trail->parent('user.home');
    $trail->push('Notifications preferences', route('notification.preferences.index'));
});



