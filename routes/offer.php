<?php

use App\Http\Controllers\Offer\AcceptOfferController;
use App\Http\Controllers\Offer\DestroyController;
use App\Http\Controllers\Offer\FormController;
use App\Http\Controllers\Offer\ListController;
use App\Http\Controllers\Offer\ShowController;
use App\Http\Controllers\Offer\StoreController;
use App\Http\Controllers\Offer\UpdateController;
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

// Public routes for offer acceptance (authenticated users only)
Route::middleware(['auth'])->group(function () {
    Route::post('offer/{id}/accept', AcceptOfferController::class)->name('offer.accept');
});

//Route::post('request/{request}/offer', StoreController::class)->name('request.offer.store');
//Route::get('request/{request}/offers', ListController::class)->name('request.offer.list');
