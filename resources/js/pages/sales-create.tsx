import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Search, Save } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penjualan', href: '/sales' },
    { title: 'Catat Penjualan', href: '/sales/create' },
];
const today = new Date().toISOString().slice(0, 10);
const money = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

type Item = { id: number; label: string; stock: number; purchase_price: number; selling_price: number };
type Props = { items: Item[] };

export default function SalesCreate({ items }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        receipt_number: '',
        sold_at: today,
        stock_item_id: '',
        quantity: '1',
        selling_price: '',
    });
    const [itemQuery, setItemQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const selected = useMemo(() => items.find((item) => String(item.id) === data.stock_item_id), [items, data.stock_item_id]);
    const suggestions = useMemo(() => {
        const query = itemQuery.trim().toLowerCase();

        if (!query) {
            return [];
        }

        return items
            .filter((item) => item.label.toLowerCase().includes(query))
            .slice(0, 8);
    }, [items, itemQuery]);
    const quantity = Number(data.quantity || 0);
    const sellingPrice = Number(data.selling_price || 0);
    const estimatedProfit = selected ? (sellingPrice - selected.purchase_price) * quantity : 0;

    function submit(event: FormEvent) {
        event.preventDefault();
        post(route('sales.store'));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Catat Penjualan" />
            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Catat penjualan</h1>
                    <p className="text-sm text-muted-foreground">Input nota penjualan, ketik barang, lalu stok otomatis berkurang.</p>
                </div>
                <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
                    <Card className="rounded-md">
                        <CardHeader><CardTitle className="text-base">Data nota</CardTitle></CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="receipt_number">No nota</Label>
                                    <Input id="receipt_number" value={data.receipt_number} onChange={(event) => setData('receipt_number', event.target.value)} />
                                    <InputError message={errors.receipt_number} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sold_at">Tanggal jual</Label>
                                    <Input id="sold_at" type="date" value={data.sold_at} onChange={(event) => setData('sold_at', event.target.value)} />
                                    <InputError message={errors.sold_at} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="item_query">Barang</Label>
                                    <div
                                        className="relative"
                                        onBlur={(event) => {
                                            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                                                setShowSuggestions(false);
                                            }
                                        }}
                                    >
                                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="item_query"
                                            value={itemQuery}
                                            onChange={(event) => {
                                                setItemQuery(event.target.value);
                                                setShowSuggestions(true);
                                                setData({
                                                    ...data,
                                                    stock_item_id: '',
                                                    selling_price: '',
                                                });
                                            }}
                                            onFocus={() => setShowSuggestions(true)}
                                            placeholder="Ketik tipe, merk, atau nama barang"
                                            className="pl-9"
                                            autoComplete="off"
                                        />
                                        {showSuggestions && itemQuery.trim() !== '' && (
                                            <div className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-md border bg-popover p-1 text-sm shadow-md">
                                                {suggestions.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        className="flex w-full items-center justify-between gap-3 rounded-sm px-3 py-2 text-left hover:bg-accent"
                                                        onMouseDown={(event) => event.preventDefault()}
                                                        onClick={() => {
                                                            setItemQuery(item.label);
                                                            setShowSuggestions(false);
                                                            setData({
                                                                ...data,
                                                                stock_item_id: String(item.id),
                                                                selling_price: String(item.selling_price),
                                                            });
                                                        }}
                                                    >
                                                        <span className="font-medium">{item.label}</span>
                                                        <span className="shrink-0 text-xs text-muted-foreground">Stok {item.stock}</span>
                                                    </button>
                                                ))}
                                                {suggestions.length === 0 && (
                                                    <div className="px-3 py-2 text-muted-foreground">Barang tidak ditemukan.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {selected && <p className="text-xs text-muted-foreground">Dipilih: {selected.label}</p>}
                                    <InputError message={errors.stock_item_id} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Jumlah</Label>
                                    <Input id="quantity" type="number" min="1" value={data.quantity} onChange={(event) => setData('quantity', event.target.value)} />
                                    <InputError message={errors.quantity} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="selling_price">Harga jual/unit</Label>
                                    <Input id="selling_price" type="number" min="0" value={data.selling_price} onChange={(event) => setData('selling_price', event.target.value)} />
                                    <InputError message={errors.selling_price} />
                                </div>
                                <div className="flex gap-2 md:col-span-2">
                                    <Button type="submit" disabled={processing || items.length === 0}><Save className="size-4" /> Simpan penjualan</Button>
                                    <Button asChild variant="outline"><Link href={route('sales.index')}>Batal</Link></Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="rounded-md">
                        <CardHeader><CardTitle className="text-base">Estimasi</CardTitle></CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-center justify-between"><span className="text-muted-foreground">Stok tersedia</span><span className="font-medium">{selected?.stock ?? 0}</span></div>
                            <div className="flex items-center justify-between"><span className="text-muted-foreground">Harga beli/unit</span><span className="font-medium">{money(selected?.purchase_price ?? 0)}</span></div>
                            <div className="flex items-center justify-between"><span className="text-muted-foreground">Subtotal jual</span><span className="font-medium">{money(sellingPrice * quantity)}</span></div>
                            <div className="flex items-center justify-between"><span className="text-muted-foreground">Laba nota</span><span className="font-semibold">{money(estimatedProfit)}</span></div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
