<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Dashboard\IndexController;
use App\Http\Controllers\OcdRequestController;
use Inertia\Inertia;
use App\Http\Controllers\Partner\OpportunityController as PartnerOpportunityController;
use App\Http\Controllers\User\OpportunityController as UserOpportunityController;
use App\Http\Controllers\Partner\OpportunityController;
use App\Http\Controllers\UserGuideController;
use App\Http\Controllers\Admin\UserRoleController;

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
        'metrics' => [
            'number_of_open_partner_opertunities' => 63,
            'number_successful_matches' => 23,
            'number_fully_closed_matches' => 12,
            'number_user_requests_in_implementation' => 12,
            'committed_funding_amount' => 200000,
            'number_of_open_partner_opertunities' => 10,
        ]
    ]);
})->name('index');

Route::get('user-guide', [UserGuideController::class, 'download'])->name('user.guide');


Route::middleware(['auth', 'role:user'])->group(function () {

    Route::get('dashboard', IndexController::class)->name('dashboard');
    Route::get('user/request/create', [OcdRequestController::class, 'create'])->name('user.request.create');
    Route::get('user/request/myrequests', [OcdRequestController::class, 'myRequestsList'])->name('user.request.myrequests');
    Route::get('user/request/edit/{id}', [OcdRequestController::class, 'edit'])->name('user.request.edit');
    Route::get('user/request/show/{id}', [OcdRequestController::class, 'show'])->name('user.request.show');
    Route::post('user/request/submit/{mode?}', [OcdRequestController::class, 'submit'])->name('user.request.submit');
    Route::post('user/request/{request}/document', [\App\Http\Controllers\DocumentController::class, 'store'])->name('user.request.document.store');
    Route::get('user/opportunity/list', [UserOpportunityController::class, 'list'])->name('user.opportunity.list');
    Route::get('user/opportunity/show/{id}', [UserOpportunityController::class, 'show'])->name('user.opportunity.show');
});

Route::middleware(['auth', 'role:partner'])->group(function () {
    
    // Opportunity routes
    Route::get('partner/opportunity/create', [PartnerOpportunityController::class, 'create'])->name('partner.opportunity.create');
    Route::post('partner/opportunity/store', [PartnerOpportunityController::class, 'store'])->name('partner.opportunity.store');
    Route::get('partner/opportunity/list', [PartnerOpportunityController::class, 'list'])->name('partner.opportunity.list');
    Route::get('partner/opportunity/show/{id}', [PartnerOpportunityController::class, 'show'])->name('partner.opportunity.show');
    Route::get('partner/request/list', [OcdRequestController::class, 'list'])->name('partner.request.list');
    Route::get('partner/request/matchedrequests', [OcdRequestController::class, 'matchedRequest'])->name('partner.request.matchedrequests');
});

// Route::middleware(['auth', 'role:administrator'])->prefix('admin')->group(function () {
    Route::get('users', [UserRoleController::class, 'index'])->name('admin.users.index');
    Route::post('users/{user}/roles', [UserRoleController::class, 'update'])->name('admin.users.roles.update');
// });



require __DIR__ . '/auth.php';
