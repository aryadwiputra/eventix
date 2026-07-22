<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\Ticket;
use Illuminate\Database\Eloquent\Factories\Factory;

class TicketFactory extends Factory
{
    protected $model = Ticket::class;

    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'name' => fake()->words(3, true),
            'price' => fake()->numberBetween(50000, 500000),
            'quantity' => fake()->numberBetween(10, 500),
        ];
    }
}
