<?php

namespace Tests\Unit\Models;

use App\Models\Category;
use App\Models\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

describe('Category Model', function () {
    it('can create a category', function () {
        $category = Category::create([
            'name' => 'Conference',
            'slug' => 'conference',
        ]);

        expect($category->id)->toBeTruthy();
        expect($category->name)->toBe('Conference');
    });

    it('auto-generates slug if empty', function () {
        $category = Category::create([
            'name' => 'Music Concert',
        ]);

        expect($category->slug)->toBe('music-concert');
    });

    it('has unique slug', function () {
        Category::create(['name' => 'Workshop', 'slug' => 'workshop']);

        expect(fn () => Category::create(['name' => 'Workshop 2', 'slug' => 'workshop']))
            ->toThrow(\Illuminate\Database\QueryException::class);
    });

    it('has many events', function () {
        $category = Category::create(['name' => 'Test', 'slug' => 'test-cat']);

        expect($category->events)->toBeInstanceOf(\Illuminate\Database\Eloquent\Collection::class);
    });

    it('has default is_active true', function () {
        $category = Category::create(['name' => 'Active', 'slug' => 'active']);

        expect($category->fresh()->is_active)->toBeTrue();
    });

    it('uses soft deletes', function () {
        $category = Category::create(['name' => 'Temp', 'slug' => 'temp-cat']);
        $id = $category->id;
        $category->delete();

        expect(Category::find($id))->toBeNull();
        expect(Category::withTrashed()->find($id))->toBeTruthy();
    });
});
