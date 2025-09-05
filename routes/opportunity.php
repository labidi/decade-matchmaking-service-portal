<?php

use App\Http\Controllers\Opportunities\DestroyController as OpportunityDestroyController;
use App\Http\Controllers\Opportunities\ExtendController;
use App\Http\Controllers\Opportunities\FormController;
use App\Http\Controllers\Opportunities\ListController;
use App\Http\Controllers\Opportunities\ShowController;
use App\Http\Controllers\Opportunities\UpdateStatusController as OpportunityUpdateStatusController;
use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;
use Illuminate\Support\Facades\Route;

// User routes
Route::middleware(['auth', 'role:user'])->group(function () {
    Route::get('opportunity/list', ListController::class)->name('opportunity.list');
    Route::get('opportunity/show/{id}', ShowController::class)->name('opportunity.show');
});

// Partner routes
Route::middleware(['auth', 'role:partner'])->group(function () {
    Route::get('opportunity/me/list', ListController::class)->name('opportunity.me.list');
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
});


Breadcrumbs::for('opportunity.create', function (BreadcrumbTrail $trail) {
    $trail->parent('user.home');
    $trail->push('Submit a new Opportunity', route('opportunity.create'));
});

Breadcrumbs::for('opportunity.me.list', function (BreadcrumbTrail $trail) {
    $trail->parent('user.home');
    $trail->push('My submitted opportunities', route('opportunity.me.list'));
});

Breadcrumbs::for('opportunity.show', function (BreadcrumbTrail $trail) {
    $trail->parent('user.home');
    $trail->push('My submitted opportunities', route('opportunity.me.list'));
    $trail->push('Opportunity details', route('opportunity.show', request('id')));
});

Breadcrumbs::for('opportunity.edit', function (BreadcrumbTrail $trail) {
    $trail->parent('user.home');
    $trail->push('My submitted opportunities', route('opportunity.me.list'));
    $trail->push('Edit Opportunity', route('opportunity.edit', request('id')));
});
