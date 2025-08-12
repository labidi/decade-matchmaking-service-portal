<?php

use App\Http\Controllers\Offer\Admin\DestroyController;
use App\Http\Controllers\Offer\Admin\EditController;
use App\Http\Controllers\Offer\Admin\UpdateController;
use App\Http\Controllers\Offer\UpdateStatusController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:administrator'])->prefix('admin')->group(function () {
    Route::get('offers', \App\Http\Controllers\Offer\Admin\ListController::class)->name('admin.offers.list');
    Route::get('offers/create', \App\Http\Controllers\Offer\Admin\CreateController::class)->name(
        'admin.offers.create'
    );
    Route::post('offers', \App\Http\Controllers\Offer\Admin\StoreController::class)->name('admin.offers.store');
    Route::get('offers/{id}', \App\Http\Controllers\Offer\Admin\ShowController::class)->name('admin.offers.show');
    Route::get('offers/{id}/edit', EditController::class)->name('admin.offers.edit');
    Route::put('offers/{id}', UpdateController::class)->name('admin.offers.update');
    Route::delete('offers/{id}', DestroyController::class)->name('admin.offers.destroy');

    Route::post('offer/{id}/update-status', UpdateStatusController::class)->name(
        'admin.offer.update-status'
    );
});

//Route::post('request/{request}/offer', StoreController::class)->name('request.offer.store');
//Route::get('request/{request}/offers', ListController::class)->name('request.offer.list');
