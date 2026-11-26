<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StockItem extends Model
{
    protected $fillable = [
        'brand_id',
        'name',
        'type',
        'stock',
        'purchase_price',
        'selling_price',
    ];

    protected function casts(): array
    {
        return [
            'stock' => 'integer',
            'purchase_price' => 'integer',
            'selling_price' => 'integer',
        ];
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function movements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }
}
