<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\SalesController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::resource('inventory', InventoryController::class)->only(['index', 'create', 'store', 'show', 'destroy']);
    Route::post('inventory/{inventory}/movement', [InventoryController::class, 'movement'])->name('inventory.movement');
    Route::post('inventory/{inventory}/adjust', [InventoryController::class, 'adjust'])->name('inventory.adjust');

    Route::resource('sales', SalesController::class)->only(['index', 'create', 'store', 'show', 'destroy']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
