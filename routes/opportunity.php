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
    Route::get('opportunity/show/{opportunity}', ShowController::class)->name('opportunity.show');
});

Route::middleware(['auth', 'role:partner'])->prefix('me')->group(function () {
    Route::get('opportunity/show/{opportunity}', ShowController::class)->name('me.opportunity.show');
    Route::get('opportunity/list', ListController::class)->name('me.opportunity.list');
});
// Partner routes
Route::middleware(['auth', 'role:partner'])->group(function () {
    Route::get('opportunity/create', [FormController::class, 'form'])->name('opportunity.create');
    Route::post('opportunity/submit/{opportunity?}', [FormController::class, 'store'])->name('opportunity.submit');
    Route::get('opportunity/edit/{opportunity}', [FormController::class, 'form'])->name('opportunity.edit');
    Route::patch('opportunity/{opportunity}/status', OpportunityUpdateStatusController::class)->name(
        'opportunity.status'
    );
    Route::post('opportunity/{opportunity}/extend', ExtendController::class)->name(
        'opportunity.extend'
    );
    Route::delete('opportunity/{opportunity}', OpportunityDestroyController::class)->name('opportunity.destroy');
});

// Admin routes
Route::middleware(['auth', 'role:administrator'])->prefix('admin')->group(function () {
    Route::get('opportunity/list', ListController::class)->name('admin.opportunity.list');
    Route::get('opportunity/{opportunity}/show', ShowController::class)->name('admin.opportunity.show');
    Route::get('opportunity/export/csv', OpportunityExportController::class)->name('admin.opportunity.export.csv');
});

Route::get('go/opportunity/{identifier}', function (\Illuminate\Http\Request $request, string $identifier) {
    $opportunity = ctype_digit($identifier)
        ? \App\Models\Opportunity::find($identifier)
        : \App\Models\Opportunity::where('public_id', $identifier)->first();

    abort_unless($opportunity !== null, 404);

    return app(\App\Http\Controllers\Opportunities\RedirectController::class)($request, $opportunity);
})
    ->middleware('throttle:60,1')
    ->name('opportunity.go');
