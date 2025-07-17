<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OcdRequestController;
use Inertia\Inertia;
use App\Http\Controllers\User\OpportunityController as UserOpportunityController;
use App\Http\Controllers\OcdOpportunityController;
use App\Http\Controllers\UserGuideController;
use App\Http\Controllers\Admin\UserRoleController;
use App\Http\Controllers\RequestOfferController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Dashboard\IndexController;

use App\Http\Controllers\Admin\OcdRequestController as AdminOcdRequestController;
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
    Route::get('user/request/create', [OcdRequestController::class, 'create'])->name('user.request.create');
    Route::get('request/me/list', [OcdRequestController::class, 'myRequestsList'])->name('request.me.list');
    Route::get('user/request/edit/{id}', [OcdRequestController::class, 'edit'])->name('user.request.edit');
    Route::get('user/request/show/{id}', [OcdRequestController::class, 'show'])->name('user.request.show');
    Route::get('request/preview/{id}', [OcdRequestController::class, 'preview'])->name('request.preview');
    Route::get('request/me/matched-requests', [OcdRequestController::class, 'matchedRequest'])->name(
        'request.me.matched-requests'
    );

    Route::get('user/request/pdf/{id}', [OcdRequestController::class, 'exportPdf'])->name('user.request.pdf');
    Route::post('user/request/submit', [OcdRequestController::class, 'submit'])->name('user.request.submit');

    Route::patch('request/{id}/update-status', [OcdRequestController::class, 'updateStatus'])->name(
        'request.update.status'
    );
    Route::post('user/request/{request}/document', [\App\Http\Controllers\DocumentController::class, 'store'])->name(
        'user.request.document.store'
    );
    Route::delete('user/document/{document}', [\App\Http\Controllers\DocumentController::class, 'destroy'])->name(
        'user.document.destroy'
    );
    Route::get('user/document/{document}/download', [\App\Http\Controllers\DocumentController::class, 'download']
    )->name('user.document.download');
    Route::delete('user/request/{id}', [OcdRequestController::class, 'destroy'])->name('user.request.destroy');
    Route::get('user/opportunity/show/{id}', [UserOpportunityController::class, 'show'])->name('user.opportunity.show');
    Route::get('opportunity/list', [OcdOpportunityController::class, 'list'])->name('opportunity.list');
    Route::get('opportunity/show/{id}', [OcdOpportunityController::class, 'show'])->name('opportunity.show');
});

Route::middleware(['auth', 'role:partner'])->group(function () {
    // Opportunity routes
    Route::get('opportunity/me/list', [OcdOpportunityController::class, 'mySubmittedList'])->name(
        'opportunity.me.list'
    );
    Route::get('opportunity/create', [OcdOpportunityController::class, 'create'])->name('partner.opportunity.create');
    Route::post('opportunity/store', [OcdOpportunityController::class, 'store'])->name('partner.opportunity.store');
    Route::get('opportunity/browse', [OcdOpportunityController::class, 'list'])->name('opportunity.browse');
    Route::patch('opportunity/{id}/status', [OcdOpportunityController::class, 'updateStatus'])->name(
        'partner.opportunity.status'
    );
    Route::delete('opportunity/{id}', [OcdOpportunityController::class, 'destroy'])->name(
        'partner.opportunity.destroy'
    );
    Route::get('request/list', [OcdRequestController::class, 'list'])->name('partner.request.list');
    Route::get('opportunity/edit/{id}', [OcdOpportunityController::class, 'edit'])->name('opportunity.edit');
});

Route::middleware(['auth', 'role:administrator'])->prefix('admin')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('admin.dashboard.index');
    Route::get('request/list', [AdminOcdRequestController::class, 'list'])->name('admin.request.list');
    Route::get('request/export/csv', [AdminOcdRequestController::class, 'exportCsv'])->name('admin.request.export.csv');
    Route::post('users/{user}/roles', [UserRoleController::class, 'update'])->name('admin.users.roles.update');
    Route::get('user/list', [UserRoleController::class, 'index'])->name('admin.users.roles.list');
});

Route::get('notifications', [\App\Http\Controllers\Admin\NotificationController::class, 'index'])->name(
    'admin.notifications.index'
);
Route::get('notifications/{notification}', [\App\Http\Controllers\Admin\NotificationController::class, 'show'])->name(
    'admin.notifications.show'
);
Route::patch(
    'notifications/{notification}/read',
    [\App\Http\Controllers\Admin\NotificationController::class, 'markAsRead']
)->name('admin.notifications.read');

Route::post('request/{request}/offer', [RequestOfferController::class, 'store'])->name('request.offer.store');
Route::get('request/{request}/offers', [RequestOfferController::class, 'list'])->name('request.offer.list');
Route::patch('request/{request}/offer/{offer}/status', [RequestOfferController::class, 'updateStatus'])->name(
    'request.offer.update-status'
);

Route::prefix('guide')->group(function (){
    Route::get('platform-guide.pdf', [UserGuideController::class, 'download'])->name('user.guide');
});

// Location data routes
Route::get('api/location-data', [LocationDataController::class, 'index'])->name('api.location-data');
Route::get(
    'api/location-data/implementation/{coverageActivity}',
    [LocationDataController::class, 'getImplementationLocationOptions']
)->name('api.location-data.implementation');
Route::get('api/partners', [RequestOfferController::class, 'partnersList'])->name('api.partners.list');


require __DIR__ . '/auth.php';
