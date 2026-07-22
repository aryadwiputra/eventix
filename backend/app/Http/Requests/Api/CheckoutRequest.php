<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'event_id' => ['required', 'exists:events,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.ticket_id' => ['required', 'exists:tickets,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:20'],
        ];
    }
}
