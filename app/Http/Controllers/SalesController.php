<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Sale;
use App\Models\StockItem;
use App\Models\StockMovement;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SalesController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'month' => ['nullable', 'date_format:Y-m'],
            'sort' => ['nullable', 'string', Rule::in(['receipt_number', 'sold_at'])],
            'direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
        ]);

        $month = $filters['month'] ?? now()->format('Y-m');
        $sort = $filters['sort'] ?? 'sold_at';
        $direction = $filters['direction'] ?? 'desc';
        $monthStart = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $monthEnd = (clone $monthStart)->endOfMonth();

        $salesQuery = Sale::query()
            ->with('stockItem.brand')
            ->whereBetween('sold_at', [$monthStart->toDateString(), $monthEnd->toDateString()])
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('receipt_number', 'like', "%{$search}%")
                        ->orWhereHas('stockItem', fn ($item) => $item->where('name', 'like', "%{$search}%")
                            ->orWhere('type', 'like', "%{$search}%")
                            ->orWhereHas('brand', fn ($brand) => $brand->where('name', 'like', "%{$search}%")));
                });
            });

        $summary = (clone $salesQuery)
            ->selectRaw('COUNT(*) as transaction_count, COALESCE(SUM(quantity), 0) as sold_units, COALESCE(SUM(profit), 0) as profit')
            ->first();

        return Inertia::render('sales-index', [
            'sales' => $salesQuery
                ->when($sort === 'receipt_number', fn ($query) => $query->orderBy('receipt_number', $direction)->latest('id'))
                ->when($sort === 'sold_at', fn ($query) => $query->orderBy('sold_at', $direction)->latest('id'))
                ->paginate(12)
                ->withQueryString()
                ->through(fn (Sale $sale) => [
                    'id' => $sale->id,
                    'receipt_number' => $sale->receipt_number,
                    'sold_at' => $sale->sold_at->format('Y-m-d'),
                    'item_name' => $sale->stockItem->name,
                    'type' => $sale->stockItem->type,
                    'brand' => $sale->stockItem->brand->name,
                    'quantity' => $sale->quantity,
                    'purchase_price' => $sale->purchase_price,
                    'selling_price' => $sale->selling_price,
                    'profit' => $sale->profit,
                ]),
            'summary' => [
                'month' => $month,
                'transaction_count' => (int) $summary->transaction_count,
                'sold_units' => (int) $summary->sold_units,
                'profit' => (int) $summary->profit,
            ],
            'filters' => [
                'search' => $filters['search'] ?? '',
                'month' => $month,
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('sales-create', [
            'items' => StockItem::query()
                ->with('brand')
                ->orderBy('type')
                ->orderBy(Brand::select('name')->whereColumn('brands.id', 'stock_items.brand_id'))
                ->orderBy('name')
                ->get()
                ->map(fn (StockItem $item) => [
                    'id' => $item->id,
                    'label' => "{$item->type} - {$item->brand->name} - {$item->name}",
                    'stock' => $item->stock,
                    'purchase_price' => $item->purchase_price,
                    'selling_price' => $item->selling_price,
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'receipt_number' => ['required', 'string', 'max:100'],
            'sold_at' => ['required', 'date'],
            'stock_item_id' => ['required', 'integer', 'exists:stock_items,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'selling_price' => ['required', 'integer', 'min:0'],
        ]);

        $item = StockItem::findOrFail($validated['stock_item_id']);

        if ($item->stock < $validated['quantity']) {
            return back()->withErrors(['quantity' => 'Stok barang tidak cukup untuk penjualan ini.'])->withInput();
        }

        DB::transaction(function () use ($item, $validated) {
            $purchasePrice = $item->purchase_price;
            $profit = ($validated['selling_price'] - $purchasePrice) * $validated['quantity'];

            $item->decrement('stock', $validated['quantity']);

            Sale::create([
                'stock_item_id' => $item->id,
                'receipt_number' => $validated['receipt_number'],
                'sold_at' => $validated['sold_at'],
                'quantity' => $validated['quantity'],
                'purchase_price' => $purchasePrice,
                'selling_price' => $validated['selling_price'],
                'profit' => $profit,
            ]);

            StockMovement::create([
                'stock_item_id' => $item->id,
                'receipt_number' => $validated['receipt_number'],
                'type' => 'sale',
                'quantity' => $validated['quantity'],
                'purchase_price' => $purchasePrice,
                'selling_price' => $validated['selling_price'],
                'notes' => 'Penjualan barang',
                'happened_at' => Carbon::parse($validated['sold_at'])->startOfDay(),
            ]);
        });

        return to_route('sales.index')->with('success', 'Penjualan berhasil dicatat dan stok otomatis berkurang.');
    }

    public function show(Sale $sale): Response
    {
        $sale->load('stockItem.brand');

        return Inertia::render('sales-show', [
            'sale' => [
                'id' => $sale->id,
                'receipt_number' => $sale->receipt_number,
                'sold_at' => $sale->sold_at->format('Y-m-d'),
                'quantity' => $sale->quantity,
                'purchase_price' => $sale->purchase_price,
                'selling_price' => $sale->selling_price,
                'profit' => $sale->profit,
                'item' => [
                    'id' => $sale->stockItem->id,
                    'name' => $sale->stockItem->name,
                    'type' => $sale->stockItem->type,
                    'brand' => $sale->stockItem->brand->name,
                    'stock' => $sale->stockItem->stock,
                ],
            ],
        ]);
    }

    public function destroy(Sale $sale): RedirectResponse
    {
        DB::transaction(function () use ($sale) {
            StockItem::whereKey($sale->stock_item_id)->increment('stock', $sale->quantity);

            $movement = StockMovement::query()
                ->where('stock_item_id', $sale->stock_item_id)
                ->where('receipt_number', $sale->receipt_number)
                ->where('type', 'sale')
                ->where('quantity', $sale->quantity)
                ->latest('id')
                ->first();

            $movement?->delete();

            $sale->delete();
        });

        return to_route('sales.index')->with('success', 'Penjualan berhasil dihapus dan stok dikembalikan.');
    }
}
