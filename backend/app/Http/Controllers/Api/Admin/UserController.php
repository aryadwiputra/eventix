<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\StoreUserRequest;
use App\Http\Requests\Api\Admin\UpdateUserRequest;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $users = User::with('roles')
            ->when($request->search, fn ($q, $search) => $q->whereAny(['name', 'email'], 'like', "%{$search}%"))
            ->paginate($request->per_page ?? 15);

        return $this->success($users);
    }

    public function show(User $user): JsonResponse
    {
        return $this->success($user->load('roles'));
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = User::create($request->safe()->except('role_ids'));

        if ($request->has('role_ids')) {
            $user->roles()->sync($request->role_ids);
        }

        return $this->created($user->load('roles'), 'User created successfully');
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $data = $request->safe()->except('role_ids');

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        if ($request->has('role_ids')) {
            $user->roles()->sync($request->role_ids);
        }

        return $this->success($user->fresh()->load('roles'), 'User updated successfully');
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return $this->noContent();
    }
}
