<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\RequestController;
use Inertia\Inertia;


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
    ]);
})->name('index');


Route::middleware(['auth'])->group(function () {
    Route::get('request/create',[RequestController::class, 'create'] )->name('request.create');
    Route::get('request/list',[RequestController::class, 'list'])->name('request.list');
    Route::post('request/save_draft', [RequestController::class, 'saveDraft'])->name('request.save_draft');
});




Route::post('login', [LoginController::class, 'login'])->name('login.post');


require __DIR__ . '/auth.php';
