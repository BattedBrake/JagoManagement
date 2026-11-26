<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $recentSales = Sale::query()
            ->with('stockItem.brand')
            ->latest('sold_at')
            ->latest('id')
            ->limit(6)
            ->get()
            ->map(fn (Sale $sale) => [
                'id' => $sale->id,
                'receipt_number' => $sale->receipt_number,
                'sold_at' => $sale->sold_at->format('Y-m-d'),
                'item_name' => $sale->stockItem->name,
                'type' => $sale->stockItem->type,
                'brand_name' => $sale->stockItem->brand->name,
                'quantity' => $sale->quantity,
                'profit' => $sale->profit,
            ]);

        return Inertia::render('dashboard', [
            'recentSales' => $recentSales,
        ]);
    }
}
