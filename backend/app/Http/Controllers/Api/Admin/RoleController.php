<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\StoreRoleRequest;
use App\Http\Requests\Api\Admin\UpdateRoleRequest;
use App\Models\Role;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $roles = Role::with('permissions')->get();

        return $this->success($roles);
    }

    public function show(Role $role): JsonResponse
    {
        return $this->success($role->load('permissions'));
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = Role::create($request->safe()->except('permission_ids'));

        if ($request->has('permission_ids')) {
            $role->permissions()->sync($request->permission_ids);
        }

        return $this->created($role->load('permissions'), 'Role created successfully');
    }

    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $role->update($request->safe()->except('permission_ids'));

        if ($request->has('permission_ids')) {
            $role->permissions()->sync($request->permission_ids);
        }

        return $this->success($role->fresh()->load('permissions'), 'Role updated successfully');
    }

    public function destroy(Role $role): JsonResponse
    {
        $role->delete();

        return $this->noContent();
    }
}
