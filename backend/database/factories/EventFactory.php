<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Event;
use App\Models\Organizer;
use Illuminate\Database\Eloquent\Factories\Factory;

class EventFactory extends Factory
{
    protected $model = Event::class;

    public function definition(): array
    {
        return [
            'organizer_id' => Organizer::factory(),
            'category_id' => Category::factory(),
            'name' => fake()->sentence(3),
            'headline' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'start_time' => fake()->dateTimeBetween('+1 week', '+2 months'),
            'end_time' => fake()->dateTimeBetween('+2 months', '+3 months'),
            'location' => fake()->city(),
            'type' => 'offline',
            'status' => Event::STATUS_PUBLISHED,
            'is_popular' => false,
        ];
    }
}
