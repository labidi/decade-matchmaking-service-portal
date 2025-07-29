<?php

use App\Http\Controllers\Admin\NotificationsController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\RequestsController;
use Inertia\Inertia;
use App\Http\Controllers\User\OpportunityController as UserOpportunityController;
use App\Http\Controllers\OpportunitiesController;
use App\Http\Controllers\UserGuideController;
use App\Http\Controllers\Admin\UserRoleController;
use App\Http\Controllers\OffersController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Dashboard\IndexController;
use App\Http\Controllers\Admin\SettingsController;

use App\Http\Controllers\Admin\RequestsController as AdminRequestsController;
use App\Http\Controllers\Admin\OpportunitiesController as AdminOpportunityController;
use App\Http\Controllers\Admin\OffersController as AdminOffersController;
use App\Http\Controllers\LocationDataController;

Route::get('/', function () {
    return Inertia::render('Index', [
        'title' => 'Welcome',
        'description' => "",
        'banner' => [
            'title' => 'Connect for a Sustainable Ocean',
            'description' => "Whether you're seeking training or offering expertise, this platform makes the connection. It’s where organizations find support—and partners find purpose. By matching demand with opportunity, it brings the right people and resources together. A transparent marketplace driving collaboration, innovation, and impact.",
            'image' => '/assets/img/sidebar.png'
        ],
        'YoutubeEmbed' => [
            'src' => 'https://www.youtube.com/embed/nfpELa_Jqb0?si=S_imyR0XV4F6YcpU',
            'title' => 'Connect for a Sustainable Ocean'
        ],
        'userguide' => [
            'description' => 'A user guide to help you navigate the platform.',
            'url' => '/assets/pdf/user-guide.pdf',
        ],
        'metrics' => config('metrics')
    ]);
})->name('index');


Route::middleware(['auth', 'role:user'])->group(function () {
    Route::get('home', [HomeController::class, 'index'])->name('user.home');
    Route::get('user/request/create', [RequestsController::class, 'create'])->name('request.create');
    Route::get('request/me/list', [RequestsController::class, 'myRequestsList'])->name('request.me.list');
    Route::get('user/request/edit/{id}', [RequestsController::class, 'edit'])->name('request.edit');
    Route::get('user/request/show/{id}', [RequestsController::class, 'show'])->name('request.show');
    Route::get('request/preview/{id}', [RequestsController::class, 'preview'])->name('request.preview');
    Route::get('request/me/matched-requests', [RequestsController::class, 'matchedRequest'])->name(
        'request.me.matched-requests'
    );

    Route::get('user/request/pdf/{id}', [RequestsController::class, 'exportPdf'])->name('request.pdf');
    Route::post('user/request/submit', [RequestsController::class, 'submit'])->name('request.submit');
    Route::post('request/{id}/express-interest', [RequestsController::class, 'expressInterest'])->name(
        'request.express.interest'
    );

    Route::patch('request/{id}/update-status', [RequestsController::class, 'updateStatus'])->name(
        'request.update.status'
    );
    Route::post('user/request/{request}/document', [\App\Http\Controllers\DocumentsController::class, 'store'])->name(
        'user.request.document.store'
    );
    Route::delete('user/document/{document}', [\App\Http\Controllers\DocumentsController::class, 'destroy'])->name(
        'user.document.destroy'
    );
    Route::get('user/document/{document}/download', [\App\Http\Controllers\DocumentsController::class, 'download']
    )->name('user.document.download');
    Route::delete('user/request/{id}', [RequestsController::class, 'destroy'])->name('user.request.destroy');
    Route::get('user/opportunity/show/{id}', [UserOpportunityController::class, 'show'])->name('user.opportunity.show');
    Route::get('opportunity/list', [OpportunitiesController::class, 'list'])->name('opportunity.list');
    Route::get('opportunity/show/{id}', [OpportunitiesController::class, 'show'])->name('opportunity.show');
});

Route::middleware(['auth', 'role:partner'])->group(function () {
    Route::get('opportunity/me/list', [OpportunitiesController::class, 'mySubmittedList'])->name(
        'opportunity.me.list'
    );
    Route::get('opportunity/create', [OpportunitiesController::class, 'create'])->name('partner.opportunity.create');
    Route::post('opportunity/store', [OpportunitiesController::class, 'store'])->name('partner.opportunity.store');
    Route::get('opportunity/browse', [OpportunitiesController::class, 'list'])->name('opportunity.browse');
    Route::patch('opportunity/{id}/status', [OpportunitiesController::class, 'updateStatus'])->name(
        'partner.opportunity.status'
    );
    Route::delete('opportunity/{id}', [OpportunitiesController::class, 'destroy'])->name(
        'partner.opportunity.destroy'
    );
    Route::get('request/list', [RequestsController::class, 'list'])->name('request.list');
    Route::get('opportunity/edit/{id}', [OpportunitiesController::class, 'edit'])->name('opportunity.edit');
});

Route::middleware(['auth', 'role:administrator'])->prefix('admin')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('admin.dashboard.index');
    Route::get('settings', [SettingsController::class, 'index'])->name('admin.portal.settings');
    Route::get('request/list', [AdminRequestsController::class, 'list'])->name('admin.request.list');
    Route::get('request/show/{request}', [AdminRequestsController::class, 'show'])->name('admin.request.show');
    Route::get('request/offers/{request}', [AdminRequestsController::class, 'show'])->name('admin.request.offers.list');
    Route::post('request/{request}/update-status', [AdminRequestsController::class, 'updateStatus'])->name('admin.request.update-status');

    Route::get('opportunity/list', [AdminOpportunityController::class, 'list'])->name('admin.opportunity.list');
    Route::get('request/export/csv', [AdminRequestsController::class, 'exportCsv'])->name('admin.request.export.csv');

    // Offer Management Routes
    Route::get('offers', [AdminOffersController::class, 'list'])->name('admin.offers.list');
    Route::get('offers/create', [AdminOffersController::class, 'create'])->name('admin.offers.create');
    Route::post('offers', [AdminOffersController::class, 'store'])->name('admin.offers.store');
    Route::get('offers/{id}', [AdminOffersController::class, 'show'])->name('admin.offers.show');
    Route::get('offers/{id}/edit', [AdminOffersController::class, 'edit'])->name('admin.offers.edit');
    Route::put('offers/{id}', [AdminOffersController::class, 'update'])->name('admin.offers.update');
    Route::delete('offers/{id}', [AdminOffersController::class, 'destroy'])->name('admin.offers.destroy');

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


Route::post('request/{request}/offer', [OffersController::class, 'store'])->name('request.offer.store');
Route::get('request/{request}/offers', [OffersController::class, 'list'])->name('request.offer.list');
Route::patch('request/{request}/offer/{offer}/status', [OffersController::class, 'updateStatus'])->name(
    'request.offer.update-status'
);

Route::prefix('guide')->group(function () {
    Route::get('platform-guide.pdf', [UserGuideController::class, 'download'])->name('user.guide');
});

// Location data routes
Route::get('api/location-data', [LocationDataController::class, 'index'])->name('api.location-data');
Route::get(
    'api/location-data/implementation/{coverageActivity}',
    [LocationDataController::class, 'getImplementationLocationOptions']
)->name('api.location-data.implementation');
Route::get('api/partners', [OffersController::class, 'partnersList'])->name('api.partners.list');


require __DIR__ . '/auth.php';
