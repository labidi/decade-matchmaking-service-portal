<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\NotificationsController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\UserRoleController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LocationDataController;
use App\Http\Controllers\Offer\PartnersListController;
use App\Http\Controllers\UserGuideController;
use Illuminate\Support\Facades\Route;

Route::get('/', \App\Http\Controllers\IndexController::class)->name('index');

Route::middleware(['auth', 'role:user'])->group(function () {
    Route::get('home', [HomeController::class, 'index'])->name('user.home');

    // User subscription routes
    Route::get('subscriptions', [\App\Http\Controllers\SubscriptionController::class, 'index'])->name('user.subscriptions.index');
    Route::post('subscriptions/subscribe', [\App\Http\Controllers\SubscriptionController::class, 'subscribe'])->name('user.subscriptions.subscribe');
    Route::post('subscriptions/unsubscribe', [\App\Http\Controllers\SubscriptionController::class, 'unsubscribe'])->name('user.subscriptions.unsubscribe');
    Route::get('subscriptions/status', [\App\Http\Controllers\SubscriptionController::class, 'status'])->name('user.subscriptions.status');

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

    // Admin subscription management routes
    Route::get('subscriptions', [\App\Http\Controllers\Admin\SubscriptionController::class, 'index'])->name('admin.subscriptions.index');
    Route::post('subscriptions/subscribe-user', [\App\Http\Controllers\Admin\SubscriptionController::class, 'subscribeUser'])->name('admin.subscriptions.subscribe-user');
    Route::post('subscriptions/unsubscribe-user', [\App\Http\Controllers\Admin\SubscriptionController::class, 'unsubscribeUser'])->name('admin.subscriptions.unsubscribe-user');
    Route::get('subscriptions/request/{request}', [\App\Http\Controllers\Admin\SubscriptionController::class, 'requestSubscribers'])->name('admin.subscriptions.request-subscribers');
    Route::get('subscriptions/user/{user}', [\App\Http\Controllers\Admin\SubscriptionController::class, 'userSubscriptions'])->name('admin.subscriptions.user-subscriptions');
    Route::post('subscriptions/bulk-unsubscribe', [\App\Http\Controllers\Admin\SubscriptionController::class, 'bulkUnsubscribe'])->name('admin.subscriptions.bulk-unsubscribe');

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
