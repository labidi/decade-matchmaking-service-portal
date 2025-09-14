<?php

use App\Http\Controllers\Admin\NotificationsController;
use App\Http\Controllers\Admin\SubscriptionController;
use App\Http\Controllers\Admin\UserRoleController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentsController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\UserGuideController;
use Illuminate\Support\Facades\Route;

Route::get('/', \App\Http\Controllers\IndexController::class)->name('index');
Route::get('organizations', [\App\Http\Controllers\OrganizationsController::class, 'index'])->name('organizations.index');

// Access denied route for direct navigation
Route::get('/access-denied', function () {
    return \Inertia\Inertia::render('Auth/AccessDenied', [
        'requiredRoles' => request('roles', []),
        'contactEmail' => 'cdf@unesco.org',
        'attemptedRoute' => request('route'),
    ]);
})->name('access.denied')->middleware('auth');

Route::middleware(['auth'])->group(function () {
    Route::get('home', [HomeController::class, 'index'])->name('user.home');
});

Route::middleware(['auth', 'role:user'])->group(function () {

    // User subscription routes
    Route::get('subscriptions', [\App\Http\Controllers\SubscriptionController::class, 'index'])->name('user.subscriptions.index');
    Route::post('subscriptions/subscribe', [\App\Http\Controllers\SubscriptionController::class, 'subscribe'])->name('user.subscriptions.subscribe');
    Route::post('subscriptions/unsubscribe', [\App\Http\Controllers\SubscriptionController::class, 'unsubscribe'])->name('user.subscriptions.unsubscribe');
    Route::get('subscriptions/status', [\App\Http\Controllers\SubscriptionController::class, 'status'])->name('user.subscriptions.status');
    Route::post('offer/{id}/document', [DocumentsController::class, 'storeOfferDocument'])->name(
        'user.offer.document.store'
    );
    Route::delete('user/document/{document}', [DocumentsController::class, 'destroy'])->name(
        'user.document.destroy'
    );
    Route::get('user/document/{document}/download', [DocumentsController::class, 'download']
    )->name('user.document.download');
});

Route::middleware(['auth', 'role:administrator'])->prefix('admin')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('admin.dashboard.index');
    Route::get('settings', [SettingsController::class, 'index'])->name('admin.settings.index');
    Route::post('settings', [SettingsController::class, 'update'])->name('admin.settings.update');
    Route::post('settings/organizations/csv-upload', [SettingsController::class, 'uploadOrganizationsCsv'])->name('admin.settings.organizations.csv-upload');

    // Admin subscription management routes
    Route::get('subscriptions', [SubscriptionController::class, 'index'])->name('admin.subscriptions.index');
    Route::post('subscriptions/subscribe-user', [SubscriptionController::class, 'subscribeUser'])->name('admin.subscriptions.subscribe-user');
    Route::post('subscriptions/unsubscribe-user', [SubscriptionController::class, 'unsubscribeUser'])->name('admin.subscriptions.unsubscribe-user');
    Route::get('subscriptions/request/{request}', [SubscriptionController::class, 'requestSubscribers'])->name('admin.subscriptions.request-subscribers');
    Route::get('subscriptions/user/{user}', [SubscriptionController::class, 'userSubscriptions'])->name('admin.subscriptions.user-subscriptions');
    Route::post('subscriptions/bulk-unsubscribe', [SubscriptionController::class, 'bulkUnsubscribe'])->name('admin.subscriptions.bulk-unsubscribe');

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

require_once __DIR__.'/auth.php';
require_once __DIR__.'/request.php';
require_once __DIR__.'/opportunity.php';
require_once __DIR__.'/offer.php';
require_once __DIR__.'/notification-preferences.php';
