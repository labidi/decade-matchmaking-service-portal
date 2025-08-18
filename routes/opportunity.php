<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Opportunities\FormController as OpportunityCreateController;
use App\Http\Controllers\Opportunities\StoreController as OpportunityStoreController;
use App\Http\Controllers\Opportunities\ListController as OpportunityListController;
use App\Http\Controllers\Opportunities\ShowController as OpportunityShowController;
use App\Http\Controllers\Opportunities\EditController as OpportunityEditController;
use App\Http\Controllers\Opportunities\UpdateStatusController as OpportunityUpdateStatusController;
use App\Http\Controllers\Opportunities\DestroyController as OpportunityDestroyController;

// User routes
Route::middleware(['auth', 'role:user'])->group(function () {
    Route::get('opportunity/list', OpportunityListController::class)->name('opportunity.list');
    Route::get('opportunity/show/{id}', OpportunityShowController::class)->name('opportunity.show');
});

// Partner routes
Route::middleware(['auth', 'role:partner'])->group(function () {
    Route::get('opportunity/me/list', OpportunityListController::class)->name('opportunity.me.list');
    Route::get('opportunity/create', OpportunityCreateController::class)->name('opportunity.create');
    Route::post('opportunity/store', OpportunityStoreController::class)->name('opportunity.store');
    Route::patch('opportunity/{id}/status', OpportunityUpdateStatusController::class)->name('partner.opportunity.status');
    Route::delete('opportunity/{id}', OpportunityDestroyController::class)->name('partner.opportunity.destroy');
    Route::get('opportunity/edit/{id}', OpportunityEditController::class)->name('opportunity.edit');
});

// Admin routes
Route::middleware(['auth', 'role:administrator'])->prefix('admin')->group(function () {
    Route::get('opportunity/list', OpportunityListController::class)->name('admin.opportunity.list');
});
