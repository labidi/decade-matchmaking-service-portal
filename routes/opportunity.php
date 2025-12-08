<?php
use App\Http\Controllers\Opportunities\DestroyController as OpportunityDestroyController;
use App\Http\Controllers\Opportunities\ExportController as OpportunityExportController;
use App\Http\Controllers\Opportunities\ExtendController;
use App\Http\Controllers\Opportunities\FormController;
use App\Http\Controllers\Opportunities\ListController;
use App\Http\Controllers\Opportunities\ShowController;
use App\Http\Controllers\Opportunities\UpdateStatusController as OpportunityUpdateStatusController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('opportunity/list', ListController::class)->name('opportunity.list');
    Route::get('opportunity/show/{id}', ShowController::class)->name('opportunity.show');
});

Route::middleware(['auth', 'role:partner'])->prefix('me')->group(function () {
    Route::get('opportunity/show/{id}', ShowController::class)->name('me.opportunity.show');
    Route::get('opportunity/list', ListController::class)->name('me.opportunity.list');
});
// Partner routes
Route::middleware(['auth', 'role:partner'])->group(function () {
    Route::get('opportunity/create', [FormController::class, 'form'])->name('opportunity.create');
    Route::post('opportunity/submit/{id?}', [FormController::class, 'store'])->name('opportunity.submit');
    Route::get('opportunity/edit/{id}', [FormController::class, 'form'])->name('opportunity.edit');
    Route::patch('opportunity/{id}/status', OpportunityUpdateStatusController::class)->name(
        'opportunity.status'
    );
    Route::post('opportunity/{id}/extend', ExtendController::class)->name(
        'opportunity.extend'
    );
    Route::delete('opportunity/{id}', OpportunityDestroyController::class)->name('opportunity.destroy');
});

// Admin routes
Route::middleware(['auth', 'role:administrator'])->prefix('admin')->group(function () {
    Route::get('opportunity/list', ListController::class)->name('admin.opportunity.list');
    Route::get('opportunity/{id}/show', ShowController::class)->name('admin.opportunity.show');
    Route::get('opportunity/export/csv', OpportunityExportController::class)->name('admin.opportunity.export.csv');
});
