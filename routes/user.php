<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\UserRoleController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:administrator'])->prefix('admin')->group(function () {
    Route::get('users/', [UserController::class, 'index'])->name('admin.users.index');
    Route::get('users/{user}', [UserController::class, 'show'])->name('admin.users.show');
    Route::post('users/{user}/roles', [UserController::class, 'assignRoles'])->name('users.roles.assign');
    Route::post('users/{user}/block', [UserController::class, 'toggleBlock'])->name('users.block.toggle');

    // Legacy user role routes (backward compatibility)
//    Route::post('users/{user}/roles', [UserRoleController::class, 'update'])->name('admin.users.roles.update');
    Route::get('user/list', [UserRoleController::class, 'index'])->name('admin.users.roles.list');
});
