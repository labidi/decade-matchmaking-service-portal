<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AssignRolesRequest;
use App\Http\Requests\Admin\BlockUserRequest;
use App\Http\Resources\Admin\UserDetailResource;
use App\Http\Resources\Admin\UserResource;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct(
        private readonly UserService $userService
    ) {
    }

    /**
     * Display users grid
     * @throws \Throwable
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', User::class);

        $searchFilters = $request->only(['search', 'status', 'role']);
        $sortFilters = $request->only(['sort', 'direction', 'per_page']);

        $users = $this->userService->getUsersPaginated($searchFilters, $sortFilters);
        $users->toResourceCollection(UserResource::class);

        return Inertia::render('Admin/User/Index', [
            'title' => 'User Management',
            'users' => $users,
            'filters' => $searchFilters,
            'sort' => $sortFilters,
            'availableRoles' => Role::all()->map(fn ($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'label' => ucfirst($role->name),
            ]),
            'statusOptions' => [
                ['value' => 'active', 'label' => 'Active'],
                ['value' => 'blocked', 'label' => 'Blocked'],
                ['value' => 'unverified', 'label' => 'Unverified'],
            ],
        ]);
    }

    /**
     * Show user details
     */
    public function show(User $user): Response
    {
        Gate::authorize('view', $user);

        $details = $this->userService->getUserDetails($user);

        return Inertia::render('Admin/User/Show', [
            'title' => 'User Details',
            'user' => new UserDetailResource((object) $details),
            'availableRoles' => Role::all()->map(fn ($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'label' => ucfirst($role->name),
            ]),
        ]);
    }

    /**
     * Assign roles to user
     */
    public function assignRoles(AssignRolesRequest $request, User $user)
    {
        Gate::authorize('assignRoles', $user);
        $user = $this->userService->assignRoles($user, $request->validated()['roles']);
        return to_route('admin.users.index')->with('success', 'Roles updated successfully');
    }

    /**
     * Block/unblock user
     */
    public function toggleBlock(BlockUserRequest $request, User $user)
    {
        Gate::authorize('block', $user);

        $data = $request->validated();
        $user = $this->userService->toggleBlockStatus($user, $data['blocked']);
        $action = $data['blocked'] ? 'blocked' : 'unblocked';
        return to_route('admin.users.index')->with('success', "User $action successfully");
    }
}
