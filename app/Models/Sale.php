<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Sale extends Model
{
    protected $fillable = [
        'stock_item_id',
        'receipt_number',
        'sold_at',
        'quantity',
        'purchase_price',
        'selling_price',
        'profit',
    ];

    protected function casts(): array
    {
        return [
            'sold_at' => 'date',
            'quantity' => 'integer',
            'purchase_price' => 'integer',
            'selling_price' => 'integer',
            'profit' => 'integer',
        ];
    }

    public function stockItem(): BelongsTo
    {
        return $this->belongsTo(StockItem::class);
    }
}
