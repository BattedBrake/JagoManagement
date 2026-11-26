<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    protected $fillable = [
        'stock_item_id',
        'receipt_number',
        'type',
        'quantity',
        'purchase_price',
        'selling_price',
        'notes',
        'happened_at',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'purchase_price' => 'integer',
            'selling_price' => 'integer',
            'happened_at' => 'datetime',
        ];
    }

    public function stockItem(): BelongsTo
    {
        return $this->belongsTo(StockItem::class);
    }
}
