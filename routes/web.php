<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Dashboard\IndexController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Index', [
        'title' => 'Welcome',
        'description' => 'Welcome to our application.',
    ]);
});
