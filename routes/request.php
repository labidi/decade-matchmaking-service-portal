<?php

use App\Http\Controllers\DocumentsController;
use App\Http\Controllers\Request\ExportRequestPdfController;
use App\Http\Controllers\Request\ExpressInterestController;
use App\Http\Controllers\Request\RequestFormController;
use App\Http\Controllers\Request\RequestListController;
use App\Http\Controllers\Request\RequestManagementController;
use App\Http\Controllers\Request\ViewController;
use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Request Routes
|--------------------------------------------------------------------------
|
| Here are all routes related to request functionality including
| request creation, editing, viewing, management, and file handling.
|
*/

// User role request routes
Route::middleware(['auth', 'role:user'])->group(function () {
    // Request CRUD operations
    Route::get('request/create', [RequestFormController::class, 'form'])->name('request.create');
    Route::get('request/{id}/edit', [RequestFormController::class, 'form'])->name('request.edit');
    Route::get('request/{id}/show', [ViewController::class, 'show'])->name('request.show');
    Route::post('request/submit/{id?}', [RequestFormController::class, 'submit'])->name('request.submit');
    Route::delete('request/{id}', [RequestManagementController::class, 'destroy'])->name('user.request.destroy');

    Route::get('pdf/{id}', ExportRequestPdfController::class)->name('request.pdf');

    Route::get('request/me/list', [RequestListController::class, 'myRequests'])->name('request.me.list');
    Route::get('request/me/matched-requests', [RequestListController::class, 'matchedRequests'])->name(
        'request.me.matched-requests'
    );
    Route::get('request/me/subscribed-requests', [RequestListController::class, 'subscribedRequest'])->name(
        'request.me.subscribed-requests'
    );

    // Request interaction
    Route::post('request/{id}/express-interest', ExpressInterestController::class)->name(
        'request.express.interest'
    );
    Route::patch('request/{id}/update-status', [RequestManagementController::class, 'updateStatus'])->name(
        'request.update.status'
    );

    // Request document management
    Route::post('request/{request}/document', [DocumentsController::class, 'store'])->name(
        'user.request.document.store'
    );
});

// Partner role request routes
Route::middleware(['auth', 'role:partner'])->group(function () {
    // Request listings for partners
    Route::get('request/list', [RequestListController::class, 'publicRequests'])->name('request.list');
});

Route::middleware(['auth', 'role:administrator'])->prefix('admin')->group(function () {
    Route::post('request/{id}/update-status', [RequestManagementController::class, 'updateStatus'])->name(
        'admin.request.update-status'
    );
    Route::get('request/list', [RequestListController::class, 'list'])->name('admin.request.list');
    Route::get('request/{id}/show', [ViewController::class, 'show'])->name('admin.request.show');
    Route::get('request/export/csv', [RequestListController::class, 'exportCsv'])->name('admin.request.export.csv');
});

Breadcrumbs::for('request.me.list', function (BreadcrumbTrail $trail) {
    $trail->parent('user.home');
    $trail->push('List of my request', route('request.me.list'));
});

Breadcrumbs::for('request.create', function (BreadcrumbTrail $trail) {
    $trail->parent('user.home');
    $trail->push('List of my request', route('request.me.list'));
    $trail->push('Submit new request', route('request.create'));
});

Breadcrumbs::for('request.edit', function (BreadcrumbTrail $trail) {
    $trail->parent('user.home');
    $trail->push('List of my request', route('request.me.list'));
    $trail->push('Request #'.request('id'), route('request.edit', request('id')));
});

Breadcrumbs::for('request.show', function (BreadcrumbTrail $trail) {
    $trail->parent('user.home');
    $trail->push('List of my request', route('request.me.list'));
    $trail->push('Request #'.request('id'), route('request.show', request('id')));
});
