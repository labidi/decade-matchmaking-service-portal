<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserRoleController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/User/List', [
            'users' => User::with('roles')->get(),
            'roles' => Role::all(),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'roles' => 'array',
            'roles.*' => 'string',
        ]);

        $user->syncRoles($data['roles'] ?? []);

        return response()->json([
            'message' => 'Roles updated successfully',
            'roles' => $user->roles->pluck('name'),
        ]);
    }
}
