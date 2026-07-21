<?php

namespace App\Http\Requests\Api\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryRequest extends FormRequest
{
    public function rules(): array
    {
        $categoryId = $this->route('category')?->getKey() ?? $this->route('category');

        return [
            'name' => ['sometimes', 'string', 'min:2', 'max:255', 'unique:categories,name,' . $categoryId],
            'icon' => ['sometimes', 'string', 'max:50'],
            'description' => ['sometimes', 'string', 'max:500'],
        ];
    }
}
