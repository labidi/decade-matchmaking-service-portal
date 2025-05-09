<?php

use App\Http\Controllers\Dashboard\IndexController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Index', [
        'title' => 'Welcome',
        'description' => 'Welcome to our application.',
    ]);
});


Route::get('request/create', function () {
    return Inertia::render('Request/Create', [
        'title' => 'Create a new request',
        'breadcrumbs'=> [
            ['name' => 'Home', 'url' => '/'],
            ['name' => 'Create Request', 'url' => '/request/create'],
        ],
    ]);
});
