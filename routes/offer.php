<?php

use App\Http\Controllers\Offer\Admin\ListController;
use App\Http\Controllers\Offer\Admin\UpdateController;
use App\Http\Controllers\Offer\DestroyController;
use App\Http\Controllers\Offer\FormController;
use App\Http\Controllers\Offer\ShowController;
use App\Http\Controllers\Offer\StoreController;
use App\Http\Controllers\Offer\UpdateStatusController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:administrator'])->prefix('admin')->group(function () {
    Route::get('offer', ListController::class)->name('admin.offer.list');
    Route::get('offer/create', FormController::class)->name('admin.offer.create');
    Route::get('offer/{id}', ShowController::class)->name('admin.offer.show');
    Route::get('offer/{id}/edit', FormController::class)->name('admin.offer.edit');
    Route::post('offer', StoreController::class)->name('admin.offer.store');
    Route::put('offer/{id}', UpdateController::class)->name('admin.offer.update');
    Route::delete('offer/{id}', DestroyController::class)->name('admin.offer.destroy');

    Route::post('offer/{id}/update-status', UpdateStatusController::class)->name(
        'admin.offer.update-status'
    );
});

//Route::post('request/{request}/offer', StoreController::class)->name('request.offer.store');
//Route::get('request/{request}/offers', ListController::class)->name('request.offer.list');
