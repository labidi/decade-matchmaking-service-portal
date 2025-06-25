<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Dashboard\IndexController;
use App\Http\Controllers\OcdRequestController;
use Inertia\Inertia;
use App\Http\Controllers\Partner\OpportunityController as PartnerOpportunityController;
use App\Http\Controllers\User\OpportunityController as UserOpportunityController;
use App\Http\Controllers\OcdOpportunityController;
use App\Http\Controllers\UserGuideController;
use App\Http\Controllers\Admin\UserRoleController;
use App\Http\Controllers\RequestOfferController;

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

Route::get('user-guide', [UserGuideController::class, 'download'])->name('user.guide');


Route::middleware(['auth', 'role:user'])->group(function () {

    Route::get('home', IndexController::class)->name('user.home');
    Route::get('user/request/create', [OcdRequestController::class, 'create'])->name('user.request.create');
    Route::get('user/request/myrequests', [OcdRequestController::class, 'myRequestsList'])->name('user.request.myrequests');
    Route::get('user/request/edit/{id}', [OcdRequestController::class, 'edit'])->name('user.request.edit');
    Route::get('user/request/show/{id}', [OcdRequestController::class, 'show'])->name('user.request.show');

    Route::get('user/request/pdf/{id}', [OcdRequestController::class, 'exportPdf'])->name('user.request.pdf');
    Route::post('user/request/submit', [OcdRequestController::class, 'submit'])->name('user.request.submit');

    Route::patch('user/request/{id}/status', [OcdRequestController::class, 'updateStatus'])->name('user.request.status');
    Route::post('user/request/{request}/document', [\App\Http\Controllers\DocumentController::class, 'store'])->name('user.request.document.store');
    Route::delete('user/document/{document}', [\App\Http\Controllers\DocumentController::class, 'destroy'])->name('user.document.destroy');
    Route::get('user/document/{document}/download', [\App\Http\Controllers\DocumentController::class, 'download'])->name('user.document.download');
    Route::delete('user/request/{id}', [OcdRequestController::class, 'destroy'])->name('user.request.destroy');
    Route::get('user/opportunity/list', [UserOpportunityController::class, 'list'])->name('user.opportunity.list');
    Route::get('user/opportunity/show/{id}', [UserOpportunityController::class, 'show'])->name('user.opportunity.show');
    Route::get('opportunity/list', [OcdOpportunityController::class, 'list'])->name('opportunity.list');
    Route::get('opportunity/show/{id}', [OcdOpportunityController::class, 'show'])->name('opportunity.show');
});

Route::middleware(['auth', 'role:partner'])->group(function () {

    // Opportunity routes
    Route::get('opportunity/me/list', [OcdOpportunityController::class, 'mySubmittedList'])->name('opportunity.me.list');
    Route::get('opportunity/create', [OcdOpportunityController::class, 'create'])->name('partner.opportunity.create');
    Route::post('opportunity/store', [OcdOpportunityController::class, 'store'])->name('partner.opportunity.store');
    Route::get('opportunity/browse', [OcdOpportunityController::class, 'list'])->name('opportunity.browse');
    Route::patch('opportunity/{id}/status', [OcdOpportunityController::class, 'updateStatus'])->name('partner.opportunity.status');
    Route::delete('opportunity/{id}', [OcdOpportunityController::class, 'destroy'])->name('partner.opportunity.destroy');
    Route::get('request/list', [OcdRequestController::class, 'list'])->name('partner.request.list');
    Route::get('opportunity/edit/{id}', [OcdOpportunityController::class, 'edit'])->name('opportunity.edit');
    Route::get('request/me/matchedrequests', [OcdRequestController::class, 'matchedRequest'])->name('request.me.matchedrequests');
});

// Route::middleware(['auth', 'role:administrator'])->prefix('admin')->group(function () {
Route::get('users', [UserRoleController::class, 'index'])->name('admin.users.index');
Route::post('users/{user}/roles', [UserRoleController::class, 'update'])->name('admin.users.roles.update');
Route::post('request/{request}/offer', [RequestOfferController::class, 'store'])->name('admin.request.offer.store');
// });



require __DIR__ . '/auth.php';
