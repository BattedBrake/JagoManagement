import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { PackageCheck, Save, Search, X } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Semua Barang', href: '/inventory' },
    { title: 'Tambah Barang', href: '/inventory/create' },
];

type Brand = { id: number; name: string };
type ExistingItem = { id: number; label: string; type: string; brand: string; name: string; stock: number; purchase_price: number; selling_price: number };
type Props = { brands: Brand[]; types: string[]; items: ExistingItem[] };

export default function InventoryCreate({ brands, types, items }: Props) {
    const [mode, setMode] = useState<'new' | 'existing'>('new');
    const { data, setData, post, processing, errors } = useForm({
        brand_id: '',
        new_brand: '',
        name: '',
        type: '',
        new_type: '',
        stock: '0',
        purchase_price: '',
        selling_price: '',
    });
    const existingForm = useForm({
        type: 'in',
        quantity: '0',
        purchase_price: '',
        selling_price: '',
        notes: '',
    });
    const [typeQuery, setTypeQuery] = useState('');
    const [brandQuery, setBrandQuery] = useState('');
    const [itemQuery, setItemQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<ExistingItem | null>(null);
    const [showTypeSuggestions, setShowTypeSuggestions] = useState(false);
    const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
    const [showItemSuggestions, setShowItemSuggestions] = useState(false);

    const typeSuggestions = useMemo(() => {
        const query = typeQuery.trim().toLowerCase();

        if (!query) {
            return types.slice(0, 8);
        }

        return types.filter((type) => type.toLowerCase().includes(query)).slice(0, 8);
    }, [types, typeQuery]);

    const brandSuggestions = useMemo(() => {
        const query = brandQuery.trim().toLowerCase();

        if (!query) {
            return brands.slice(0, 8);
        }

        return brands.filter((brand) => brand.name.toLowerCase().includes(query)).slice(0, 8);
    }, [brands, brandQuery]);

    const selectedBrand = brands.find((brand) => String(brand.id) === data.brand_id);
    const itemSuggestions = useMemo(() => {
        const query = itemQuery.trim().toLowerCase();

        if (!query) {
            return items.slice(0, 8);
        }

        return items.filter((item) => item.label.toLowerCase().includes(query)).slice(0, 8);
    }, [items, itemQuery]);

    function updateTypeQuery(value: string) {
        setTypeQuery(value);
        setShowTypeSuggestions(true);
        setData({
            ...data,
            type: value.trim() ? 'new' : '',
            new_type: value,
        });
    }

    function updateBrandQuery(value: string) {
        setBrandQuery(value);
        setShowBrandSuggestions(true);
        setData({
            ...data,
            brand_id: value.trim() ? 'new' : '',
            new_brand: value,
        });
    }

    function selectType(type: string) {
        setTypeQuery(type);
        setShowTypeSuggestions(false);
        setData({
            ...data,
            type,
            new_type: '',
        });
    }

    function selectBrand(brand: Brand) {
        setBrandQuery(brand.name);
        setShowBrandSuggestions(false);
        setData({
            ...data,
            brand_id: String(brand.id),
            new_brand: '',
        });
    }

    function clearType() {
        setTypeQuery('');
        setShowTypeSuggestions(false);
        setData({
            ...data,
            type: '',
            new_type: '',
        });
    }

    function clearBrand() {
        setBrandQuery('');
        setShowBrandSuggestions(false);
        setData({
            ...data,
            brand_id: '',
            new_brand: '',
        });
    }

    function submit(event: FormEvent) {
        event.preventDefault();
        post(route('inventory.store'));
    }

    function selectExistingItem(item: ExistingItem) {
        setSelectedItem(item);
        setItemQuery(item.label);
        setShowItemSuggestions(false);
        existingForm.setData({
            type: 'in',
            quantity: '0',
            purchase_price: String(item.purchase_price),
            selling_price: String(item.selling_price),
            notes: '',
        });
    }

    function clearExistingItem() {
        setSelectedItem(null);
        setItemQuery('');
        setShowItemSuggestions(false);
        existingForm.setData({
            type: 'in',
            quantity: '0',
            purchase_price: '',
            selling_price: '',
            notes: '',
        });
    }

    function submitExisting(event: FormEvent) {
        event.preventDefault();

        if (!selectedItem) {
            return;
        }

        existingForm.post(route('inventory.adjust', selectedItem.id));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Barang" />
            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Tambah barang</h1>
                    <p className="text-sm text-muted-foreground">Tambahkan barang baru, atau update barang yang sudah ada saat stok datang/berkurang.</p>
                </div>
                <div className="grid max-w-4xl gap-2 rounded-md border bg-white/80 p-2 md:grid-cols-2 dark:bg-slate-950/70">
                    <Button type="button" variant={mode === 'new' ? 'default' : 'ghost'} onClick={() => setMode('new')}>Barang baru</Button>
                    <Button type="button" variant={mode === 'existing' ? 'default' : 'ghost'} onClick={() => setMode('existing')}>Barang sudah ada</Button>
                </div>
                {mode === 'existing' && (
                    <Card className="max-w-4xl rounded-md">
                        <CardHeader><CardTitle className="text-base">Update barang yang sudah ada</CardTitle></CardHeader>
                        <CardContent>
                            <form onSubmit={submitExisting} className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="existing_item">Cari barang</Label>
                                    <div
                                        className="relative"
                                        onBlur={(event) => {
                                            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                                                setShowItemSuggestions(false);
                                            }
                                        }}
                                    >
                                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="existing_item"
                                            value={itemQuery}
                                            onChange={(event) => {
                                                setItemQuery(event.target.value);
                                                setSelectedItem(null);
                                                setShowItemSuggestions(true);
                                            }}
                                            onFocus={() => setShowItemSuggestions(true)}
                                            placeholder="Ketik tipe, merk, atau nama barang"
                                            className="pl-9 pr-10"
                                            autoComplete="off"
                                        />
                                        {itemQuery && (
                                            <button type="button" onClick={clearExistingItem} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
                                                <X className="size-4" />
                                                <span className="sr-only">Reset barang</span>
                                            </button>
                                        )}
                                        {showItemSuggestions && (
                                            <div className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-md border bg-popover p-1 text-sm shadow-md">
                                                {itemSuggestions.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        className="flex w-full items-center justify-between gap-3 rounded-sm px-3 py-2 text-left hover:bg-accent"
                                                        onMouseDown={(event) => event.preventDefault()}
                                                        onClick={() => selectExistingItem(item)}
                                                    >
                                                        <span className="font-medium">{item.label}</span>
                                                        <span className="shrink-0 text-xs text-muted-foreground">Stok {item.stock}</span>
                                                    </button>
                                                ))}
                                                {itemSuggestions.length === 0 && <div className="px-3 py-2 text-muted-foreground">Barang tidak ditemukan. Pakai tab Barang baru untuk membuat barang.</div>}
                                            </div>
                                        )}
                                    </div>
                                    {selectedItem && <p className="text-xs text-muted-foreground">Dipilih: {selectedItem.label} - stok sekarang {selectedItem.stock}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="existing_purchase_price">Harga beli</Label>
                                    <Input id="existing_purchase_price" type="number" min="0" value={existingForm.data.purchase_price} onChange={(event) => existingForm.setData('purchase_price', event.target.value)} />
                                    <InputError message={existingForm.errors.purchase_price} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="existing_selling_price">Harga jual</Label>
                                    <Input id="existing_selling_price" type="number" min="0" value={existingForm.data.selling_price} onChange={(event) => existingForm.setData('selling_price', event.target.value)} />
                                    <InputError message={existingForm.errors.selling_price} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Jenis stok</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button type="button" variant={existingForm.data.type === 'in' ? 'default' : 'outline'} onClick={() => existingForm.setData('type', 'in')}>Tambah</Button>
                                        <Button type="button" variant={existingForm.data.type === 'out' ? 'default' : 'outline'} onClick={() => existingForm.setData('type', 'out')}>Kurang</Button>
                                    </div>
                                    <InputError message={existingForm.errors.type} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="existing_quantity">Jumlah</Label>
                                    <Input id="existing_quantity" type="number" min="0" value={existingForm.data.quantity} onChange={(event) => existingForm.setData('quantity', event.target.value)} />
                                    <InputError message={existingForm.errors.quantity} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="existing_notes">Catatan</Label>
                                    <Input
                                        id="existing_notes"
                                        value={existingForm.data.notes}
                                        onChange={(event) => existingForm.setData('notes', event.target.value)}
                                        placeholder={existingForm.data.type === 'out' ? 'Wajib: contoh barang rusak, retur, stok opname' : 'Opsional: contoh barang datang dari supplier'}
                                    />
                                    <InputError message={existingForm.errors.notes} />
                                </div>
                                <div className="flex gap-2 md:col-span-2">
                                    <Button type="submit" disabled={existingForm.processing || !selectedItem}>
                                        <PackageCheck className="size-4" /> Simpan update barang
                                    </Button>
                                    <Button asChild variant="outline"><Link href={route('inventory.index')}>Batal</Link></Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
                {mode === 'new' && <Card className="max-w-4xl rounded-md">
                    <CardHeader><CardTitle className="text-base">Data barang</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="type_query">Tipe barang</Label>
                                <div
                                    className="relative"
                                    onBlur={(event) => {
                                        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                                            setShowTypeSuggestions(false);
                                        }
                                    }}
                                >
                                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="type_query"
                                        value={typeQuery}
                                        onChange={(event) => updateTypeQuery(event.target.value)}
                                        onFocus={() => setShowTypeSuggestions(true)}
                                        placeholder="Ketik tipe barang"
                                        className="pl-9 pr-10"
                                        autoComplete="off"
                                    />
                                    {typeQuery && (
                                        <button type="button" onClick={clearType} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
                                            <X className="size-4" />
                                            <span className="sr-only">Reset tipe</span>
                                        </button>
                                    )}
                                    {showTypeSuggestions && (
                                        <div className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-md border bg-popover p-1 text-sm shadow-md">
                                            {typeSuggestions.map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    className="flex w-full items-center rounded-sm px-3 py-2 text-left hover:bg-accent"
                                                    onMouseDown={(event) => event.preventDefault()}
                                                    onClick={() => selectType(type)}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                            {typeQuery.trim() && (
                                                <button
                                                    type="button"
                                                    className="flex w-full items-center rounded-sm px-3 py-2 text-left font-medium text-emerald-700 hover:bg-emerald-50"
                                                    onMouseDown={(event) => event.preventDefault()}
                                                    onClick={() => {
                                                        updateTypeQuery(typeQuery);
                                                        setShowTypeSuggestions(false);
                                                    }}
                                                >
                                                    Pakai tipe baru: {typeQuery}
                                                </button>
                                            )}
                                            {typeSuggestions.length === 0 && !typeQuery.trim() && <div className="px-3 py-2 text-muted-foreground">Belum ada tipe tersimpan.</div>}
                                        </div>
                                    )}
                                </div>
                                <InputError message={errors.type || errors.new_type} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="brand_query">Merk</Label>
                                <div
                                    className="relative"
                                    onBlur={(event) => {
                                        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                                            setShowBrandSuggestions(false);
                                        }
                                    }}
                                >
                                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="brand_query"
                                        value={brandQuery}
                                        onChange={(event) => updateBrandQuery(event.target.value)}
                                        onFocus={() => setShowBrandSuggestions(true)}
                                        placeholder="Ketik merk"
                                        className="pl-9 pr-10"
                                        autoComplete="off"
                                    />
                                    {brandQuery && (
                                        <button type="button" onClick={clearBrand} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
                                            <X className="size-4" />
                                            <span className="sr-only">Reset merk</span>
                                        </button>
                                    )}
                                    {showBrandSuggestions && (
                                        <div className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-md border bg-popover p-1 text-sm shadow-md">
                                            {brandSuggestions.map((brand) => (
                                                <button
                                                    key={brand.id}
                                                    type="button"
                                                    className="flex w-full items-center rounded-sm px-3 py-2 text-left hover:bg-accent"
                                                    onMouseDown={(event) => event.preventDefault()}
                                                    onClick={() => selectBrand(brand)}
                                                >
                                                    {brand.name}
                                                </button>
                                            ))}
                                            {brandQuery.trim() && (
                                                <button
                                                    type="button"
                                                    className="flex w-full items-center rounded-sm px-3 py-2 text-left font-medium text-emerald-700 hover:bg-emerald-50"
                                                    onMouseDown={(event) => event.preventDefault()}
                                                    onClick={() => {
                                                        updateBrandQuery(brandQuery);
                                                        setShowBrandSuggestions(false);
                                                    }}
                                                >
                                                    Pakai merk baru: {brandQuery}
                                                </button>
                                            )}
                                            {brandSuggestions.length === 0 && !brandQuery.trim() && <div className="px-3 py-2 text-muted-foreground">Belum ada merk tersimpan.</div>}
                                        </div>
                                    )}
                                </div>
                                {selectedBrand && <p className="text-xs text-muted-foreground">Dipilih: {selectedBrand.name}</p>}
                                <InputError message={errors.brand_id || errors.new_brand} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama barang</Label>
                                <Input id="name" value={data.name} onChange={(event) => setData('name', event.target.value)} />
                                <InputError message={errors.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stock">Stok awal</Label>
                                <Input id="stock" type="number" min="0" value={data.stock} onChange={(event) => setData('stock', event.target.value)} />
                                <InputError message={errors.stock} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="purchase_price">Harga beli</Label>
                                <Input id="purchase_price" type="number" min="0" value={data.purchase_price} onChange={(event) => setData('purchase_price', event.target.value)} />
                                <InputError message={errors.purchase_price} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="selling_price">Harga jual</Label>
                                <Input id="selling_price" type="number" min="0" value={data.selling_price} onChange={(event) => setData('selling_price', event.target.value)} />
                                <InputError message={errors.selling_price} />
                            </div>
                            <div className="flex gap-2 md:col-span-2">
                                <Button type="submit" disabled={processing}><Save className="size-4" /> Simpan</Button>
                                <Button asChild variant="outline"><Link href={route('inventory.index')}>Batal</Link></Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>}
            </div>
        </AppLayout>
    );
}
