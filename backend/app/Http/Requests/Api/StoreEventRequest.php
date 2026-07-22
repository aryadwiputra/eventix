<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:3', 'max:255'],
            'headline' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'start_time' => ['required', 'date', 'after:now'],
            'end_time' => ['sometimes', 'date', 'after:start_time'],
            'location' => ['required_if:type,offline', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:offline,online'],
            'category_id' => ['sometimes', 'exists:categories,id'],
            'meeting_link' => ['required_if:type,online', 'url'],
            'photos' => ['sometimes', 'array'],
            'photos.*' => ['url'],
            'is_popular' => ['sometimes', 'boolean'],
        ];
    }
}
