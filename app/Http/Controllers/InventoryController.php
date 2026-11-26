<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\StockItem;
use App\Models\StockMovement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'brand' => ['nullable', 'integer', 'exists:brands,id'],
            'type' => ['nullable', 'string', 'max:100'],
            'stock' => ['nullable', Rule::in(['all', 'low', 'empty'])],
        ]);

        $items = StockItem::query()
            ->with('brand')
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('type', 'like', "%{$search}%")
                        ->orWhereHas('brand', fn ($brand) => $brand->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($filters['brand'] ?? null, fn ($query, int $brand) => $query->where('brand_id', $brand))
            ->when($filters['type'] ?? null, fn ($query, string $type) => $query->where('type', $type))
            ->when(($filters['stock'] ?? 'all') === 'low', fn ($query) => $query->whereBetween('stock', [1, 2]))
            ->when(($filters['stock'] ?? 'all') === 'empty', fn ($query) => $query->where('stock', '<=', 0))
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (StockItem $item) => [
                'id' => $item->id,
                'name' => $item->name,
                'type' => $item->type,
                'brand' => $item->brand->name,
                'stock' => $item->stock,
                'purchase_price' => $item->purchase_price,
                'selling_price' => $item->selling_price,
                'profit_per_unit' => $item->selling_price - $item->purchase_price,
            ]);

        return Inertia::render('inventory-index', [
            'items' => $items,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'brand' => isset($filters['brand']) ? (string) $filters['brand'] : 'all',
                'type' => $filters['type'] ?? 'all',
                'stock' => $filters['stock'] ?? 'all',
            ],
            'brands' => Brand::orderBy('name')->get(['id', 'name']),
            'types' => StockItem::query()->distinct()->orderBy('type')->pluck('type')->values(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('inventory-create', [
            'brands' => Brand::orderBy('name')->get(['id', 'name']),
            'types' => StockItem::query()->distinct()->orderBy('type')->pluck('type')->values(),
            'items' => StockItem::query()
                ->with('brand')
                ->orderBy('type')
                ->orderBy(Brand::select('name')->whereColumn('brands.id', 'stock_items.brand_id'))
                ->orderBy('name')
                ->get()
                ->map(fn (StockItem $item) => [
                    'id' => $item->id,
                    'label' => "{$item->type} {$item->brand->name} {$item->name}",
                    'type' => $item->type,
                    'brand' => $item->brand->name,
                    'name' => $item->name,
                    'stock' => $item->stock,
                    'purchase_price' => $item->purchase_price,
                    'selling_price' => $item->selling_price,
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'brand_id' => ['required', 'string', 'max:30'],
            'new_brand' => ['nullable', 'string', 'max:100'],
            'name' => ['required', 'string', 'max:150'],
            'type' => ['required', 'string', 'max:100'],
            'new_type' => ['nullable', 'string', 'max:100'],
            'stock' => ['required', 'integer', 'min:0'],
            'purchase_price' => ['required', 'integer', 'min:0'],
            'selling_price' => ['required', 'integer', 'min:0'],
        ]);

        if ($validated['brand_id'] === 'new' && blank($validated['new_brand'] ?? null)) {
            return back()->withErrors(['brand_id' => 'Pilih merk atau isi merk baru.'])->withInput();
        }

        if ($validated['brand_id'] !== 'new' && ! Brand::whereKey($validated['brand_id'])->exists()) {
            return back()->withErrors(['brand_id' => 'Merk yang dipilih tidak ditemukan.'])->withInput();
        }

        if ($validated['type'] === 'new' && blank($validated['new_type'] ?? null)) {
            return back()->withErrors(['type' => 'Pilih tipe barang atau isi tipe baru.'])->withInput();
        }

        $item = DB::transaction(function () use ($validated) {
            $brand = $validated['brand_id'] !== 'new'
                ? Brand::findOrFail($validated['brand_id'])
                : Brand::firstOrCreate(['name' => trim($validated['new_brand'])]);
            $type = $validated['type'] === 'new' ? trim($validated['new_type']) : $validated['type'];

            $item = StockItem::create([
                'brand_id' => $brand->id,
                'name' => $validated['name'],
                'type' => $type,
                'stock' => $validated['stock'],
                'purchase_price' => $validated['purchase_price'],
                'selling_price' => $validated['selling_price'],
            ]);

            if ($item->stock > 0) {
                StockMovement::create([
                    'stock_item_id' => $item->id,
                    'receipt_number' => null,
                    'type' => 'in',
                    'quantity' => $item->stock,
                    'purchase_price' => $item->purchase_price,
                    'selling_price' => $item->selling_price,
                    'notes' => 'Stok awal barang baru',
                    'happened_at' => now(),
                ]);
            }

            return $item;
        });

        return to_route('inventory.show', $item)->with('success', 'Barang baru berhasil ditambahkan.');
    }

    public function show(Request $request, StockItem $inventory): Response
    {
        $filters = $request->validate([
            'movement_sort' => ['nullable', 'string', Rule::in(['receipt_number', 'happened_at'])],
            'movement_direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
        ]);
        $movementSort = $filters['movement_sort'] ?? 'happened_at';
        $movementDirection = $filters['movement_direction'] ?? 'desc';

        $inventory->load('brand');

        return Inertia::render('inventory-show', [
            'item' => [
                'id' => $inventory->id,
                'name' => $inventory->name,
                'type' => $inventory->type,
                'brand' => $inventory->brand->name,
                'stock' => $inventory->stock,
                'purchase_price' => $inventory->purchase_price,
                'selling_price' => $inventory->selling_price,
                'profit_per_unit' => $inventory->selling_price - $inventory->purchase_price,
                'created_at' => $inventory->created_at->format('Y-m-d H:i'),
            ],
            'movements' => $inventory->movements()
                ->when($movementSort === 'receipt_number', fn ($query) => $query->orderByRaw('receipt_number IS NULL')->orderBy('receipt_number', $movementDirection)->latest('id'))
                ->when($movementSort === 'happened_at', fn ($query) => $query->orderBy('happened_at', $movementDirection)->latest('id'))
                ->limit(30)
                ->get()
                ->map(fn (StockMovement $movement) => [
                    'id' => $movement->id,
                    'receipt_number' => $movement->receipt_number,
                    'type' => $movement->type,
                    'quantity' => $movement->quantity,
                    'purchase_price' => $movement->purchase_price,
                    'selling_price' => $movement->selling_price,
                    'notes' => $movement->notes,
                    'happened_at' => $movement->happened_at->format('Y-m-d H:i'),
                ]),
            'movementSort' => [
                'sort' => $movementSort,
                'direction' => $movementDirection,
            ],
        ]);
    }

    public function movement(Request $request, StockItem $inventory): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(['in', 'out'])],
            'quantity' => ['required', 'integer', 'min:1'],
            'receipt_number' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        if ($validated['type'] === 'out' && $inventory->stock < $validated['quantity']) {
            return back()->withErrors(['quantity' => 'Stok tidak cukup untuk dikurangi sebanyak itu.'])->withInput();
        }

        DB::transaction(function () use ($inventory, $validated) {
            if ($validated['type'] === 'in') {
                $inventory->increment('stock', $validated['quantity']);
            } else {
                $inventory->decrement('stock', $validated['quantity']);
            }

            StockMovement::create([
                'stock_item_id' => $inventory->id,
                'receipt_number' => $validated['receipt_number'] ?? null,
                'type' => $validated['type'],
                'quantity' => $validated['quantity'],
                'purchase_price' => $inventory->purchase_price,
                'selling_price' => $inventory->selling_price,
                'notes' => $validated['notes'] ?? null,
                'happened_at' => now(),
            ]);
        });

        return back()->with('success', 'Stok berhasil diperbarui.');
    }

    public function adjust(Request $request, StockItem $inventory): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(['in', 'out'])],
            'quantity' => ['required', 'integer', 'min:0'],
            'purchase_price' => ['required', 'integer', 'min:0'],
            'selling_price' => ['required', 'integer', 'min:0'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        if ($validated['type'] === 'out' && $validated['quantity'] > 0 && blank($validated['notes'] ?? null)) {
            return back()->withErrors(['notes' => 'Catatan wajib diisi kalau stok dikurangi.'])->withInput();
        }

        if ($validated['type'] === 'out' && $inventory->stock < $validated['quantity']) {
            return back()->withErrors(['quantity' => 'Stok tidak cukup untuk dikurangi sebanyak itu.'])->withInput();
        }

        DB::transaction(function () use ($inventory, $validated) {
            $inventory->update([
                'purchase_price' => $validated['purchase_price'],
                'selling_price' => $validated['selling_price'],
            ]);

            if ($validated['quantity'] <= 0) {
                return;
            }

            if ($validated['type'] === 'in') {
                $inventory->increment('stock', $validated['quantity']);
            } else {
                $inventory->decrement('stock', $validated['quantity']);
            }

            StockMovement::create([
                'stock_item_id' => $inventory->id,
                'receipt_number' => null,
                'type' => $validated['type'],
                'quantity' => $validated['quantity'],
                'purchase_price' => $validated['purchase_price'],
                'selling_price' => $validated['selling_price'],
                'notes' => $validated['notes'] ?? ($validated['type'] === 'in' ? 'Barang datang / restock' : null),
                'happened_at' => now(),
            ]);
        });

        return to_route('inventory.show', $inventory)->with('success', 'Barang berhasil diperbarui.');
    }

    public function destroy(StockItem $inventory): RedirectResponse
    {
        if ($inventory->sales()->exists()) {
            return back()->withErrors([
                'delete' => 'Barang ini sudah punya riwayat penjualan, jadi tidak bisa dihapus sebelum transaksi penjualannya dihapus.',
            ]);
        }

        $inventory->delete();

        return to_route('inventory.index')->with('success', 'Barang berhasil dihapus.');
    }
}
