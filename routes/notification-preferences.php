<?php

use App\Http\Controllers\Notifications\ListController;
use App\Http\Controllers\Notifications\ResubscribeController;
use App\Http\Controllers\Notifications\ToggleController;
use Illuminate\Support\Facades\Route;
use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;

Route::middleware(['auth'])->group(function () {
    Route::get('notification-preferences', [ListController::class, 'list'])
        ->name('notification.preferences.index');

    Route::put('notification-preferences/toggle', ToggleController::class)
        ->name('notification.preferences.toggle');

    Route::put('notification-preferences/resubscribe', ResubscribeController::class)
        ->name('notification.preferences.resubscribe');
});


Breadcrumbs::for('notification.preferences.index', function (BreadcrumbTrail $trail) {
    $trail->parent('user.home');
    $trail->push('Notifications preferences', route('notification.preferences.index'));
});
