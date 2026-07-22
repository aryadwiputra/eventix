<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\RoleController;
use App\Http\Controllers\Api\Admin\TransactionController;
use App\Http\Controllers\Api\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('jwt.auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

Route::get('events', [EventController::class, 'index']);
Route::get('events/{event}', [EventController::class, 'show']);

Route::prefix('admin')->middleware(['jwt.auth'])->group(function () {
    Route::apiResource('users', UserController::class)->middleware('permission:users.manage');
    Route::apiResource('roles', RoleController::class)->middleware('permission:roles.manage');
    Route::apiResource('categories', CategoryController::class)->middleware('permission:settings.manage');

    Route::get('transactions', [TransactionController::class, 'index'])->middleware('permission:transactions.read');
    Route::get('transactions/{transaction}', [TransactionController::class, 'show'])->middleware('permission:transactions.read');
    Route::put('transactions/{transaction}/status', [TransactionController::class, 'updateStatus'])->middleware('permission:transactions.update');

    Route::get('events', [EventController::class, 'index'])->middleware('permission:events.read');
    Route::get('events/{event}', [EventController::class, 'show'])->middleware('permission:events.read');
    Route::post('events', [EventController::class, 'store'])->middleware('permission:events.create');
    Route::put('events/{event}', [EventController::class, 'update'])->middleware('permission:events.update');
    Route::delete('events/{event}', [EventController::class, 'destroy'])->middleware('permission:events.delete');

    Route::get('events/{event}/tickets', [TicketController::class, 'index'])->middleware('permission:tickets.read');
    Route::get('events/{event}/tickets/{ticket}', [TicketController::class, 'show'])->middleware('permission:tickets.read');
    Route::post('events/{event}/tickets', [TicketController::class, 'store'])->middleware('permission:tickets.create');
    Route::put('events/{event}/tickets/{ticket}', [TicketController::class, 'update'])->middleware('permission:tickets.update');
    Route::delete('events/{event}/tickets/{ticket}', [TicketController::class, 'destroy'])->middleware('permission:tickets.delete');
});
