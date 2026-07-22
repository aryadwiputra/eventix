<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEventRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'min:3', 'max:255'],
            'headline' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'start_time' => ['sometimes', 'date', 'after:now'],
            'end_time' => ['sometimes', 'date', 'after:start_time'],
            'location' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', 'string', 'in:offline,online'],
            'category_id' => ['sometimes', 'exists:categories,id'],
            'meeting_link' => ['sometimes', 'url'],
            'photos' => ['sometimes', 'array'],
            'photos.*' => ['url'],
            'is_popular' => ['sometimes', 'boolean'],
        ];
    }
}
