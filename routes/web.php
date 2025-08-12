<?php

use App\Http\Controllers\Admin\NotificationsController;
use App\Http\Controllers\NotificationPreferencesController;
use App\Http\Controllers\Offer\Admin\DestroyController;
use App\Http\Controllers\Offer\Admin\EditController;
use App\Http\Controllers\Offer\Admin\UpdateController;
use App\Http\Controllers\Offer\ListController;
use App\Http\Controllers\Offer\PartnersListController;
use App\Http\Controllers\Offer\StoreController;
use App\Http\Controllers\Offer\UpdateStatusController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use Inertia\Inertia;
use App\Http\Controllers\UserGuideController;
use App\Http\Controllers\Admin\UserRoleController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Dashboard\IndexController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Opportunities\ListController as OpportunityListController;
use App\Http\Controllers\LocationDataController;

Route::get('/', \App\Http\Controllers\IndexController::class)->name('index');

Route::middleware(['auth', 'role:user'])->group(function () {
    Route::get('home', [HomeController::class, 'index'])->name('user.home');

    Route::post('offer/{id}/document', [\App\Http\Controllers\DocumentsController::class, 'storeOfferDocument'])->name(
        'user.offer.document.store'
    );
    Route::delete('user/document/{document}', [\App\Http\Controllers\DocumentsController::class, 'destroy'])->name(
        'user.document.destroy'
    );
    Route::get('user/document/{document}/download', [\App\Http\Controllers\DocumentsController::class, 'download']
    )->name('user.document.download');
});

Route::middleware(['auth', 'role:administrator'])->prefix('admin')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('admin.dashboard.index');
    Route::get('settings', [SettingsController::class, 'index'])->name('admin.settings.index');
    Route::post('settings', [SettingsController::class, 'update'])->name('admin.settings.update');
    Route::post('settings/organizations/csv-upload', [SettingsController::class, 'uploadOrganizationsCsv'])->name('admin.settings.organizations.csv-upload');


    Route::post('users/{user}/roles', [UserRoleController::class, 'update'])->name('admin.users.roles.update');
    Route::get('user/list', [UserRoleController::class, 'index'])->name('admin.users.roles.list');
    Route::get('notifications', [NotificationsController::class, 'index'])->name('admin.notifications.index');
    Route::get('notifications/{notification}', [NotificationsController::class, 'show'])->name(
        'admin.notifications.show'
    );
    Route::get('notifications/{notification}/read', [NotificationsController::class, 'markAsRead'])->name(
        'admin.notifications.read'
    );
});

Route::prefix('guide')->group(function () {
    Route::get('platform-guide.pdf', [UserGuideController::class, 'download'])->name('user.guide');
});

// Location data routes
Route::get('api/location-data', [LocationDataController::class, 'index'])->name('api.location-data');
Route::get(
    'api/location-data/implementation/{coverageActivity}',
    [LocationDataController::class, 'getImplementationLocationOptions']
)->name('api.location-data.implementation');

require __DIR__ . '/auth.php';
require __DIR__ . '/request.php';
require __DIR__ . '/opportunity.php';
require __DIR__ . '/offer.php';
