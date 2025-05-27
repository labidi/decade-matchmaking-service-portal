<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\RequestController;
use Inertia\Inertia;
use App\Http\Controllers\OpportunityController;


Route::get('/', function () {
    return Inertia::render('Index', [
        'title' => 'Welcome',
        'description' => "",
        'banner' => [
            'title' => 'Connect for a Sustainable Ocean',
            'description' => "Whether you're seeking training or offering expertise, this platform makes the connection. It’s where organizations find support—and partners find purpose. By matching demand with opportunity, it brings the right people and resources together. A transparent marketplace driving collaboration, innovation, and impact.",
            'image' => 'http://portal_dev.local/assets/img/sidebar.png'
        ],
        'YoutubeEmbed' => [
            'src' => 'https://www.youtube.com/embed/nfpELa_Jqb0?si=S_imyR0XV4F6YcpU',
            'title' => 'Connect for a Sustainable Ocean'
        ],
        'userguide' => [
            'description' => 'A user guide to help you navigate the platform.',
            'url' => 'http://portal_dev.local/assets/img/user_guide.png',
        ],
        'metrics'=> [
            'number_of_open_partner_opertunities' => 63,
            'number_successful_matches' => 23,
            'number_fully_closed_matches' => 12,
            'number_user_requests_in_implementation' => 12,
            'committed_funding_amount' => 200000,
            'number_of_open_partner_opertunities' => 10,
        ]
    ]);
})->name('index');


Route::middleware(['auth'])->group(function () {
    // OCD Requests routes
    Route::get('request/create',[RequestController::class, 'create'] )->name('request.create');
    Route::get('request/list',[RequestController::class, 'list'])->name('request.list');
    Route::get('request/edit/{id}',[RequestController::class, 'edit'])->name('request.edit');
    Route::get('request/show/{id}',[RequestController::class, 'show'])->name('request.show');
    Route::post('request/submit/{mode?}', [RequestController::class, 'submit'])->name('request.submit');

    // Opportunity routes
    Route::get('opportunity/create', [OpportunityController::class, 'create'])->name('opportunity.create');
    Route::post('opportunity/store', [OpportunityController::class, 'store'])->name('opportunity.store');
});



require __DIR__ . '/auth.php';
