<?php

namespace App\Http\Requests\Api\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoleRequest extends FormRequest
{
    public function rules(): array
    {
        $roleId = $this->route('role');

        return [
            'name' => ['sometimes', 'string', 'min:3', 'max:255', 'unique:roles,name,' . $roleId],
            'guard_name' => ['sometimes', 'string'],
            'permission_ids' => ['sometimes', 'array'],
            'permission_ids.*' => ['exists:permissions,id'],
        ];
    }
}
