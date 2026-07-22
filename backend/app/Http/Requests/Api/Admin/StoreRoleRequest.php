<?php

namespace App\Http\Requests\Api\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoleRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:3', 'max:255', 'unique:roles,name'],
            'guard_name' => ['sometimes', 'string'],
            'permission_ids' => ['sometimes', 'array'],
            'permission_ids.*' => ['exists:permissions,id'],
        ];
    }
}
