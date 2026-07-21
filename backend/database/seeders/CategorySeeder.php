<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $categories = [
            ['name' => 'Conference', 'slug' => 'conference', 'icon' => 'presentation'],
            ['name' => 'Concert', 'slug' => 'concert', 'icon' => 'music'],
            ['name' => 'Workshop', 'slug' => 'workshop', 'icon' => 'wrench'],
            ['name' => 'Seminar', 'slug' => 'seminar', 'icon' => 'microphone'],
            ['name' => 'Festival', 'slug' => 'festival', 'icon' => 'party'],
            ['name' => 'Sports', 'slug' => 'sports', 'icon' => 'trophy'],
            ['name' => 'Exhibition', 'slug' => 'exhibition', 'icon' => 'camera'],
            ['name' => 'Meetup', 'slug' => 'meetup', 'icon' => 'users'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
